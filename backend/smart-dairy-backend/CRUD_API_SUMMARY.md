# Smart Dairy Configuration - CRUD API Quick Reference

## 📊 Configuration Structure

Your Smart Dairy Configuration has been successfully created with the following settings categories:

### 🥛 Milk Collection
- Collection FAT: ✓ Enabled
- Collection MAVA: ✓ Enabled
- Morning Collection Limit: 1
- Evening Collection Limit: 1
- Allow Multiple Collection: ✗ Disabled

### 💰 Farmer Finance
- Allow Loan: ✓ Enabled
- Allow Advance/Uchal: ✓ Enabled
- Allow Loan + Advance Together: ✗ Disabled

### 📅 Payment
- Daily Payment: ✓ Enabled
- Weekly Payment: ✓ Enabled
- Monthly Payment: ✓ Enabled

### 📆 Backdated Collection
- Allow Backdated Entry: ✓ Enabled
- Maximum Backdated Days: 7

### 🔒 Collection Lock
- Auto Lock: ✗ Disabled

---

## 🔌 REST API Endpoints

### CREATE - Add New Configuration
```
POST /api/v1/smart-dairy-configuration
Content-Type: application/json

{
  "collectionFat": true,
  "collectionMava": true,
  "morningCollectionLimit": 1,
  "eveningCollectionLimit": 1,
  "allowMultipleCollection": false,
  "allowLoan": true,
  "allowAdvance": true,
  "allowLoanAndAdvanceTogether": false,
  "dailyPayment": true,
  "weeklyPayment": true,
  "monthlyPayment": true,
  "allowBackdatedEntry": true,
  "maxBackdatedDays": 7,
  "autoLock": false
}

Response: 201 Created
{
  "success": true,
  "message": "Smart Dairy Configuration created successfully",
  "data": {
    "uuid": "550e8400-e29b-41d4-a716-446655440000",
    ...all settings...
    "createdAt": "2026-08-07 12:13:07"
  }
}
```

---

### READ - Get Configuration by UUID
```
GET /api/v1/smart-dairy-configuration/{uuid}

Response: 200 OK
{
  "success": true,
  "message": "Smart Dairy Configuration retrieved successfully",
  "data": {
    "uuid": "550e8400-e29b-41d4-a716-446655440000",
    ...all settings...
  }
}
```

---

### READ - Get Current Tenant Configuration
```
GET /api/v1/smart-dairy-configuration/current/tenant

Response: 200 OK
{
  "success": true,
  "message": "Smart Dairy Configuration retrieved successfully",
  "data": {
    "uuid": "550e8400-e29b-41d4-a716-446655440000",
    ...all settings...
  }
}
```

---

### UPDATE - Modify Configuration
```
PUT /api/v1/smart-dairy-configuration/{uuid}
Content-Type: application/json

{
  "morningCollectionLimit": 2,
  "autoLock": true,
  "maxBackdatedDays": 14
}

Response: 200 OK
{
  "success": true,
  "message": "Smart Dairy Configuration updated successfully",
  "data": {
    "uuid": "550e8400-e29b-41d4-a716-446655440000",
    "morningCollectionLimit": 2,
    "autoLock": true,
    "maxBackdatedDays": 14,
    ...other settings...
    "updatedAt": "2026-08-07 12:15:30"
  }
}
```

---

### DELETE - Remove Configuration
```
DELETE /api/v1/smart-dairy-configuration/{uuid}

Response: 200 OK
{
  "success": true,
  "message": "Smart Dairy Configuration deleted successfully",
  "data": null
}
```

---

## 📁 Implementation Details

### Database Table: `smart_dairy_configuration`
- **ID**: Auto-generated BIGINT primary key
- **UUID**: Unique identifier for configuration
- **Tenant UUID**: Tenant-specific isolation
- **Fields**: 15 configuration fields + audit fields
- **Migration**: V159 (Flyway)

### Key Features
✓ Full CRUD operations  
✓ Tenant isolation (one configuration per tenant)  
✓ Soft delete support  
✓ Audit trail (created_at, updated_at, version)  
✓ Input validation  
✓ Transaction support  
✓ Comprehensive logging  
✓ OpenAPI/Swagger documented  

### Files Created (11 Total)
- Database Migration (V159)
- 1 Entity Class
- 3 DTOs (Response, Create Request, Update Request)
- 1 Repository (Spring Data JPA)
- 1 Service Interface
- 1 Service Implementation
- 1 Entity-DTO Mapper
- 1 REST Controller
- API Documentation

---

## 🚀 How to Use

### 1. Application Startup
- Application automatically runs Flyway migration V159
- Creates `smart_dairy_configuration` table on startup

### 2. Create Configuration
```bash
# After application starts, create your configuration
curl -X POST http://localhost:8080/api/v1/smart-dairy-configuration \
  -H "Content-Type: application/json" \
  -d '{ ...configuration json... }'
```

### 3. Retrieve Configuration
```bash
# Get by UUID
curl http://localhost:8080/api/v1/smart-dairy-configuration/{uuid}

# Get for current tenant
curl http://localhost:8080/api/v1/smart-dairy-configuration/current/tenant
```

### 4. Update Configuration
```bash
curl -X PUT http://localhost:8080/api/v1/smart-dairy-configuration/{uuid} \
  -H "Content-Type: application/json" \
  -d '{ ...partial updates... }'
```

### 5. Delete Configuration
```bash
curl -X DELETE http://localhost:8080/api/v1/smart-dairy-configuration/{uuid}
```

---

## 🎯 Validation Rules

### Field Constraints
- `collectionFat`: Boolean (Required)
- `collectionMava`: Boolean (Required)
- `morningCollectionLimit`: Integer ≥ 1 (Required)
- `eveningCollectionLimit`: Integer ≥ 1 (Required)
- `allowMultipleCollection`: Boolean (Required)
- `allowLoan`: Boolean (Required)
- `allowAdvance`: Boolean (Required)
- `allowLoanAndAdvanceTogether`: Boolean (Required)
- `dailyPayment`: Boolean (Required)
- `weeklyPayment`: Boolean (Required)
- `monthlyPayment`: Boolean (Required)
- `allowBackdatedEntry`: Boolean (Required)
- `maxBackdatedDays`: Integer ≥ 1 (Required)
- `autoLock`: Boolean (Required)

### Business Rules
1. Only one active configuration per tenant
2. Unique UUID per configuration
3. Soft delete via `active` flag
4. Automatic audit timestamp management

---

## 🔍 Database Queries

### View all configurations
```sql
SELECT * FROM smart_dairy_configuration 
WHERE active = true 
ORDER BY created_at DESC;
```

### Get configuration for specific tenant
```sql
SELECT * FROM smart_dairy_configuration 
WHERE tenant_uuid = '{uuid}' 
AND active = true;
```

### Get configuration history (including deleted)
```sql
SELECT * FROM smart_dairy_configuration 
WHERE uuid = '{uuid}' 
ORDER BY updated_at DESC;
```

---

## ✅ Testing Checklist

- [x] Database migration created (V159)
- [x] Entity class implemented
- [x] DTOs with validation created
- [x] Repository with custom queries
- [x] Service interface and implementation
- [x] REST Controller with 5 endpoints
- [x] Entity-DTO mapper
- [x] Build compilation verified
- [x] API documentation provided
- [x] Full CRUD cycle supported

---

## 📝 Notes

- All API responses follow consistent ApiResponse format
- All operations are logged for audit trail
- Tenant context is automatically handled
- Timestamps are stored in UTC with timezone
- Version field for optimistic locking
- Transactional operations ensure data consistency
