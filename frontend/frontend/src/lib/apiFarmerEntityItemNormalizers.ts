import type { FarmerResponse } from '../types/api'
import { asRecord, readString } from './apiResponseParsers'

export function normalizeFarmerItem(payload: unknown): FarmerResponse | null {
  const record = asRecord(payload)
  if (!record) return null

  const uuid = readString(record, 'uuid', 'farmerUuid', 'farmer_uuid', 'id')
  const branchUuid = readString(record, 'branchUuid', 'branch_uuid', 'branchId', 'branch_id')
  const farmerCode = readString(record, 'farmerCode', 'farmer_code', 'code')
  const farmerName = readString(record, 'farmerName', 'farmer_name', 'name')
  const mobileNo = readString(record, 'mobileNo', 'mobile_no', 'mobile', 'phone')

  if (!uuid || !branchUuid || !farmerCode || !farmerName || !mobileNo) {
    return null
  }

  const config =
    asRecord(record.farmerConfiguration) || asRecord(record.farmerConfig) || asRecord(record.configuration)

  const milkRateChartUuid =
    readString(
      record,
      'milkRateChartUuid',
      'milk_rate_chart_uuid',
      'milkRateChartId',
      'milk_rate_chart_id',
    ) ||
    readString(
      config,
      'milkRateChartUuid',
      'milk_rate_chart_uuid',
      'milkRateChartId',
      'milk_rate_chart_id',
    ) ||
    null

  const milkTypeRecord = asRecord(record.milkType)
  const paymentCycleRecord = asRecord(record.paymentCycle)
  const rateCategoryRecord = asRecord(record.rateCategory)
  const collectionMethodRecord = asRecord(record.collectionMethod)

  const milkTypeUuid =
    readString(record, 'milkTypeUuid', 'milk_type_uuid', 'milkTypeId') ||
    readString(config, 'milkTypeUuid', 'milk_type_uuid', 'milkTypeId') ||
    readString(milkTypeRecord, 'uuid', 'id') ||
    ''

  const paymentCycleUuid =
    readString(record, 'paymentCycleUuid', 'payment_cycle_uuid', 'paymentCycleId') ||
    readString(config, 'paymentCycleUuid', 'payment_cycle_uuid', 'paymentCycleId') ||
    readString(paymentCycleRecord, 'uuid', 'id') ||
    ''

  const rateCategoryUuid =
    readString(record, 'rateCategoryUuid', 'rate_category_uuid', 'rateCategoryId') ||
    readString(config, 'rateCategoryUuid', 'rate_category_uuid', 'rateCategoryId') ||
    readString(rateCategoryRecord, 'uuid', 'id') ||
    ''

  const collectionMethodUuid =
    readString(record, 'collectionMethodUuid', 'collection_method_uuid', 'collectionMethodId') ||
    readString(config, 'collectionMethodUuid', 'collection_method_uuid', 'collectionMethodId') ||
    readString(collectionMethodRecord, 'uuid', 'id') ||
    ''

  const configEffectiveFrom =
    readString(record, 'configEffectiveFrom', 'effectiveFrom', 'effective_from') ||
    readString(config, 'configEffectiveFrom', 'effectiveFrom', 'effective_from') ||
    ''

  return {
    uuid,
    branchUuid,
    farmerCode,
    farmerName,
    mobileNo,
    alternateMobileNo: readString(record, 'alternateMobileNo', 'alternate_mobile_no', 'alternateMobile'),
    email: readString(record, 'email', 'emailId', 'email_id'),
    address: readString(record, 'address'),
    village: readString(record, 'village'),
    taluka: readString(record, 'taluka', 'tehsil'),
    district: readString(record, 'district'),
    state: readString(record, 'state'),
    pincode: readString(record, 'pincode', 'pinCode', 'postalCode'),
    aadharNo: readString(record, 'aadharNo', 'aadhaarNo', 'aadhaar', 'aadhar'),
    panNo: readString(record, 'panNo', 'pan', 'panNumber'),
    photoUrl: readString(record, 'photoUrl', 'photoURL', 'imageUrl'),
    remarks: readString(record, 'remarks', 'note', 'description'),
    milkTypeUuid,
    milkRateChartUuid,
    collectionMethodUuid,
    paymentCycleUuid,
    rateCategoryUuid,
    configEffectiveFrom,
  }
}
