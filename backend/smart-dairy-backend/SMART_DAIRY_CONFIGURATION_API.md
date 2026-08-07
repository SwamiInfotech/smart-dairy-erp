# Smart Dairy Configuration CRUD API Documentation

## Overview
The Smart Dairy Configuration module provides complete CRUD (Create, Read, Update, Delete) operations for managing system-wide rules and settings for the Smart Dairy ERP system.

## Database Table
- **Table Name**: `smart_dairy_configuration`
- **Version**: V159 (Flyway Migration)
- **Key Features**: 
  - Tenant-scoped configuration (one per tenant)
  - Soft delete (active flag)
  - Full audit trail (created_at, updated_at, version)

## Configuration Settings

### 1. Milk Collection Settings
- **Collection FAT**: Enable/disable FAT collection method
- **Collection MAVA**: Enable/disable MAVA collection method
- **Morning Collection Limit**: Max collections allowed in morning (≥1)
- **Evening Collection Limit**: Max collections allowed in evening (≥1)
- **Allow Multiple Collection**: Allow multiple collections in single session

### 2. Farmer Finance Settings
- **Allow Loan**: Enable/disable farmer loans
- **Allow Advance/Uchal**: Enable/disable advance payments
- **Allow Loan + Advance Together**: Allow combining loans and advances

### 3. Payment Settings
- **Daily Payment**: Enable/disable daily payment cycles
- **Weekly Payment**: Enable/disable weekly payment cycles
- **Monthly Payment**: Enable/disable monthly payment cycles

### 4. Backdated Collection Settings
- **Allow Backdated Entry**: Allow entering past collection data
- **Maximum Backdated Days**: Max days to allow backdated entries (≥1)

### 5. Collection Lock Settings
- **Auto Lock**: Automatically lock collection after processing

## API Endpoints

### 1. Create Configuration
**Endpoint**: `POST /api/v1/smart-dairy-configuration`

**Request Body**:
```json
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
```

**Response (201 Created)**:
```json
{
  "success": true,
  "message": "Smart Dairy Configuration created successfully",
  "data": {
    "uuid": "550e8400-e29b-41d4-a716-446655440000",
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
    "autoLock": false,
    "active": true,
    "createdAt": "2026-08-07 12:13:07",
    "updatedAt": "2026-08-07 12:13:07"
  },
  "timestamp": "2026-08-07T12:13:07.124+05:30"
}
```

### 2. Get Configuration by UUID
**Endpoint**: `GET /api/v1/smart-dairy-configuration/{uuid}`

**Response (200 OK)**:
Returns the configuration details as shown above.

### 3. Get Current Tenant Configuration
**Endpoint**: `GET /api/v1/smart-dairy-configuration/current/tenant`

**Response (200 OK)**:
Returns the active configuration for the current tenant.

### 4. Update Configuration
**Endpoint**: `PUT /api/v1/smart-dairy-configuration/{uuid}`

**Request Body** (All fields optional):
```json
{
  "collectionFat": false,
  "morningCollectionLimit": 2,
  "maxBackdatedDays": 14,
  "autoLock": true
}
```

**Response (200 OK)**:
Returns updated configuration details.

### 5. Delete Configuration
**Endpoint**: `DELETE /api/v1/smart-dairy-configuration/{uuid}`

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Smart Dairy Configuration deleted successfully",
  "data": null,
  "timestamp": "2026-08-07T12:13:07.124+05:30"
}
```

## Project Structure

```
com.smartdairy.configuration/
├── entity/
│   └── SmartDairyConfiguration.java         // JPA Entity
├── dto/
│   ├── SmartDairyConfigurationResponse.java // Response DTO
│   ├── CreateSmartDairyConfigurationRequest.java  // Create Request
│   └── UpdateSmartDairyConfigurationRequest.java  // Update Request
├── repository/
│   └── SmartDairyConfigurationRepository.java    // Spring Data JPA
├── service/
│   ├── SmartDairyConfigurationService.java        // Service Interface
│   └── impl/
│       └── SmartDairyConfigurationServiceImpl.java // Implementation
├── mapper/
│   └── SmartDairyConfigurationMapper.java  // Entity-DTO Mapping
└── controller/
    └── SmartDairyConfigurationController.java // REST Controller
```

## Key Features

1. **Tenant Isolation**: Each tenant has isolated configuration
2. **Unique Constraint**: Only one active configuration per tenant
3. **Soft Delete**: Configurations are soft-deleted (active flag)
4. **Audit Trail**: Automatic tracking of created_at, updated_at
5. **Validation**: Input validation with meaningful error messages
6. **Transactional**: Database operations are properly transactional
7. **Logging**: Comprehensive logging for debugging

## Error Handling

### 400 Bad Request
- Configuration already exists for tenant
- Invalid input values (validation errors)

### 404 Not Found
- Configuration UUID not found
- Tenant configuration not found

### 201 Created
- Configuration successfully created

### 200 OK
- GET, PUT, DELETE operations successful

## Database Migration

Run Flyway migration:
```sql
-- V159__create_smart_dairy_configuration_table.sql
-- Automatically creates the table on application startup
```

## Transaction Support

All service methods are transactional:
- Create: `@Transactional`
- Read: `@Transactional(readOnly = true)`
- Update: `@Transactional`
- Delete: `@Transactional`

## Usage Examples

### cURL Examples

**Create**:
```bash
curl -X POST http://localhost:8080/api/v1/smart-dairy-configuration \
  -H "Content-Type: application/json" \
  -d '{
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
  }'
```

**Read by UUID**:
```bash
curl -X GET http://localhost:8080/api/v1/smart-dairy-configuration/550e8400-e29b-41d4-a716-446655440000
```

**Get Current Tenant Configuration**:
```bash
curl -X GET http://localhost:8080/api/v1/smart-dairy-configuration/current/tenant
```

**Update**:
```bash
curl -X PUT http://localhost:8080/api/v1/smart-dairy-configuration/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -d '{
    "maxBackdatedDays": 14,
    "autoLock": true
  }'
```

**Delete**:
```bash
curl -X DELETE http://localhost:8080/api/v1/smart-dairy-configuration/550e8400-e29b-41d4-a716-446655440000
```

## Dependencies Used

- Spring Boot 3.5.16
- Spring Data JPA
- Lombok
- Flyway (Database Migration)
- Jakarta Validation
- Swagger/OpenAPI (via @Operation @Tag annotations)

## Version History

- **V1.0.0**: Initial implementation with full CRUD operations
  - Create configuration
  - Read by UUID and tenant
  - Update with partial updates
  - Soft delete
  - Tenant isolation
