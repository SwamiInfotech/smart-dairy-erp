# Smart Dairy ERP - Phase 1 Multi-Shop SaaS Implementation ✅ COMPLETE

## Implementation Summary

Successfully implemented the foundational multi-shop SaaS architecture for Smart Dairy ERP. Users can now access multiple shops/tenants and switch between them seamlessly.

---

## What Was Implemented

### 1. **Database Migration (V147)**
- ✅ Created `user_tenant` join table for 1:Many user-tenant relationships
- ✅ Migrated all existing users to the new table with ADMIN role
- ✅ Added `default_tenant_uuid` column to `app_user` table
- ✅ Created indexes for fast lookups:
  - `idx_user_tenant_user_id` - Find user's tenants
  - `idx_user_tenant_user_active` - Find active tenants
  - `idx_user_tenant_is_primary` - Find primary tenant
  - `idx_user_tenant_tenant_uuid` - Find tenants by UUID

**File:** `V147__create_user_tenant_table.sql`

### 2. **New Enums**
- ✅ `UserTenantRole` - Roles: OWNER, ADMIN, MANAGER, OPERATOR, VIEWER
  
**File:** `UserTenantRole.java`

### 3. **New Entity: UserTenant**
- ✅ Represents user's access to a specific tenant
- ✅ Fields:
  - `uuid` - Unique identifier
  - `appUser` - Reference to user
  - `tenant` - Reference to tenant
  - `role` - User's role in this tenant (UserTenantRole)
  - `isOwner` - Whether user owns this shop
  - `isAdmin` - Whether user has admin access
  - `isPrimary` - Default tenant for login
  - `permissions` - JSON string of permissions
  - `active` - Whether this access is active
- ✅ Helper methods:
  - `hasPermission(String)` - Check if user has permission
  - `canInviteUsers()` - Check if can invite users
  - `canManageUsers()` - Check if can manage users
  - `canViewReports()` - Check if can view reports

**File:** `UserTenant.java`

### 4. **Updated Entity: AppUser**
- ✅ Added `defaultTenantUuid` - Which shop is default for login
- ✅ Added `@OneToMany userTenants` - List of all tenants user can access
- ✅ Added helper methods:
  - `hasAccessToTenant(UUID)` - Check if user can access tenant
  - `getPrimaryTenantAccess()` - Get primary tenant record
  - `getAccessibleTenantIds()` - Get all accessible tenant UUIDs
  - `getRoleInTenant(UUID)` - Get user's role in specific tenant
  - `isOwnerOfTenant(UUID)` - Check if owner
  - `isAdminOfTenant(UUID)` - Check if admin

**File:** `AppUser.java` (updated)

### 5. **New Repository: UserTenantRepository**
- ✅ Methods for user-tenant queries:
  - `findByUserIdAndTenantUuid()` - Find specific access
  - `findAllByUserIdAndActive()` - Find all user's tenants
  - `findPrimaryByUserId()` - Find default tenant
  - `hasAccessToTenant()` - Check access
  - `findByTenantUuidAndRole()` - Find users with role in tenant
  - `findAllAdminsByTenantUuid()` - Find tenant admins
  - `findAllOwnersByTenantUuid()` - Find tenant owners
  - `countByTenantUuidAndActive()` - Count active users
  - `findAllByTenantUuid()` - Get all users in tenant

**File:** `UserTenantRepository.java`

### 6. **Updated DTOs**
- ✅ **AuthTokenResponse** - Enhanced with:
  - `defaultTenantUuid` - Which shop is default
  - `accessibleTenants` - List of all shops user can access
  
- ✅ **LoginRequest** - Added:
  - `tenantUuid` (optional) - To login to specific tenant
  
- ✅ **TenantDTO** - New DTO for tenant information:
  - `uuid`, `code`, `name`
  - `role`, `isPrimary`, `isOwner`, `isAdmin`
  - `active`, `createdAt`

**Files:**
- `AuthTokenResponse.java` (updated)
- `LoginRequest.java` (updated)
- `TenantDTO.java` (new)

### 7. **Updated AuthService**
- ✅ Enhanced login flow:
  1. Authenticate user globally
  2. Get user's tenants from `user_tenant` table
  3. Determine which tenant to use (explicit > default)
  4. **Validate** user has access to that tenant
  5. Get user's role in that tenant
  6. Generate JWT with tenant-specific role
  7. Return list of all accessible tenants to frontend

**File:** `AuthService.java` (updated)

### 8. **New Controller: TenantAuthController**
- ✅ Endpoints for multi-shop functionality:
  
  **GET /api/auth/my-shops**
  - Get list of all shops user can access
  - Returns: `List<TenantDTO>`
  
  **POST /api/auth/switch-shop/{tenantUuid}**
  - Switch to a different shop
  - Validates user has access
  - Returns: New JWT token for that shop
  - Response: `AuthTokenResponse`
  
  **POST /api/auth/set-primary-shop/{tenantUuid}**
  - Set a shop as primary/default
  - User defaults to this shop on next login
  - Response: Success message

**File:** `TenantAuthController.java`

---

## How It Works Now

### Login Flow - Example Scenario

**User: "admin@smartdairy.com" has 3 shops:**
1. ABC Dairy (uuid-1) - Owner
2. XYZ Dairy (uuid-2) - Admin (Primary)
3. DEF Dairy (uuid-3) - Manager

**Step 1: Login Request**
```json
POST /api/v1/auth/login
{
  "username": "admin@smartdairy.com",
  "password": "admin123",
  "tenantUuid": null  // Optional - if not provided, use primary
}
```

**Step 2: Backend**
1. Authenticate user
2. Find user's accessible tenants from `user_tenant` table
3. User has no explicit `tenantUuid` → use `defaultTenantUuid` (uuid-2 / XYZ Dairy)
4. Validate user has access to uuid-2 ✅
5. Get role: ADMIN
6. Generate JWT with role=ADMIN, tenantUuid=uuid-2
7. Return all accessible tenants

**Step 3: Login Response**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresIn": 3600,
  "username": "admin@smartdairy.com",
  "role": "ADMIN",
  "tenantUuid": "uuid-2",
  "defaultTenantUuid": "uuid-2",
  "accessibleTenants": ["uuid-1", "uuid-2", "uuid-3"]
}
```

**Step 4: Frontend Shows Shop Selector**
```html
<select>
  <option value="uuid-1">ABC Dairy (OWNER)</option>
  <option value="uuid-2" selected>XYZ Dairy (ADMIN) - Default</option>
  <option value="uuid-3">DEF Dairy (MANAGER)</option>
</select>
```

### Shop Switching

**User clicks "ABC Dairy":**
```
POST /api/auth/switch-shop/uuid-1
Authorization: Bearer [current-token]
```

**Backend:**
1. Extract user from JWT
2. Validate user has access to uuid-1 ✅
3. Get user's role in uuid-1 (OWNER)
4. Generate NEW JWT with tenantUuid=uuid-1, role=OWNER
5. Return new token

**Frontend:**
1. Updates stored token
2. Updates X-Tenant-Id header
3. Refreshes data (now sees ABC Dairy branches)

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                       LOGIN REQUEST                         │
│  {username, password, tenantUuid (optional)}                │
└────────────────────┬────────────────────────────────────────┘
                     ↓
        ┌────────────────────────────┐
        │ Authenticate Username/Pass │
        └────────────────┬───────────┘
                         ↓
        ┌────────────────────────────────────┐
        │ Find AppUser                       │
        │ Load userTenants (JPA @OneToMany)  │
        └────────────────┬───────────────────┘
                         ↓
        ┌──────────────────────────────────────────┐
        │ Determine Tenant:                        │
        │ ├─ If tenantUuid provided → use it      │
        │ └─ Else → use defaultTenantUuid         │
        └────────────────┬─────────────────────────┘
                         ↓
        ┌──────────────────────────────────────┐
        │ Validate User Has Access             │
        │ (check user_tenant table)            │
        └────────────────┬─────────────────────┘
                         ↓
        ┌──────────────────────────────────────┐
        │ Get Role from user_tenant.role       │
        │ (OWNER/ADMIN/MANAGER/OPERATOR)       │
        └────────────────┬─────────────────────┘
                         ↓
        ┌──────────────────────────────────────┐
        │ Generate JWT                         │
        │ Claim: tenantUuid, role              │
        └────────────────┬─────────────────────┘
                         ↓
        ┌──────────────────────────────────────┐
        │ Build Response with:                 │
        │ ├─ JWT token                         │
        │ ├─ Current tenantUuid                │
        │ ├─ defaultTenantUuid                 │
        │ └─ List of accessibleTenants         │
        └────────────────┬─────────────────────┘
                         ↓
        ┌──────────────────────────────────────┐
        │       LOGIN RESPONSE                 │
        │ {accessToken, tenantUuid,            │
        │  defaultTenantUuid,                  │
        │  accessibleTenants}                  │
        └──────────────────────────────────────┘
```

---

## Database Schema

### user_tenant Table
```sql
CREATE TABLE user_tenant (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    tenant_id BIGINT NOT NULL,
    tenant_uuid UUID NOT NULL,
    role VARCHAR(50) NOT NULL,
    is_owner BOOLEAN NOT NULL DEFAULT FALSE,
    is_admin BOOLEAN NOT NULL DEFAULT FALSE,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    permissions TEXT,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    version BIGINT NOT NULL,
    
    UNIQUE(user_id, tenant_id),
    FOREIGN KEY(user_id) REFERENCES app_user(id),
    FOREIGN KEY(tenant_id) REFERENCES tenant(id)
);
```

### Relationships
```
AppUser (1) ──→ (Many) UserTenant
             └─→ (1) Tenant
             
Company (1) ──→ (Many) Branch
         └─→ (Many) UserTenant (via defaultTenantUuid)
```

---

## Example Data After Migration

### Scenario: 2 Companies, 3 Users

**Company 1: ABC Dairy**
- Code: `ABC-001`
- Tenant UUID: `aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa`

**Company 2: XYZ Dairy**
- Code: `XYZ-001`
- Tenant UUID: `bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb`

**Users:**

| Username | Email | Default Tenant | user_tenant Records |
|----------|-------|-----------------|-------------------|
| admin1 | admin1@dairy.com | ABC-001 | • ABC-001 (OWNER, Primary) |
| admin2 | admin2@dairy.com | ABC-001 | • ABC-001 (ADMIN)<br/>• XYZ-001 (ADMIN, Primary) |
| operator | op@dairy.com | XYZ-001 | • XYZ-001 (OPERATOR, Primary) |

**user_tenant Table:**
```
user_id │ tenant_uuid │ role     │ is_primary │ is_owner │ is_admin
────────┼─────────────┼──────────┼────────────┼──────────┼─────────
   1    │ aaaa...     │ OWNER    │ true       │ true     │ true
   2    │ aaaa...     │ ADMIN    │ false      │ false    │ true
   2    │ bbbb...     │ ADMIN    │ true       │ false    │ true
   3    │ bbbb...     │ OPERATOR │ true       │ false    │ false
```

---

## Files Created/Modified

### New Files ✅
1. `V147__create_user_tenant_table.sql` - Migration
2. `UserTenantRole.java` - Enum
3. `UserTenant.java` - Entity
4. `UserTenantRepository.java` - Repository
5. `TenantDTO.java` - DTO
6. `TenantAuthController.java` - Controller

### Modified Files ✅
1. `AppUser.java` - Added relationships and methods
2. `AuthService.java` - Updated login flow
3. `LoginRequest.java` - Added tenantUuid field
4. `AuthTokenResponse.java` - Added defaultTenantUuid and accessibleTenants

---

## Testing Checklist

### ✅ Compilation
- Code compiles without errors ✓
- No breaking changes to existing code ✓

### ⏳ Runtime Testing (Next Steps)
- [ ] Application starts with new migration
- [ ] Existing users migrated to user_tenant table
- [ ] Default user has primary tenant set
- [ ] Login returns defaultTenantUuid and accessibleTenants
- [ ] GET /api/auth/my-shops returns user's shops
- [ ] POST /api/auth/switch-shop/{uuid} returns new token
- [ ] POST /api/auth/set-primary-shop/{uuid} updates default

---

## API Documentation

### 1. Login
```
POST /api/v1/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123",
  "tenantUuid": null  // Optional
}

Response:
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "accessToken": "eyJ...",
    "tokenType": "Bearer",
    "expiresIn": 3600,
    "username": "admin",
    "role": "ADMIN",
    "tenantUuid": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    "defaultTenantUuid": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    "accessibleTenants": [
      "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
      "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"
    ]
  }
}
```

### 2. Get My Shops
```
GET /api/auth/my-shops
Authorization: Bearer {token}

Response:
[
  {
    "uuid": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    "code": "ABC-001",
    "name": "ABC Dairy",
    "role": "OWNER",
    "isPrimary": true,
    "isOwner": true,
    "isAdmin": true,
    "active": true,
    "createdAt": "2026-07-14T10:00:00"
  },
  {
    "uuid": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
    "code": "XYZ-001",
    "name": "XYZ Dairy",
    "role": "MANAGER",
    "isPrimary": false,
    "isOwner": false,
    "isAdmin": false,
    "active": true,
    "createdAt": "2026-07-14T11:00:00"
  }
]
```

### 3. Switch Shop
```
POST /api/auth/switch-shop/bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb
Authorization: Bearer {token}

Response:
{
  "accessToken": "eyJ...",
  "tokenType": "Bearer",
  "expiresIn": 3600,
  "username": "admin",
  "role": "MANAGER",
  "tenantUuid": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
  "defaultTenantUuid": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
  "accessibleTenants": [
    "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"
  ]
}
```

### 4. Set Primary Shop
```
POST /api/auth/set-primary-shop/bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb
Authorization: Bearer {token}

Response:
{
  "message": "Primary shop updated successfully"
}
```

---

## What's Next (Phase 2)

### Future Enhancements
- [ ] Granular permission system (read_sales, write_inventory, etc.)
- [ ] User invitation flow (shop owner inviting users)
- [ ] Audit logging per tenant
- [ ] Organization hierarchy (parent-child tenants)
- [ ] Subscription/billing integration
- [ ] Role-based access control (RBAC) refinement
- [ ] Multi-level shops/regions

---

## Architecture Summary

### Company-Level Tenant Mapping ✅
```
Tenant = Company
├─ Branches inherit tenant_uuid from company
├─ One user can access multiple companies
└─ Each user-company combo has a specific role
```

### Data Isolation ✅
```
TenantFilter (Hibernate)
├─ Automatic filtering: @Filter(condition = "tenant_uuid = :tenantUuid")
├─ TenantContextHolder (ThreadLocal) stores current tenant
└─ Every query auto-filtered by tenant
```

### User Access Model ✅
```
AppUser (Global)
├─ Username: global (not tenant-scoped)
├─ defaultTenantUuid: which company to login to
└─ userTenants: list of companies user can access
   └─ Each entry has: role, owner, admin, primary flags
```

---

**Status:** Phase 1 COMPLETE ✅ Ready for testing
**Compilation:** SUCCESS ✓
**Ready to Test:** YES
