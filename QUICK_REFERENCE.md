# Quick Reference: Multi-Shop SaaS Implementation

## Key Concepts

### Tenant = Company
- One company = One tenant
- Multiple branches under one company share the same tenant_uuid
- Example: "ABC Dairy" is a tenant (uuid-1) with branches in Delhi, Mumbai, Bangalore

### User Access
- User can access multiple companies/tenants
- Each user has ONE primary/default company
- On login, user gets token for their primary company
- User can switch to other companies via API

### user_tenant Table
- Tracks which users have access to which companies
- Stores user's role IN THAT COMPANY
- Fields: user_id, tenant_uuid, role, is_primary, is_owner, is_admin

---

## Frontend Implementation Guide

### 1. After Login - Check Available Shops
```javascript
// Response from login includes:
response.defaultTenantUuid    // Which shop user defaults to
response.accessibleTenants    // List of all shops user can access
response.tenantUuid           // Currently logged in to this shop

// Show shop selector to user
const shops = await fetch('/api/auth/my-shops', {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.json());

// Display: ABC Dairy (OWNER) *, XYZ Dairy (MANAGER), DEF Dairy (OPERATOR)
// *Primary (default)
```

### 2. Store the Tenant UUID
```javascript
localStorage.setItem('tenantUuid', response.tenantUuid);
localStorage.setItem('defaultTenantUuid', response.defaultTenantUuid);
```

### 3. Send with Every Request
```javascript
// Add header to all HTTP requests
headers: {
  'X-Tenant-Id': localStorage.getItem('tenantUuid')
}
```

### 4. Allow User to Switch Shops
```javascript
switchShop(newTenantUuid) {
  const response = await fetch(`/api/auth/switch-shop/${newTenantUuid}`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  }).then(r => r.json());
  
  // Update stored token
  localStorage.setItem('token', response.accessToken);
  localStorage.setItem('tenantUuid', response.tenantUuid);
  
  // Refresh page to load new tenant's data
  window.location.reload();
}
```

---

## Key Files

| File | Purpose |
|------|---------|
| `V147__create_user_tenant_table.sql` | Database migration - creates user_tenant table |
| `UserTenant.java` | Entity representing user's access to a tenant |
| `UserTenantRepository.java` | Queries for user-tenant relationships |
| `AppUser.java` | Updated with defaultTenantUuid and userTenants |
| `AuthService.java` | Updated login flow with tenant selection |
| `TenantAuthController.java` | New endpoints: /my-shops, /switch-shop, /set-primary-shop |
| `AuthTokenResponse.java` | Updated with defaultTenantUuid and accessibleTenants |
| `LoginRequest.java` | Updated with optional tenantUuid field |

---

## Database Structure

### user_tenant Table
```
id (PK) | uuid | user_id | tenant_id | tenant_uuid | role | is_primary | is_owner | is_admin | active
```

### Example Data
```
User: admin1
- Tenant ABC-001: OWNER, is_primary=true, is_owner=true
- Tenant XYZ-001: ADMIN, is_primary=false, is_owner=false

User: operator1
- Tenant ABC-001: MANAGER, is_primary=false, is_owner=false
- Tenant XYZ-001: OPERATOR, is_primary=true, is_owner=false
```

---

## API Endpoints

### GET /api/auth/my-shops
**Get all shops user can access**
```
Returns: List<TenantDTO>
- uuid, code, name, role, isPrimary, isOwner, isAdmin, active
```

### POST /api/auth/switch-shop/{tenantUuid}
**Switch to a different shop**
```
Returns: AuthTokenResponse
- New JWT token with new tenant context
- Updated tenantUuid in response
```

### POST /api/auth/set-primary-shop/{tenantUuid}
**Set shop as default for login**
```
Returns: { message: "success" }
```

---

## Roles Hierarchy

| Role | Capabilities |
|------|--------------|
| **OWNER** | Can manage all settings, users, billing. Can invite/remove users. |
| **ADMIN** | Full access to features. Can invite users. |
| **MANAGER** | Can manage team/operations. Limited user management. |
| **OPERATOR** | Can perform operations. No user management. |
| **VIEWER** | Read-only access. |

---

## Troubleshooting

### User can't login
- ✅ Check if user exists in app_user table
- ✅ Check if user has entry in user_tenant table
- ✅ Ensure default_tenant_uuid is set on app_user

### User can't switch shops
- ✅ User must have access (entry in user_tenant table)
- ✅ Check API returns 403 if no access

### Data isolation not working
- ✅ Verify TenantFilter is enabled on BaseEntity
- ✅ Check X-Tenant-Id header is sent with requests
- ✅ Verify TenantContextHolder is setting tenant

---

## Migration Checklist

- [x] Created V147 migration file
- [x] Created UserTenant entity
- [x] Created UserTenantRepository
- [x] Updated AppUser entity
- [x] Updated AuthService login flow
- [x] Created TenantAuthController
- [x] Updated AuthTokenResponse DTO
- [x] Updated LoginRequest DTO
- [x] Code compiles without errors
- [ ] Run application and test migration
- [ ] Test login flow
- [ ] Test GET /api/auth/my-shops
- [ ] Test POST /api/auth/switch-shop/{uuid}
- [ ] Verify data isolation
- [ ] Test with multiple users

---

## Important Notes

1. **Existing Users:** Migration automatically creates user_tenant records for existing users with ADMIN role and is_primary=true

2. **Tenant Selection:** User can pass tenantUuid in login request to login to specific tenant (must have access)

3. **Default Behavior:** If tenantUuid not provided in login, uses user's defaultTenantUuid (primary tenant)

4. **JWT Claims:** JWT now includes tenantUuid claim that backend uses to filter all queries

5. **X-Tenant-Id Header:** Optional override header (for UI testing), but must match JWT tenantUuid if both present

6. **Data Isolation:** All queries automatically filtered by TenantFilter - no data leaks between tenants

---

## Next Phase (Phase 2)

- [ ] User invitation system (shop admin inviting users)
- [ ] Granular permissions (read_sales, write_inventory, etc.)
- [ ] Audit logging per tenant
- [ ] Role-based access control (RBAC) UI
- [ ] Organization hierarchy support
- [ ] Subscription/billing integration
