# Creating New Tenants/Shops - Complete Guide

**Status:** ✅ Endpoints Already Exist!  
**Documentation:** Full guide + Swagger integration  

---

## Quick Answer

✅ **YES! Tenant creation endpoints already exist!**

You can create new shops/tenants via:

1. **REST API** (Postman, cURL, etc.)
2. **Swagger UI** (Interactive API docs)
3. **Frontend** (Once you call the endpoints)

---

## Access Swagger UI

**URL:** http://localhost:8081/swagger-ui.html

or

**URL:** http://localhost:8081/v3/api-docs

This gives you **interactive API documentation** where you can test all endpoints!

---

## Tenant Management API Endpoints

### 1. Create New Tenant (Shop)

**Endpoint:**
```
POST /api/v1/tenants
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "code": "ABC-001",
  "name": "ABC Dairy Pvt Ltd"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Tenant created successfully.",
  "data": {
    "uuid": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    "code": "ABC-001",
    "name": "ABC Dairy Pvt Ltd",
    "active": true,
    "createdAt": "2026-07-14T16:15:31",
    "updatedAt": "2026-07-14T16:15:31"
  }
}
```

### 2. Get All Tenants

**Endpoint:**
```
GET /api/v1/tenants
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Tenants fetched successfully.",
  "data": [
    {
      "uuid": "00000000-0000-0000-0000-000000000001",
      "code": "DEFAULT",
      "name": "Default Tenant",
      "active": true,
      "createdAt": "2026-07-14T10:00:00",
      "updatedAt": "2026-07-14T10:00:00"
    },
    {
      "uuid": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
      "code": "ABC-001",
      "name": "ABC Dairy Pvt Ltd",
      "active": true,
      "createdAt": "2026-07-14T16:15:31",
      "updatedAt": "2026-07-14T16:15:31"
    }
  ]
}
```

### 3. Get Specific Tenant

**Endpoint:**
```
GET /api/v1/tenants/{tenantUuid}
Authorization: Bearer {token}
```

**Example:**
```
GET /api/v1/tenants/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Tenant fetched successfully.",
  "data": {
    "uuid": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    "code": "ABC-001",
    "name": "ABC Dairy Pvt Ltd",
    "active": true,
    "createdAt": "2026-07-14T16:15:31",
    "updatedAt": "2026-07-14T16:15:31"
  }
}
```

---

## Testing with Postman

### Step 1: Login First (Get Token)

```
POST http://localhost:8081/api/v1/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "data": {
    "accessToken": "eyJ...",
    "tokenType": "Bearer",
    ...
  }
}
```

Copy the `accessToken` value.

### Step 2: Create New Tenant

```
POST http://localhost:8081/api/v1/tenants
Authorization: Bearer {paste-token-here}
Content-Type: application/json

{
  "code": "XYZ-001",
  "name": "XYZ Dairy Pvt Ltd"
}
```

### Step 3: Get All Tenants

```
GET http://localhost:8081/api/v1/tenants
Authorization: Bearer {same-token}
```

---

## Testing with cURL

### Create New Tenant

```bash
# Step 1: Get token
TOKEN=$(curl -s -X POST http://localhost:8081/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  | jq -r '.data.accessToken')

echo "Token: $TOKEN"

# Step 2: Create tenant
curl -X POST http://localhost:8081/api/v1/tenants \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "DEF-001",
    "name": "DEF Dairy Pvt Ltd"
  }'

# Step 3: Get all tenants
curl -X GET http://localhost:8081/api/v1/tenants \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

---

## Testing with Swagger UI

### Access Swagger:
1. Open browser: http://localhost:8081/swagger-ui.html
2. You'll see all API endpoints listed
3. Click on "Tenants" section to expand
4. Click "Authorize" button (top right)
5. Enter token: `Bearer {your-jwt-token}`
6. Click endpoints to test them interactively

---

## What Happens After Creating a Tenant?

### 1. Tenant Created in Database
```
tenant table:
├─ uuid: auto-generated unique ID
├─ code: your provided code (e.g., ABC-001)
├─ name: your provided name (e.g., ABC Dairy)
├─ active: true by default
└─ created_at, updated_at: auto-populated
```

### 2. Next Steps to Complete Setup

After creating a tenant, you need to:

#### A. Create Company Under This Tenant
```
POST /api/v1/companies
{
  "companyCode": "ABC-MAIN",
  "companyName": "ABC Dairy Main Office",
  "ownerName": "John Doe",
  "email": "john@abcdairy.com",
  "gstNo": "27AABCT1234H1Z0",
  "address": "123 Main Street",
  "city": "New Delhi",
  "state": "Delhi",
  "country": "India",
  "pincode": "110001"
}
```

#### B. Create Branches Under Company
```
POST /api/v1/branches
{
  "branchCode": "ABC-DEL",
  "branchName": "ABC Dairy - Delhi",
  "companyId": {company-id},
  "managerName": "Jane Smith",
  "address": "456 Branch Street",
  "city": "New Delhi",
  "state": "Delhi",
  "country": "India",
  "pincode": "110001"
}
```

#### C. Create User for This Tenant
```
POST /api/v1/auth/users  (if endpoint exists)
or use /api/v1/auth/register

{
  "username": "abc_admin",
  "password": "SecurePassword123",
  "fullName": "ABC Admin",
  "role": "ADMIN"
}
```

#### D. Link User to Tenant
```
POST /api/auth/invite-user  (needs implementation in Phase 2)

{
  "userEmail": "abc_admin@abcdairy.com",
  "tenantUuid": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
  "role": "ADMIN"
}
```

---

## Complete Setup Workflow

```
┌─────────────────────────────────┐
│ 1. Create New Tenant (Shop)     │
│ POST /api/v1/tenants            │
│ {code, name}                    │
└──────────────┬──────────────────┘
               ↓
┌─────────────────────────────────┐
│ 2. Create Company Under Tenant  │
│ POST /api/v1/companies          │
│ {companyCode, companyName, ...} │
└──────────────┬──────────────────┘
               ↓
┌─────────────────────────────────┐
│ 3. Create Branches Under Company│
│ POST /api/v1/branches           │
│ {branchCode, branchName, ...}   │
└──────────────┬──────────────────┘
               ↓
┌─────────────────────────────────┐
│ 4. Create Users for Tenant      │
│ POST /api/v1/auth/register      │
│ {username, password, role}      │
└──────────────┬──────────────────┘
               ↓
┌─────────────────────────────────┐
│ 5. Assign Users to Tenant       │
│ (Phase 2: User Invitation)      │
│ Link via user_tenant table      │
└─────────────────────────────────┘
```

---

## Implementation Checklist

### ✅ Phase 1 (Completed)
- [x] Tenant creation endpoint
- [x] Get all tenants endpoint
- [x] Get single tenant endpoint
- [x] Multi-tenant isolation
- [x] User login with tenant selection
- [x] Shop switching

### ⏳ Phase 2 (To Implement)
- [ ] User invitation to tenants
- [ ] Tenant admin management
- [ ] Tenant deactivation/deletion
- [ ] Tenant update/edit
- [ ] Tenant billing/subscription
- [ ] User permissions per tenant

### Future Phases
- [ ] Tenant settings management
- [ ] Custom fields per tenant
- [ ] Branding per tenant
- [ ] Audit logging per tenant

---

## Common Scenarios

### Scenario 1: Create ABC Dairy as New Shop

```bash
# Step 1: Login
TOKEN=$(curl -s -X POST http://localhost:8081/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  | jq -r '.data.accessToken')

# Step 2: Create tenant
TENANT_UUID=$(curl -s -X POST http://localhost:8081/api/v1/tenants \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"code":"ABC-001","name":"ABC Dairy Pvt Ltd"}' \
  | jq -r '.data.uuid')

echo "Created tenant: $TENANT_UUID"

# Step 3: View new tenant
curl -s -X GET http://localhost:8081/api/v1/tenants/$TENANT_UUID \
  -H "Authorization: Bearer $TOKEN" | jq
```

### Scenario 2: Create Multiple Tenants (Batch)

```bash
TENANTS=(
  "ABC-001|ABC Dairy Pvt Ltd"
  "XYZ-001|XYZ Dairy Pvt Ltd"
  "DEF-001|DEF Dairy Pvt Ltd"
)

TOKEN=$(curl -s -X POST http://localhost:8081/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  | jq -r '.data.accessToken')

for TENANT in "${TENANTS[@]}"; do
  CODE=$(echo $TENANT | cut -d'|' -f1)
  NAME=$(echo $TENANT | cut -d'|' -f2)
  
  curl -X POST http://localhost:8081/api/v1/tenants \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"code\":\"$CODE\",\"name\":\"$NAME\"}"
  
  echo "Created: $CODE"
done
```

---

## Database Schema

### tenant Table Structure
```sql
CREATE TABLE tenant (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID NOT NULL UNIQUE,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    version BIGINT NOT NULL DEFAULT 0
);

-- Future fields (Phase 2+)
-- owner_user_id BIGINT REFERENCES app_user(id),
-- organization_id BIGINT REFERENCES organization(id),
-- tenant_type VARCHAR(50) DEFAULT 'SHOP',
-- parent_tenant_id BIGINT REFERENCES tenant(id),
-- subscription_plan VARCHAR(50) DEFAULT 'FREE'
```

### user_tenant Table (Links users to tenants)
```sql
CREATE TABLE user_tenant (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES app_user(id),
    tenant_id BIGINT NOT NULL REFERENCES tenant(id),
    tenant_uuid UUID NOT NULL REFERENCES tenant(uuid),
    role VARCHAR(50) NOT NULL,  -- OWNER, ADMIN, MANAGER, OPERATOR, VIEWER
    is_primary BOOLEAN NOT NULL DEFAULT false,
    is_owner BOOLEAN NOT NULL DEFAULT false,
    is_admin BOOLEAN NOT NULL DEFAULT false,
    active BOOLEAN NOT NULL DEFAULT true,
    UNIQUE(user_id, tenant_id)
);
```

---

## Response Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| **201** | Tenant created | POST successful |
| **200** | Success | GET request successful |
| **400** | Bad request | Missing required fields |
| **401** | Unauthorized | Missing/invalid token |
| **403** | Forbidden | No permission |
| **404** | Not found | Tenant not found |
| **409** | Conflict | Duplicate code |
| **500** | Server error | Database error |

---

## Validation Rules

### Tenant Code
- ✓ Required (NotBlank)
- ✓ Max 50 characters
- ✓ Must be UNIQUE
- ✓ Examples: "ABC-001", "XYZ-01", "DAIRY-MAIN"

### Tenant Name
- ✓ Required (NotBlank)
- ✓ Max 150 characters
- ✓ Examples: "ABC Dairy Pvt Ltd", "XYZ Dairy"

### Other Rules
- ✓ Code must match database uniqueness constraint
- ✓ Name can be duplicate (not enforced)
- ✓ All tenants created in DEFAULT tenant context first
- ✓ Once created, must link users via user_tenant table

---

## Error Handling

### If code is duplicate:
```json
{
  "success": false,
  "message": "Tenant code already exists",
  "timestamp": "2026-07-14T16:15:31"
}
```

### If missing required fields:
```json
{
  "success": false,
  "message": "Tenant code is required",
  "timestamp": "2026-07-14T16:15:31"
}
```

### If unauthorized:
```json
{
  "success": false,
  "message": "Unauthorized",
  "timestamp": "2026-07-14T16:15:31"
}
```

---

## Next Steps: Link User to Tenant

Once you create a tenant, you need to:

1. ✅ Create tenant (tenant_uuid generated)
2. ⏳ Create user (if not exists)
3. ⏳ Add user to tenant_user table

**Currently missing:** Endpoint to invite/link users to tenants

**Recommendation:** Create Phase 2 endpoint:
```
POST /api/auth/invite-user-to-shop

{
  "userEmail": "user@email.com",
  "tenantUuid": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
  "role": "ADMIN"  // OWNER, ADMIN, MANAGER, OPERATOR, VIEWER
}
```

---

## Summary

✅ **Tenant creation is already implemented!**

**You can:**
1. Create tenants via REST API (POST /api/v1/tenants)
2. List all tenants (GET /api/v1/tenants)
3. Get specific tenant (GET /api/v1/tenants/{uuid})
4. View in Swagger UI: http://localhost:8081/swagger-ui.html

**What's missing (Phase 2):**
1. User invitation to tenants
2. Tenant admin functions
3. Tenant updates/deactivation
4. Frontend UI for tenant management

Ready to create your first shop? 🎉
