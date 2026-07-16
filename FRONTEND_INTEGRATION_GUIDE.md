# Frontend Integration Guide - Multi-Shop SaaS

**Target:** Update Smart Dairy ERP frontend to support shop switching  
**Status:** Backend Ready ✅ - Waiting for Frontend Integration  
**Difficulty:** Easy to Moderate  

---

## What Frontend Needs to Do

### 1. Store Tenant Information After Login

**Old Behavior:**
```javascript
// Before
const response = await login(username, password);
const token = response.data.accessToken;
localStorage.setItem('token', token);
```

**New Behavior:**
```javascript
// After
const response = await login(username, password);
const token = response.data.accessToken;
const defaultTenantUuid = response.data.defaultTenantUuid;
const accessibleTenants = response.data.accessibleTenants;

localStorage.setItem('token', token);
localStorage.setItem('tenantUuid', response.data.tenantUuid);         // Current shop
localStorage.setItem('defaultTenantUuid', defaultTenantUuid);         // Default shop
localStorage.setItem('accessibleTenants', JSON.stringify(accessibleTenants)); // All shops
```

---

### 2. Send Tenant Header with Every Request

**Update HTTP Interceptor:**

```javascript
// Angular HttpInterceptor Example
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class TenantInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Get current tenant from localStorage
    const tenantUuid = localStorage.getItem('tenantUuid');
    
    // Add header to request
    if (tenantUuid && !req.url.includes('/auth/login')) {
      req = req.clone({
        setHeaders: {
          'X-Tenant-Id': tenantUuid
        }
      });
    }
    
    return next.handle(req);
  }
}

// Register in providers
providers: [
  { provide: HTTP_INTERCEPTORS, useClass: TenantInterceptor, multi: true }
]
```

---

### 3. Display Shop Selector in Header

**Create Shop Selector Component:**

```typescript
// shop-selector.component.ts
import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';

interface Shop {
  uuid: string;
  code: string;
  name: string;
  role: string;
  isPrimary: boolean;
  isOwner: boolean;
  isAdmin: boolean;
}

@Component({
  selector: 'app-shop-selector',
  template: `
    <div class="shop-selector">
      <label>Current Shop:</label>
      <select [(ngModel)]="currentTenantUuid" (change)="switchShop()">
        <option *ngFor="let shop of myShops" 
                [value]="shop.uuid"
                [selected]="shop.isPrimary">
          {{ shop.name }} ({{ shop.role }})
          <span *ngIf="shop.isPrimary"> - Default</span>
        </option>
      </select>
    </div>
  `,
  styles: [`
    .shop-selector {
      display: flex;
      gap: 10px;
      padding: 10px;
      background: #f5f5f5;
      border-radius: 4px;
    }
    select {
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      cursor: pointer;
    }
  `]
})
export class ShopSelectorComponent implements OnInit {
  myShops: Shop[] = [];
  currentTenantUuid: string = '';

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.loadMyShops();
    this.currentTenantUuid = localStorage.getItem('tenantUuid') || '';
  }

  loadMyShops() {
    this.authService.getMyShops().subscribe(
      (shops: Shop[]) => {
        this.myShops = shops;
      },
      error => console.error('Failed to load shops', error)
    );
  }

  switchShop() {
    if (!this.currentTenantUuid) return;

    this.authService.switchShop(this.currentTenantUuid).subscribe(
      (response: any) => {
        // Update stored data
        localStorage.setItem('token', response.data.accessToken);
        localStorage.setItem('tenantUuid', response.data.tenantUuid);

        // Reload page to refresh all data with new tenant
        window.location.reload();
      },
      error => {
        console.error('Failed to switch shop', error);
        this.currentTenantUuid = localStorage.getItem('tenantUuid') || '';
      }
    );
  }
}
```

---

### 4. Update Auth Service

```typescript
// auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface LoginRequest {
  username: string;
  password: string;
  tenantUuid?: string;
}

interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    tokenType: string;
    expiresIn: number;
    username: string;
    role: string;
    tenantUuid: string;
    defaultTenantUuid: string;
    accessibleTenants: string[];
  };
}

interface Shop {
  uuid: string;
  code: string;
  name: string;
  role: string;
  isPrimary: boolean;
  isOwner: boolean;
  isAdmin: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = '/api';

  constructor(private http: HttpClient) {}

  login(username: string, password: string, tenantUuid?: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/v1/auth/login`, {
      username,
      password,
      tenantUuid
    });
  }

  getMyShops(): Observable<Shop[]> {
    return this.http.get<Shop[]>(`${this.apiUrl}/auth/my-shops`);
  }

  switchShop(tenantUuid: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.apiUrl}/auth/switch-shop/${tenantUuid}`,
      {}
    );
  }

  setPrimaryShop(tenantUuid: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/auth/set-primary-shop/${tenantUuid}`,
      {}
    );
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('tenantUuid');
    localStorage.removeItem('defaultTenantUuid');
    localStorage.removeItem('accessibleTenants');
  }

  getCurrentTenant(): string | null {
    return localStorage.getItem('tenantUuid');
  }

  getAccessibleTenants(): string[] {
    const tenants = localStorage.getItem('accessibleTenants');
    return tenants ? JSON.parse(tenants) : [];
  }
}
```

---

### 5. Update Login Component

```typescript
// login.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-login',
  template: `
    <form (ngSubmit)="onLogin()">
      <input [(ngModel)]="username" name="username" placeholder="Username" required>
      <input [(ngModel)]="password" name="password" type="password" placeholder="Password" required>
      
      <!-- Optional: Show available tenants to login to -->
      <div *ngIf="showTenantSelect">
        <label>Login to Shop (Optional):</label>
        <select [(ngModel)]="selectedTenant" name="selectedTenant">
          <option value="">Use Default Shop</option>
          <option *ngFor="let t of availableTenants" [value]="t">
            {{ t }}
          </option>
        </select>
      </div>
      
      <button type="submit">Login</button>
      <p *ngIf="errorMessage" class="error">{{ errorMessage }}</p>
    </form>
  `
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  selectedTenant: string = '';
  showTenantSelect: boolean = false;
  availableTenants: string[] = [];
  errorMessage: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onLogin() {
    this.authService.login(this.username, this.password, this.selectedTenant || undefined)
      .subscribe(
        (response) => {
          if (response.success) {
            // Store all tenant data
            localStorage.setItem('token', response.data.accessToken);
            localStorage.setItem('tenantUuid', response.data.tenantUuid);
            localStorage.setItem('defaultTenantUuid', response.data.defaultTenantUuid);
            localStorage.setItem('accessibleTenants', JSON.stringify(response.data.accessibleTenants));
            localStorage.setItem('username', response.data.username);

            // If user has multiple shops, show selector later
            if (response.data.accessibleTenants.length > 1) {
              this.showTenantSelect = true;
            }

            this.router.navigate(['/dashboard']);
          }
        },
        (error) => {
          this.errorMessage = error.error?.message || 'Login failed';
        }
      );
  }
}
```

---

### 6. Update Dashboard/Header Component

```typescript
// app-header.component.ts
import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-header',
  template: `
    <header class="app-header">
      <div class="header-content">
        <h1>Smart Dairy ERP</h1>
        
        <!-- Shop Selector in Header -->
        <app-shop-selector *ngIf="isLoggedIn()"></app-shop-selector>
        
        <div class="user-menu" *ngIf="isLoggedIn()">
          <span>{{ username }}</span>
          <button (click)="logout()">Logout</button>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .app-header {
      background: #2c3e50;
      color: white;
      padding: 15px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .header-content {
      display: flex;
      gap: 20px;
      align-items: center;
      width: 100%;
    }
    h1 { margin: 0; }
    .user-menu {
      margin-left: auto;
      display: flex;
      gap: 15px;
      align-items: center;
    }
  `]
})
export class AppHeaderComponent implements OnInit {
  username: string = '';

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.username = localStorage.getItem('username') || 'User';
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  logout() {
    this.authService.logout();
    window.location.href = '/login';
  }
}
```

---

### 7. Update Routing Guards (Optional but Recommended)

```typescript
// auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const token = localStorage.getItem('token');
    const tenantUuid = localStorage.getItem('tenantUuid');

    if (token && tenantUuid) {
      return true;
    }

    this.router.navigate(['/login']);
    return false;
  }
}

// Use in routing
const routes = [
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'companies', component: CompaniesComponent, canActivate: [AuthGuard] },
  // ... other routes
];
```

---

## Testing the Integration

### 1. Test Login
```javascript
// Test with single tenant (default user)
POST /api/v1/auth/login
{
  "username": "admin",
  "password": "admin123"
}

Expected: 
- accessToken present
- defaultTenantUuid in response
- accessibleTenants contains at least 1 tenant
```

### 2. Test Shop Switching
```javascript
// Get current tenant
const current = localStorage.getItem('tenantUuid');

// Switch to different tenant (once you have multiple)
POST /api/auth/switch-shop/{newTenantUuid}

Expected:
- New token with different tenantUuid
- Redirect and page reload
- Data updates for new tenant
```

### 3. Test Data Isolation
```javascript
// After switching shops, verify:
- GET /api/companies returns only current tenant's companies
- GET /api/branches returns only current tenant's branches
- All data filtered by X-Tenant-Id header
```

---

## Key Implementation Points

### ✅ Must Do
- Store tenantUuid after login
- Send X-Tenant-Id header with all requests
- Show shop selector to users with multiple shops
- Handle token refresh if expired
- Redirect to login if no token

### ✅ Should Do
- Display current shop name prominently
- Show user's role in current shop
- Allow switching shops easily
- Show list of all accessible shops
- Option to set primary shop

### 🔄 Optional (Phase 2)
- Invite users to shops
- Manage permissions per shop
- View audit logs
- Organization hierarchy
- Advanced role builder

---

## Common Patterns

### Check Current Tenant
```typescript
const tenantUuid = localStorage.getItem('tenantUuid');
if (!tenantUuid) {
  // Redirect to login
}
```

### Get All Accessible Shops
```typescript
const shops = JSON.parse(localStorage.getItem('accessibleTenants') || '[]');
// shops is array of tenant UUIDs
```

### Get Current User's Role in Shop
```typescript
// Need to call GET /api/auth/my-shops
// Filter by current tenantUuid
// Get the role from matching shop
```

### Add Tenant Awareness to Components
```typescript
// All components can access current tenant
currentTenant$ = of(localStorage.getItem('tenantUuid'));

// Use in template
<p>Current Shop: {{ (currentTenant$ | async) }}</p>
```

---

## Migration Checklist

- [ ] Update AuthService with new methods
- [ ] Add TenantInterceptor to HttpClient
- [ ] Create ShopSelectorComponent
- [ ] Update LoginComponent
- [ ] Update HeaderComponent
- [ ] Add AuthGuard to routes
- [ ] Store tenantUuid after login
- [ ] Send X-Tenant-Id header with requests
- [ ] Test login with default tenant
- [ ] Test shop switching (if you have multiple)
- [ ] Test data filtering by tenant
- [ ] Update error handling
- [ ] Add loading indicators
- [ ] Test on mobile (responsive)

---

## What Not to Change

❌ **Don't remove** the TenantFilter from backend  
❌ **Don't bypass** X-Tenant-Id header  
❌ **Don't store** passwords  
❌ **Don't expose** tenant IDs in URLs  
❌ **Don't forget** to update tenant on shop switch  

---

## Questions?

Refer to:
- Backend: PHASE1_MULTISHOP_IMPLEMENTATION.md
- API: Test with Postman/Insomnia
- Examples: QUICK_REFERENCE.md

**Backend is ready!** 🎉 Frontend integration is straightforward - mainly storage, headers, and UI updates.
