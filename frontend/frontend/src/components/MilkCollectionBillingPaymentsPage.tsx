import { useEffect, useMemo, useRef, useState } from 'react'
import { PAYMENT_MODES } from '../lib/appShellConfig'
import { toInputDate } from '../lib/appCoreUtils'
import { api, getSavedAuth } from '../lib/api'
import type { MilkTypeResponse, PaymentMode, ShiftResponse, SettlementStatus } from '../types/api'

type CollectionEntryMode = 'single' | 'multi' | 'unknown'

type CollectionListItem = {
  uuid: string
  collectionNo: string
  farmerName: string
  farmerUuid?: string
  collectionDate: string
  collectionTime?: string
  shiftUuid?: string
  milkTypeUuid?: string
  quantity: number
  fat?: number | null
  snf?: number | null
  mava?: number | null
  grossAmount: number
  entryMode?: CollectionEntryMode
}

type FarmerLookup = {
  uuid: string
  farmerName: string
  farmerCode?: string | null
  mobileNo?: string | null
}

type PaymentRecord = {
  uuid: string
  paymentNo?: string
  paymentDate: string
  amount: number
  mode: PaymentMode
  referenceNo: string
  remarks: string
}

type GeneratedBill = {
  uuid: string
  billNo: string
  settlementUuid?: string
  settlementStatus?: SettlementStatus
  generatedAt: string
  farmerUuid: string
  farmerName: string
  milkTypeUuid: string
  fromDate: string
  toDate: string
  collections: CollectionListItem[]
  totalQty: number
  totalAmount: number
}

type SavedBill = GeneratedBill & {
  payments: PaymentRecord[]
}

type BillFilters = {
  farmerUuid: string
  milkTypeUuid: string
  fromDate: string
  toDate: string
}

type MilkCollectionBillingPaymentsPageProps = {
  busy: boolean
  collections: CollectionListItem[]
  farmers: FarmerLookup[]
  milkTypes: MilkTypeResponse[]
  shifts: ShiftResponse[]
  branchDisplay: string
  loadCollections: () => void | Promise<void>
}

function formatAmount(value: number) {
  return Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function formatDisplayDate(value: string) {
  const normalized = (value || '').slice(0, 10)
  if (!normalized) return '-'

  const parts = normalized.split('-')
  if (parts.length !== 3) return normalized

  const [year, month, day] = parts
  if (!year || !month || !day) return normalized

  return `${day}-${month}-${year}`
}

function startOfMonthInputDate() {
  const date = new Date()
  return toInputDate(new Date(date.getFullYear(), date.getMonth(), 1))
}

function buildBillNo(farmerName: string, fromDate: string, toDate: string) {
  const safeName = farmerName.trim().replace(/\s+/g, '').slice(0, 10).toUpperCase() || 'FARMER'
  return `BILL-${safeName}-${fromDate.replace(/-/g, '')}-${toDate.replace(/-/g, '')}`
}

function getRowRate(item: CollectionListItem) {
  const qty = Number(item.quantity || 0)
  if (!qty) return 0
  return Number(item.grossAmount || 0) / qty
}

function compareCollectionsByDate(left: CollectionListItem, right: CollectionListItem) {
  const leftDate = (left.collectionDate || '').slice(0, 10)
  const rightDate = (right.collectionDate || '').slice(0, 10)

  if (leftDate !== rightDate) {
    return leftDate.localeCompare(rightDate)
  }

  const leftTime = left.collectionTime || ''
  const rightTime = right.collectionTime || ''
  if (leftTime !== rightTime) {
    return leftTime.localeCompare(rightTime)
  }

  return (left.collectionNo || '').localeCompare(right.collectionNo || '')
}

function getSettlementStatusLabel(status?: SettlementStatus) {
  if (status === 'PAID') return 'Paid'
  return 'Generated'
}

function getSettlementStatusClassName(status?: SettlementStatus) {
  return status === 'PAID'
    ? 'payment-settlement-status payment-settlement-status-paid'
    : 'payment-settlement-status payment-settlement-status-generated'
}

function getSaveButtonLabel(generatedBill: GeneratedBill | null, activeSavedBillUuid: string) {
  if (!generatedBill) return 'Save Bill'
  if (!activeSavedBillUuid) return 'Save Bill'
  if (generatedBill.settlementStatus === 'PAID') return 'Locked'
  return 'Recalculate'
}

export function MilkCollectionBillingPaymentsPage({
  busy,
  collections,
  farmers,
  milkTypes,
  shifts,
  branchDisplay,
  loadCollections,
}: MilkCollectionBillingPaymentsPageProps) {
  const printSheetRef = useRef<HTMLElement | null>(null)
  const today = toInputDate(new Date())
  const [filters, setFilters] = useState<BillFilters>({
    farmerUuid: '',
    milkTypeUuid: '',
    fromDate: startOfMonthInputDate(),
    toDate: today,
  })
  const [generatedBill, setGeneratedBill] = useState<GeneratedBill | null>(null)
  const [payments, setPayments] = useState<PaymentRecord[]>([])
  const [savedBills, setSavedBills] = useState<SavedBill[]>([])
  const [activeSavedBillUuid, setActiveSavedBillUuid] = useState('')
  const [savedBillSearch, setSavedBillSearch] = useState('')
  const [billingActionBusy, setBillingActionBusy] = useState(false)
  const [billingActionError, setBillingActionError] = useState('')
  const [billingActionSuccess, setBillingActionSuccess] = useState('')
  const [paymentForm, setPaymentForm] = useState({
    paymentDate: today,
    amount: 0,
    mode: 'CASH' as PaymentMode,
    referenceNo: '',
    remarks: '',
  })

  const authToken = getSavedAuth().token

  const deriveCollectionsForBill = (
    farmerUuid: string,
    milkTypeUuid: string,
    fromDate: string,
    toDate: string,
  ) => {
    return collections
      .filter((item) => {
        const itemDate = (item.collectionDate || '').slice(0, 10)
        if (farmerUuid && item.farmerUuid !== farmerUuid) return false
        if (milkTypeUuid && item.milkTypeUuid !== milkTypeUuid) return false
        if (itemDate < fromDate) return false
        if (itemDate > toDate) return false
        return true
      })
      .sort(compareCollectionsByDate)
  }

  const farmerOptions = useMemo(() => {
    const seen = new Set<string>()
    const options: FarmerLookup[] = []

    for (const farmer of farmers) {
      if (!farmer.uuid || seen.has(farmer.uuid)) continue
      seen.add(farmer.uuid)
      options.push(farmer)
    }

    for (const item of collections) {
      if (!item.farmerUuid || seen.has(item.farmerUuid)) continue
      seen.add(item.farmerUuid)
      options.push({ uuid: item.farmerUuid, farmerName: item.farmerName })
    }

    return options.sort((left, right) => left.farmerName.localeCompare(right.farmerName))
  }, [collections, farmers])

  useEffect(() => {
    if (farmerOptions.length === 0) return

    setFilters((prev) => {
      if (prev.farmerUuid && farmerOptions.some((item) => item.uuid === prev.farmerUuid)) {
        return prev
      }

      return {
        ...prev,
        farmerUuid: farmerOptions[0].uuid,
      }
    })
  }, [farmerOptions])

  const filteredCollections = useMemo(() => {
    return collections.filter((item) => {
      const itemDate = (item.collectionDate || '').slice(0, 10)
      if (filters.farmerUuid && item.farmerUuid !== filters.farmerUuid) return false
      if (filters.milkTypeUuid && item.milkTypeUuid !== filters.milkTypeUuid) return false
      if (filters.fromDate && itemDate < filters.fromDate) return false
      if (filters.toDate && itemDate > filters.toDate) return false
      return true
    }).sort(compareCollectionsByDate)
  }, [collections, filters.farmerUuid, filters.fromDate, filters.milkTypeUuid, filters.toDate])

  const totalQty = filteredCollections.reduce((sum, item) => sum + Number(item.quantity || 0), 0)
  const totalAmount = filteredCollections.reduce((sum, item) => sum + Number(item.grossAmount || 0), 0)
  const paidAmount = payments.reduce((sum, item) => sum + Number(item.amount || 0), 0)
  const balanceAmount = Math.max(0, totalAmount - paidAmount)
  const averageRate = totalQty > 0 ? totalAmount / totalQty : 0

  const shiftNameByUuid = useMemo(() => {
    const next = new Map<string, string>()
    for (const shift of shifts) {
      if (!shift.uuid) continue
      next.set(shift.uuid, shift.name || shift.code || shift.uuid)
    }
    return next
  }, [shifts])

  const resolveShiftLabel = (item: CollectionListItem) => {
    if (item.shiftUuid && shiftNameByUuid.has(item.shiftUuid)) {
      return shiftNameByUuid.get(item.shiftUuid) || '-'
    }
    return item.collectionTime || '-'
  }

  useEffect(() => {
    if (!generatedBill) return

    setGeneratedBill((prev) => {
      if (!prev) return prev
      const refreshed = collections.filter((item) => {
        const itemDate = (item.collectionDate || '').slice(0, 10)
        if (prev.farmerUuid && item.farmerUuid !== prev.farmerUuid) return false
        if (prev.milkTypeUuid && item.milkTypeUuid !== prev.milkTypeUuid) return false
        if (itemDate < prev.fromDate) return false
        if (itemDate > prev.toDate) return false
        return true
      }).sort(compareCollectionsByDate)
      return {
        ...prev,
        collections: refreshed,
        totalQty: refreshed.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
        totalAmount: refreshed.reduce((sum, item) => sum + Number(item.grossAmount || 0), 0),
      }
    })
  }, [collections, generatedBill?.farmerUuid, generatedBill?.fromDate, generatedBill?.milkTypeUuid, generatedBill?.toDate])

  const openBill = () => {
    const selectedFarmer = farmerOptions.find((item) => item.uuid === filters.farmerUuid) || null
    const selectedCollections = collections.filter((item) => {
      const itemDate = (item.collectionDate || '').slice(0, 10)
      if (selectedFarmer?.uuid && item.farmerUuid !== selectedFarmer.uuid) return false
      if (filters.milkTypeUuid && item.milkTypeUuid !== filters.milkTypeUuid) return false
      if (itemDate < filters.fromDate) return false
      if (itemDate > filters.toDate) return false
      return true
    }).sort(compareCollectionsByDate)

    setGeneratedBill({
      uuid: crypto.randomUUID(),
      billNo: buildBillNo(selectedFarmer?.farmerName || 'ALL', filters.fromDate, filters.toDate),
      settlementUuid: '',
      settlementStatus: 'GENERATED',
      generatedAt: new Date().toISOString(),
      farmerUuid: selectedFarmer?.uuid || '',
      farmerName: selectedFarmer?.farmerName || 'All Farmers',
      milkTypeUuid: filters.milkTypeUuid,
      fromDate: filters.fromDate,
      toDate: filters.toDate,
      collections: selectedCollections,
      totalQty: selectedCollections.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
      totalAmount: selectedCollections.reduce((sum, item) => sum + Number(item.grossAmount || 0), 0),
    })
    setPayments([])
    setActiveSavedBillUuid('')
  }

  const splitCollectionsByShift = useMemo(() => {
    const morning: CollectionListItem[] = []
    const evening: CollectionListItem[] = []

    for (const item of filteredCollections) {
      const label = resolveShiftLabel(item).toLowerCase()
      const hour = Number((item.collectionTime || '').slice(0, 2))
      const isMorning = label.includes('morning') || label === 'm' || (!Number.isNaN(hour) && hour < 12)

      if (isMorning) {
        morning.push(item)
      } else {
        evening.push(item)
      }
    }

    return { morning, evening }
  }, [filteredCollections, shiftNameByUuid])

  const combinedBillRows = useMemo(() => {
    const rows: Array<{
      date: string
      morningItem?: CollectionListItem
      eveningItem?: CollectionListItem
    }> = []

    const morningByDate = new Map<string, CollectionListItem[]>()
    const eveningByDate = new Map<string, CollectionListItem[]>()

    for (const item of splitCollectionsByShift.morning) {
      const dateKey = (item.collectionDate || '').slice(0, 10)
      const bucket = morningByDate.get(dateKey)
      if (bucket) {
        bucket.push(item)
      } else {
        morningByDate.set(dateKey, [item])
      }
    }

    for (const item of splitCollectionsByShift.evening) {
      const dateKey = (item.collectionDate || '').slice(0, 10)
      const bucket = eveningByDate.get(dateKey)
      if (bucket) {
        bucket.push(item)
      } else {
        eveningByDate.set(dateKey, [item])
      }
    }

    const allDates = [...new Set([...morningByDate.keys(), ...eveningByDate.keys()])].sort((left, right) => left.localeCompare(right))

    for (const dateKey of allDates) {
      const morningItems = morningByDate.get(dateKey) || []
      const eveningItems = eveningByDate.get(dateKey) || []
      const rowCount = Math.max(morningItems.length, eveningItems.length)

      for (let index = 0; index < rowCount; index += 1) {
        rows.push({
          date: dateKey,
          morningItem: morningItems[index],
          eveningItem: eveningItems[index],
        })
      }
    }

    return rows
  }, [splitCollectionsByShift.evening, splitCollectionsByShift.morning])

  const combinedBillRowCount = combinedBillRows.length
  const showFatColumn = filteredCollections.some((item) => item.fat != null && Number(item.fat) > 0)
  const showSnfColumn = filteredCollections.some((item) => item.snf != null && Number(item.snf) > 0)
  const hiddenQualityColumnCount = (showFatColumn ? 1 : 0) + (showSnfColumn ? 1 : 0)

  const printCollections = generatedBill?.collections || []
  const printShowFatColumn = printCollections.some((item) => item.fat != null && Number(item.fat) > 0)
  const printShowSnfColumn = printCollections.some((item) => item.snf != null && Number(item.snf) > 0)
  const printHiddenQualityColumnCount = (printShowFatColumn ? 1 : 0) + (printShowSnfColumn ? 1 : 0)

  const printSplitCollectionsByShift = useMemo(() => {
    const morning: CollectionListItem[] = []
    const evening: CollectionListItem[] = []

    for (const item of printCollections) {
      const label = resolveShiftLabel(item).toLowerCase()
      const hour = Number((item.collectionTime || '').slice(0, 2))
      const isMorning = label.includes('morning') || label === 'm' || (!Number.isNaN(hour) && hour < 12)

      if (isMorning) {
        morning.push(item)
      } else {
        evening.push(item)
      }
    }

    return { morning, evening }
  }, [printCollections, shiftNameByUuid])

  const printCombinedBillRows = useMemo(() => {
    const rows: Array<{
      date: string
      morningItem?: CollectionListItem
      eveningItem?: CollectionListItem
    }> = []

    const morningByDate = new Map<string, CollectionListItem[]>()
    const eveningByDate = new Map<string, CollectionListItem[]>()

    for (const item of printSplitCollectionsByShift.morning) {
      const dateKey = (item.collectionDate || '').slice(0, 10)
      const bucket = morningByDate.get(dateKey)
      if (bucket) {
        bucket.push(item)
      } else {
        morningByDate.set(dateKey, [item])
      }
    }

    for (const item of printSplitCollectionsByShift.evening) {
      const dateKey = (item.collectionDate || '').slice(0, 10)
      const bucket = eveningByDate.get(dateKey)
      if (bucket) {
        bucket.push(item)
      } else {
        eveningByDate.set(dateKey, [item])
      }
    }

    const allDates = [...new Set([...morningByDate.keys(), ...eveningByDate.keys()])].sort((left, right) => left.localeCompare(right))

    for (const dateKey of allDates) {
      const morningItems = morningByDate.get(dateKey) || []
      const eveningItems = eveningByDate.get(dateKey) || []
      const rowCount = Math.max(morningItems.length, eveningItems.length)

      for (let index = 0; index < rowCount; index += 1) {
        rows.push({
          date: dateKey,
          morningItem: morningItems[index],
          eveningItem: eveningItems[index],
        })
      }
    }

    return rows
  }, [printSplitCollectionsByShift.evening, printSplitCollectionsByShift.morning])

  const printMilkTypeLabel = useMemo(() => {
    const selectedMilkType = milkTypes.find((item) => item.uuid === generatedBill?.milkTypeUuid)
    if (!generatedBill?.milkTypeUuid) return 'All Milk Types'
    return selectedMilkType?.name || selectedMilkType?.code || 'Selected Milk Type'
  }, [generatedBill?.milkTypeUuid, milkTypes])

  const reloadSavedBillsFromBackend = async () => {
    if (!authToken) {
      setSavedBills([])
      return
    }

    const page = await api.searchSettlements(authToken, {
      page: 0,
      size: 200,
    })

    const next: SavedBill[] = (page.content || []).map((settlement) => {
      const billCollections = deriveCollectionsForBill(
        settlement.farmerUuid,
        '',
        settlement.fromDate,
        settlement.toDate,
      )

      return {
        uuid: settlement.uuid,
        billNo: settlement.settlementNo,
        settlementUuid: settlement.uuid,
        settlementStatus: settlement.status,
        generatedAt: new Date().toISOString(),
        farmerUuid: settlement.farmerUuid,
        farmerName: settlement.farmerName,
        milkTypeUuid: '',
        fromDate: settlement.fromDate,
        toDate: settlement.toDate,
        collections: billCollections,
        totalQty: billCollections.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
        totalAmount: Number(settlement.netPayable || 0),
        payments: [],
      }
    })

    setSavedBills(next.sort((left, right) => right.toDate.localeCompare(left.toDate)))
  }

  useEffect(() => {
    if (!authToken) return

    void reloadSavedBillsFromBackend().catch((error) => {
      setBillingActionError(error instanceof Error ? error.message : 'Failed to load saved bills from backend.')
    })
  }, [authToken, collections])

  const filteredSavedBills = useMemo(() => {
    const query = savedBillSearch.trim().toLowerCase()
    if (!query) return savedBills

    return savedBills.filter((bill) => {
      return (
        bill.billNo.toLowerCase().includes(query) ||
        bill.farmerName.toLowerCase().includes(query) ||
        formatDisplayDate(bill.fromDate).includes(query) ||
        formatDisplayDate(bill.toDate).includes(query)
      )
    })
  }, [savedBillSearch, savedBills])

  const addPayment = async () => {
    if (!generatedBill || paymentForm.amount <= 0) return
    if (!authToken) {
      setBillingActionError('You are not logged in. Please login again to record payment.')
      return
    }
    if (!generatedBill.settlementUuid) {
      setBillingActionError('Save the bill first to generate settlement before recording payment.')
      return
    }

    setBillingActionBusy(true)
    setBillingActionError('')
    setBillingActionSuccess('')

    try {
      const created = await api.createPayment(authToken, {
        settlementUuid: generatedBill.settlementUuid,
        paymentDate: paymentForm.paymentDate,
        paymentMode: paymentForm.mode,
        remarks: paymentForm.remarks.trim(),
      })

      const settlementAfterPay = await api.paySettlement(authToken, generatedBill.settlementUuid)

      setPayments((prev) => [
        ...prev,
        {
          uuid: created.uuid,
          paymentNo: created.paymentNo,
          paymentDate: created.paymentDate,
          amount: Number(created.paidAmount || 0),
          mode: created.paymentMode,
          referenceNo: paymentForm.referenceNo.trim(),
          remarks: created.remarks || paymentForm.remarks.trim(),
        },
      ])

      setPaymentForm((prev) => ({ ...prev, amount: 0, referenceNo: '', remarks: '' }))
      setGeneratedBill((prev) => (prev
        ? {
          ...prev,
          settlementStatus: settlementAfterPay.status,
          totalAmount: Number(settlementAfterPay.netPayable || prev.totalAmount),
        }
        : prev))
      await reloadSavedBillsFromBackend()
      setBillingActionSuccess('Payment recorded in backend successfully.')
    } catch (error) {
      setBillingActionError(error instanceof Error ? error.message : 'Failed to record payment in backend.')
    } finally {
      setBillingActionBusy(false)
    }
  }

  const saveGeneratedBill = async () => {
    if (!generatedBill) return
    if (!authToken) {
      setBillingActionError('You are not logged in. Please login again to save bill.')
      return
    }

    setBillingActionBusy(true)
    setBillingActionError('')
    setBillingActionSuccess('')

    try {
      let savedUuid = generatedBill.settlementUuid || ''
      let successMessage = 'Bill updated in backend successfully.'

      if (generatedBill.settlementUuid) {
        const settlement = await api.updateSettlement(authToken, generatedBill.settlementUuid, {
          bonusAmount: 0,
          loanRecovery: 0,
          advanceRecovery: 0,
          otherDeduction: 0,
          remarks: 'Updated from billing screen',
        })

        setGeneratedBill((prev) => (prev
          ? {
            ...prev,
            settlementStatus: settlement.status,
            totalAmount: Number(settlement.netPayable || prev.totalAmount),
          }
          : prev))
      } else {
        const settlement = await api.generateSettlement(authToken, {
          farmerUuid: generatedBill.farmerUuid,
          fromDate: generatedBill.fromDate,
          toDate: generatedBill.toDate,
          bonusAmount: 0,
          loanRecovery: 0,
          advanceRecovery: 0,
          otherDeduction: 0,
          remarks: 'Generated from billing screen',
        })

        setGeneratedBill((prev) => (prev
          ? {
            ...prev,
            billNo: settlement.settlementNo || prev.billNo,
            settlementUuid: settlement.uuid,
            settlementStatus: settlement.status,
            totalAmount: Number(settlement.netPayable || prev.totalAmount),
          }
          : prev))

        savedUuid = settlement.uuid
        successMessage = 'Bill saved to backend successfully.'
      }

      await reloadSavedBillsFromBackend()
      setActiveSavedBillUuid(savedUuid || activeSavedBillUuid || generatedBill.uuid)
      setBillingActionSuccess(successMessage)
    } catch (error) {
      setBillingActionError(error instanceof Error ? error.message : 'Failed to save bill.')
    } finally {
      setBillingActionBusy(false)
    }
  }

  const openSavedBill = async (bill: SavedBill) => {
    const billCollections = deriveCollectionsForBill(
      bill.farmerUuid,
      bill.milkTypeUuid,
      bill.fromDate,
      bill.toDate,
    )

    setGeneratedBill({
      uuid: bill.uuid,
      billNo: bill.billNo,
      settlementUuid: bill.settlementUuid,
      settlementStatus: bill.settlementStatus,
      generatedAt: bill.generatedAt,
      farmerUuid: bill.farmerUuid,
      farmerName: bill.farmerName,
      milkTypeUuid: bill.milkTypeUuid,
      fromDate: bill.fromDate,
      toDate: bill.toDate,
      collections: billCollections,
      totalQty: billCollections.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
      totalAmount: bill.totalAmount,
    })
    setPayments([])
    setActiveSavedBillUuid(bill.uuid)

    if (!authToken || !bill.settlementUuid) {
      return
    }

    try {
      const settlement = await api.getSettlement(authToken, bill.settlementUuid)
      const refreshedBillCollections = deriveCollectionsForBill(
        settlement.farmerUuid,
        '',
        settlement.fromDate,
        settlement.toDate,
      )

      setGeneratedBill((prev) => (prev
        ? {
          ...prev,
          billNo: settlement.settlementNo,
          settlementStatus: settlement.status,
          farmerUuid: settlement.farmerUuid,
          farmerName: settlement.farmerName,
          fromDate: settlement.fromDate,
          toDate: settlement.toDate,
          collections: refreshedBillCollections,
          totalQty: refreshedBillCollections.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
          totalAmount: Number(settlement.netPayable || 0),
        }
        : prev))

      const page = await api.searchPayments(authToken, {
        settlementUuid: bill.settlementUuid,
        page: 0,
        size: 200,
      })

      const refreshedPayments: PaymentRecord[] = (page.content || []).map((item) => ({
        uuid: item.uuid,
        paymentNo: item.paymentNo,
        paymentDate: item.paymentDate,
        amount: Number(item.paidAmount || 0),
        mode: item.paymentMode,
        referenceNo: '',
        remarks: item.remarks || '',
      }))

      setPayments(refreshedPayments)
    } catch {
      // Fallback to locally saved payment history when search API fails.
    }
  }

  const deleteSavedBill = async (billUuid: string) => {
    if (!authToken) {
      setBillingActionError('You are not logged in. Please login again to delete bill.')
      return
    }

    setBillingActionBusy(true)
    setBillingActionError('')
    setBillingActionSuccess('')
    try {
      await api.deleteSettlement(authToken, billUuid)
      await reloadSavedBillsFromBackend()
      if (activeSavedBillUuid === billUuid) {
        setActiveSavedBillUuid('')
        setGeneratedBill(null)
        setPayments([])
      }
      setBillingActionSuccess('Bill deleted from backend successfully.')
    } catch (error) {
      setBillingActionError(error instanceof Error ? error.message : 'Failed to delete bill from backend.')
    } finally {
      setBillingActionBusy(false)
    }
  }

  const printBill = async () => {
    if (!generatedBill) return

    const printNode = printSheetRef.current
    if (!printNode) return

    setBillingActionError('')
    setBillingActionSuccess('')

    if (authToken && generatedBill.settlementUuid) {
      setBillingActionBusy(true)
      try {
        const pdfBlob = await api.getSettlementPdf(authToken, generatedBill.settlementUuid)
        const pdfUrl = URL.createObjectURL(pdfBlob)
        const popup = window.open(pdfUrl, '_blank', 'noopener,noreferrer')

        if (!popup) {
          const link = document.createElement('a')
          link.href = pdfUrl
          link.target = '_blank'
          link.rel = 'noopener noreferrer'
          link.download = `${generatedBill.billNo}.pdf`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        }

        setTimeout(() => URL.revokeObjectURL(pdfUrl), 60_000)
        setBillingActionSuccess('Bill status: Jasper PDF generated successfully.')
        return
      } catch (error) {
        setBillingActionError(error instanceof Error
          ? `${error.message} Showing HTML fallback preview.`
          : 'Unable to generate Jasper PDF. Showing HTML fallback preview.')
      } finally {
        setBillingActionBusy(false)
      }
    }

    const printableMarkup = printNode.outerHTML
    const styleMarkup = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map((node) => node.outerHTML)
      .join('\n')

    const printDocumentMarkup = `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>${generatedBill.billNo}</title>
          ${styleMarkup}
          <style>
            @page {
              size: A4 landscape;
              margin: 6mm;
            }

            html,
            body {
              margin: 0;
              padding: 0;
              background: #fff;
            }

            body {
              font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
              font-size: 10px;
              line-height: 1.15;
            }

            .payment-billing-print-sheet {
              display: block !important;
              position: static !important;
              inset: auto !important;
              visibility: visible !important;
              margin: 0;
            }

            .payment-billing-print-filter-grid {
              gap: 6px;
              margin-bottom: 6px;
            }

            .payment-billing-print-filter-grid article {
              padding: 4px 6px;
            }

            .payment-billing-print-filter-grid span {
              font-size: 9px;
            }

            .payment-billing-print-filter-grid strong {
              font-size: 10px;
            }

            .payment-billing-print-filter-grid small {
              font-size: 9px;
            }

            .payment-billing-print-dual-table {
              font-size: 9px;
            }

            .payment-billing-print-dual-table th,
            .payment-billing-print-dual-table td {
              padding: 2px 4px;
            }

            .payment-billing-print-dual-table thead tr:first-child th {
              font-size: 9px;
              letter-spacing: 0.02em;
            }
          </style>
        </head>
        <body>
          ${printableMarkup}
        </body>
      </html>
    `

    const printWindow = window.open('', '_blank', 'noopener,noreferrer,width=900,height=1000')
    if (printWindow) {
      printWindow.document.open()
      printWindow.document.write(printDocumentMarkup)
      printWindow.document.close()

      const triggerPrint = () => {
        printWindow.focus()
        printWindow.print()
        printWindow.close()
      }

      if (printWindow.document.readyState === 'complete') {
        setTimeout(triggerPrint, 120)
      } else {
        printWindow.addEventListener('load', () => setTimeout(triggerPrint, 120), { once: true })
      }
      return
    }

    // Popup blocked: print from a hidden iframe so PDF/print still works.
    const iframe = document.createElement('iframe')
    iframe.style.position = 'fixed'
    iframe.style.right = '0'
    iframe.style.bottom = '0'
    iframe.style.width = '0'
    iframe.style.height = '0'
    iframe.style.border = '0'
    iframe.setAttribute('aria-hidden', 'true')
    document.body.appendChild(iframe)

    const iframeWindow = iframe.contentWindow
    if (!iframeWindow) {
      document.body.removeChild(iframe)
      setBillingActionError('Unable to start print preview. Please try again.')
      return
    }

    iframeWindow.document.open()
    iframeWindow.document.write(printDocumentMarkup)
    iframeWindow.document.close()

    const cleanupIframe = () => {
      if (iframe.parentNode) {
        iframe.parentNode.removeChild(iframe)
      }
    }

    const triggerIframePrint = () => {
      iframeWindow.focus()
      iframeWindow.print()
      setTimeout(cleanupIframe, 1200)
    }

    iframeWindow.addEventListener('afterprint', cleanupIframe, { once: true })

    if (iframeWindow.document.readyState === 'complete') {
      setTimeout(triggerIframePrint, 120)
    } else {
      iframeWindow.addEventListener('load', () => setTimeout(triggerIframePrint, 120), { once: true })
    }
  }

  return (
    <section className="panel panel-payment-billing">
      <div className="panel-head">
        <div>
          <p className="eyebrow">Payments</p>
          <h2>Milk Billing Statement</h2>
          <p className="subtle">English layout of the attached billing template for bill generation and payment management.</p>
        </div>
        <button type="button" onClick={loadCollections} disabled={busy}>
          Reload Collections
        </button>
      </div>

      <div className="payment-billing-grid">
        <section className="payment-billing-card payment-billing-card-main">
          <div className="payment-billing-card-head">
            <h3>Bill Header</h3>
          </div>

          <div className="form two-col payment-billing-form payment-billing-filter-row">
            <label className="payment-filter-farmer">
              Farmer
              <select
                value={filters.farmerUuid}
                onChange={(event) => setFilters((prev) => ({ ...prev, farmerUuid: event.target.value }))}
              >
                {farmerOptions.map((farmer) => (
                  <option key={farmer.uuid} value={farmer.uuid}>
                    {farmer.farmerName}
                  </option>
                ))}
              </select>
            </label>

            <label className="payment-filter-milk-type">
              Milk Type
              <select
                value={filters.milkTypeUuid}
                onChange={(event) => setFilters((prev) => ({ ...prev, milkTypeUuid: event.target.value }))}
              >
                <option value="">All Milk Types</option>
                {milkTypes.map((milkType) => (
                  <option key={milkType.uuid} value={milkType.uuid}>
                    {milkType.name || milkType.code}
                  </option>
                ))}
              </select>
            </label>

            <label className="payment-filter-from-date">
              From date
              <input type="date" value={filters.fromDate} onChange={(event) => setFilters((prev) => ({ ...prev, fromDate: event.target.value }))} />
            </label>

            <label className="payment-filter-to-date">
              To date
              <input type="date" value={filters.toDate} onChange={(event) => setFilters((prev) => ({ ...prev, toDate: event.target.value }))} />
            </label>

            <label className="payment-filter-count">
              Collections found
              <input readOnly value={String(filteredCollections.length)} />
            </label>
          </div>

          <div className="table-wrap payment-collection-table-wrap payment-template-table-wrap">
            <table className="payment-billing-dual-table">
              <colgroup>
                <col className="payment-col-shared-date" />
                <col className="payment-col-collection-no" />
                <col className="payment-col-qty" />
                {showFatColumn && <col className="payment-col-quality" />}
                {showSnfColumn && <col className="payment-col-quality" />}
                <col className="payment-col-rate" />
                <col className="payment-col-amount" />
                <col className="payment-col-collection-no" />
                <col className="payment-col-qty" />
                {showFatColumn && <col className="payment-col-quality" />}
                {showSnfColumn && <col className="payment-col-quality" />}
                <col className="payment-col-rate" />
                <col className="payment-col-amount" />
                <col className="payment-col-total" />
                <col className="payment-col-total" />
              </colgroup>
              <thead>
                <tr>
                  <th rowSpan={2} className="payment-billing-shared-date-head">Date</th>
                  <th colSpan={2 + (showFatColumn ? 1 : 0) + (showSnfColumn ? 1 : 0) + 2}>Morning Collection</th>
                  <th colSpan={2 + (showFatColumn ? 1 : 0) + (showSnfColumn ? 1 : 0) + 2}>Evening Collection</th>
                  <th colSpan={2} className="payment-billing-shared-total-head">Day Total</th>
                </tr>
                <tr>
                  <th>Collection No</th>
                  <th>Qty</th>
                  {showFatColumn && <th>Fat</th>}
                  {showSnfColumn && <th>SNF</th>}
                  <th>Rate</th>
                  <th className="payment-billing-divider-cell">Amount</th>
                  <th>Collection No</th>
                  <th>Qty</th>
                  {showFatColumn && <th>Fat</th>}
                  {showSnfColumn && <th>SNF</th>}
                  <th>Rate</th>
                  <th>Amount</th>
                  <th className="payment-billing-shared-total-start">Total Milk</th>
                  <th className="payment-billing-shared-total-cell">Total for the day</th>
                </tr>
              </thead>
              <tbody>
                {combinedBillRowCount === 0 && (
                  <tr>
                    <td colSpan={3 + ((2 + (showFatColumn ? 1 : 0) + (showSnfColumn ? 1 : 0) + 2) * 2)}>No collection data found for this filter.</td>
                  </tr>
                )}
                {combinedBillRows.map((row, index) => {
                  const morningItem = row.morningItem
                  const eveningItem = row.eveningItem
                  const sharedDate = formatDisplayDate(row.date)
                  const morningQty = Number(morningItem?.quantity || 0)
                  const eveningQty = Number(eveningItem?.quantity || 0)
                  const morningAmount = Number(morningItem?.grossAmount || 0)
                  const eveningAmount = Number(eveningItem?.grossAmount || 0)
                  const totalMilkForRow = morningQty + eveningQty
                  const totalAmountForRow = morningAmount + eveningAmount

                  return (
                    <tr key={`${morningItem?.uuid || 'morning-empty'}-${eveningItem?.uuid || 'evening-empty'}-${index}`}>
                      <td className="payment-billing-shared-date-cell">{sharedDate}</td>
                      <td>{morningItem?.collectionNo || '-'}</td>
                      <td>{morningItem ? morningItem.quantity : '-'}</td>
                      {showFatColumn && <td>{morningItem?.fat != null ? morningItem.fat : '-'}</td>}
                      {showSnfColumn && <td>{morningItem?.snf != null ? morningItem.snf : '-'}</td>}
                      <td>{morningItem ? formatAmount(getRowRate(morningItem)) : '-'}</td>
                      <td className="payment-billing-divider-cell">{morningItem ? formatAmount(morningItem.grossAmount) : '-'}</td>
                      <td>{eveningItem?.collectionNo || '-'}</td>
                      <td>{eveningItem ? eveningItem.quantity : '-'}</td>
                      {showFatColumn && <td>{eveningItem?.fat != null ? eveningItem.fat : '-'}</td>}
                      {showSnfColumn && <td>{eveningItem?.snf != null ? eveningItem.snf : '-'}</td>}
                      <td>{eveningItem ? formatAmount(getRowRate(eveningItem)) : '-'}</td>
                      <td>{eveningItem ? formatAmount(eveningItem.grossAmount) : '-'}</td>
                      <td className="payment-billing-shared-total-start">{formatAmount(totalMilkForRow)}</td>
                      <td className="payment-billing-shared-total-cell">{formatAmount(totalAmountForRow)}</td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr className="payment-template-footer-row">
                  <td className="payment-billing-shared-date-cell">Totals</td>
                  <td colSpan={1}>Morning Totals</td>
                  <td>{formatAmount(splitCollectionsByShift.morning.reduce((sum, item) => sum + Number(item.quantity || 0), 0))}</td>
                  {hiddenQualityColumnCount > 0 && <td colSpan={hiddenQualityColumnCount} />}
                  <td>{formatAmount(splitCollectionsByShift.morning.reduce((sum, item) => sum + Number(item.quantity || 0), 0) > 0 ? splitCollectionsByShift.morning.reduce((sum, item) => sum + Number(item.grossAmount || 0), 0) / splitCollectionsByShift.morning.reduce((sum, item) => sum + Number(item.quantity || 0), 0) : 0)}</td>
                  <td className="payment-billing-divider-cell">{formatAmount(splitCollectionsByShift.morning.reduce((sum, item) => sum + Number(item.grossAmount || 0), 0))}</td>
                  <td colSpan={1}>Evening Totals</td>
                  <td>{formatAmount(splitCollectionsByShift.evening.reduce((sum, item) => sum + Number(item.quantity || 0), 0))}</td>
                  {hiddenQualityColumnCount > 0 && <td colSpan={hiddenQualityColumnCount} />}
                  <td>{formatAmount(splitCollectionsByShift.evening.reduce((sum, item) => sum + Number(item.quantity || 0), 0) > 0 ? splitCollectionsByShift.evening.reduce((sum, item) => sum + Number(item.grossAmount || 0), 0) / splitCollectionsByShift.evening.reduce((sum, item) => sum + Number(item.quantity || 0), 0) : 0)}</td>
                  <td>{formatAmount(splitCollectionsByShift.evening.reduce((sum, item) => sum + Number(item.grossAmount || 0), 0))}</td>
                  <td className="payment-billing-shared-total-start">{formatAmount((generatedBill?.totalQty ?? totalQty) || 0)}</td>
                  <td className="payment-billing-shared-total-cell">{formatAmount((generatedBill?.totalAmount ?? totalAmount) || 0)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="payment-billing-generate-action">
            <button type="button" className="payment-primary-btn" onClick={openBill} disabled={busy || billingActionBusy}>
              Generate Bill
            </button>
            <button
              type="button"
              className="payment-secondary-btn"
              onClick={() => void saveGeneratedBill()}
              disabled={!generatedBill || busy || billingActionBusy || generatedBill?.settlementStatus === 'PAID'}
            >
              {getSaveButtonLabel(generatedBill, activeSavedBillUuid)}
            </button>
            <button type="button" className="payment-secondary-btn" onClick={printBill} disabled={!generatedBill || busy || billingActionBusy}>
              Print / Save PDF
            </button>
          </div>

          {billingActionError && <p className="field-error">{billingActionError}</p>}
          {billingActionSuccess && <p className="subtle">{billingActionSuccess}</p>}

          <div className="payment-billing-summary-grid">
            <article>
              <p>Total quantity</p>
              <strong>{formatAmount(generatedBill?.totalQty ?? totalQty)}</strong>
            </article>
            <article>
              <p>Total amount</p>
              <strong>{formatAmount(generatedBill?.totalAmount ?? totalAmount)}</strong>
            </article>
            <article>
              <p>Average rate</p>
              <strong>{formatAmount(generatedBill ? (generatedBill.totalQty > 0 ? generatedBill.totalAmount / generatedBill.totalQty : 0) : averageRate)}</strong>
            </article>
            <article>
              <p>Collection count</p>
              <strong>{generatedBill?.collections.length ?? filteredCollections.length}</strong>
            </article>
          </div>
        </section>

      </div>

      <div className="payment-billing-summary-dock">
        <section className="payment-billing-card payment-billing-card-summary">
          <div className="payment-billing-card-head">
            <h3>Payment Summary</h3>
            <div className="payment-billing-pill-wrap">
              <span className="payment-billing-pill">{generatedBill ? generatedBill.billNo : 'No bill generated'}</span>
              {generatedBill && (
                <span className={getSettlementStatusClassName(generatedBill.settlementStatus)}>
                  {getSettlementStatusLabel(generatedBill.settlementStatus)}
                </span>
              )}
            </div>
          </div>

          <div className="payment-billing-bill-meta">
            <article>
              <span>Farmer</span>
              <strong>{generatedBill?.farmerName || 'Select farmer and generate bill'}</strong>
            </article>
            <article>
              <span>Bill period</span>
              <strong>{generatedBill ? `${formatDisplayDate(generatedBill.fromDate)} to ${formatDisplayDate(generatedBill.toDate)}` : 'Not generated'}</strong>
            </article>
            <article>
              <span>Bill amount</span>
              <strong>{formatAmount(generatedBill?.totalAmount || 0)}</strong>
            </article>
            <article>
              <span>Outstanding</span>
              <strong>{formatAmount(balanceAmount)}</strong>
            </article>
          </div>

          <div className="form two-col payment-billing-form">
            <label>
              Payment date
              <input type="date" value={paymentForm.paymentDate} onChange={(event) => setPaymentForm((prev) => ({ ...prev, paymentDate: event.target.value }))} disabled={!generatedBill} />
            </label>
            <label>
              Amount
              <input type="number" step="0.01" min="0" value={paymentForm.amount} onChange={(event) => setPaymentForm((prev) => ({ ...prev, amount: Number(event.target.value) }))} disabled={!generatedBill} />
            </label>
            <label>
              Payment mode
              <select value={paymentForm.mode} onChange={(event) => setPaymentForm((prev) => ({ ...prev, mode: event.target.value as PaymentMode }))} disabled={!generatedBill}>
                {PAYMENT_MODES.map((mode) => (
                  <option key={mode} value={mode}>{mode}</option>
                ))}
              </select>
            </label>
            <label>
              Reference no.
              <input value={paymentForm.referenceNo} onChange={(event) => setPaymentForm((prev) => ({ ...prev, referenceNo: event.target.value }))} disabled={!generatedBill} />
            </label>
            <label className="payment-field-wide">
              Remarks
              <input value={paymentForm.remarks} onChange={(event) => setPaymentForm((prev) => ({ ...prev, remarks: event.target.value }))} disabled={!generatedBill} />
            </label>
            <button
              type="button"
              className="payment-primary-btn payment-field-wide"
              onClick={() => void addPayment()}
              disabled={!generatedBill || busy || billingActionBusy || balanceAmount <= 0 || generatedBill?.settlementStatus === 'PAID'}
            >
              Record Payment
            </button>
          </div>

          <div className="table-wrap payment-ledger-wrap">
            <table>
              <thead>
                <tr>
                  <th>Sr</th>
                  <th>Date</th>
                  <th>Mode</th>
                  <th>Amount</th>
                  <th>Reference</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {payments.length === 0 && (
                  <tr>
                    <td colSpan={6}>No payments recorded for the current bill.</td>
                  </tr>
                )}
                {payments.map((item, index) => (
                  <tr key={item.uuid}>
                    <td>{index + 1}</td>
                    <td>{formatDisplayDate(item.paymentDate)}</td>
                    <td>{item.mode}</td>
                    <td>{formatAmount(item.amount)}</td>
                    <td>{item.referenceNo || '-'}</td>
                    <td>{item.remarks || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="payment-billing-footer-summary">
            <article>
              <span>Bill Amount</span>
              <strong>{formatAmount(generatedBill?.totalAmount || totalAmount)}</strong>
            </article>
            <article>
              <span>Paid Total</span>
              <strong>{formatAmount(paidAmount)}</strong>
            </article>
            <article>
              <span>Outstanding</span>
              <strong>{formatAmount(balanceAmount)}</strong>
            </article>
            <article>
              <span>Collection Count</span>
              <strong>{generatedBill?.collections.length || filteredCollections.length}</strong>
            </article>
          </div>
        </section>

        <section className="payment-billing-card payment-billing-saved-section">
          <div className="payment-billing-card-head">
            <h3>Saved Bills</h3>
            <input
              type="search"
              value={savedBillSearch}
              onChange={(event) => setSavedBillSearch(event.target.value)}
              placeholder="Search bill, farmer, or date"
              aria-label="Search saved bills"
            />
          </div>

          <div className="payment-billing-saved-list">
            {filteredSavedBills.length === 0 && <p className="subtle">No saved bills found.</p>}
            {filteredSavedBills.map((bill) => (
              <article key={bill.uuid} className="payment-billing-saved-item">
                <strong>{bill.billNo}</strong>
                <span>{bill.farmerName}</span>
                <span className={getSettlementStatusClassName(bill.settlementStatus)}>
                  {getSettlementStatusLabel(bill.settlementStatus)}
                </span>
                <small>{formatDisplayDate(bill.fromDate)} to {formatDisplayDate(bill.toDate)}</small>
                <small>
                  Qty {formatAmount(bill.totalQty)} | Amount {formatAmount(bill.totalAmount)}
                </small>
                <div className="payment-billing-saved-actions">
                  <button type="button" className="payment-secondary-btn" onClick={() => void openSavedBill(bill)}>
                    View / Edit
                  </button>
                  <button
                    type="button"
                    className="payment-secondary-btn"
                    onClick={() => void deleteSavedBill(bill.uuid)}
                    disabled={bill.settlementStatus === 'PAID'}
                    title={bill.settlementStatus === 'PAID' ? 'Paid settlements cannot be deleted.' : 'Delete settlement'}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      {generatedBill && (
        <section ref={printSheetRef} className="payment-billing-print-sheet" aria-label="Printable bill preview">
          <div className="payment-billing-print-filter-grid">
            <article>
              <span>Farmer</span>
              <strong>{generatedBill.farmerName}</strong>
              <small>{branchDisplay || 'Main Branch'}</small>
            </article>
            <article>
              <span>Milk Type</span>
              <strong>{printMilkTypeLabel}</strong>
            </article>
            <article>
              <span>From date</span>
              <strong>{formatDisplayDate(generatedBill.fromDate)}</strong>
            </article>
            <article>
              <span>To date</span>
              <strong>{formatDisplayDate(generatedBill.toDate)}</strong>
            </article>
            <article className="payment-billing-print-collection-count">
              <span>Collections found</span>
              <strong>{generatedBill.collections.length}</strong>
            </article>
          </div>

          <div className="table-wrap payment-template-table-wrap payment-billing-print-table-wrap">
            <table className="payment-billing-dual-table payment-billing-print-dual-table">
              <colgroup>
                <col className="payment-col-shared-date" />
                <col className="payment-col-collection-no" />
                <col className="payment-col-qty" />
                {printShowFatColumn && <col className="payment-col-quality" />}
                {printShowSnfColumn && <col className="payment-col-quality" />}
                <col className="payment-col-rate" />
                <col className="payment-col-amount" />
                <col className="payment-col-collection-no" />
                <col className="payment-col-qty" />
                {printShowFatColumn && <col className="payment-col-quality" />}
                {printShowSnfColumn && <col className="payment-col-quality" />}
                <col className="payment-col-rate" />
                <col className="payment-col-amount" />
                <col className="payment-col-total" />
                <col className="payment-col-total" />
              </colgroup>
              <thead>
                <tr>
                  <th rowSpan={2} className="payment-billing-shared-date-head">Date</th>
                  <th colSpan={2 + (printShowFatColumn ? 1 : 0) + (printShowSnfColumn ? 1 : 0) + 2}>Morning Collection</th>
                  <th colSpan={2 + (printShowFatColumn ? 1 : 0) + (printShowSnfColumn ? 1 : 0) + 2}>Evening Collection</th>
                  <th colSpan={2} className="payment-billing-shared-total-head">Day Total</th>
                </tr>
                <tr>
                  <th>Collection No</th>
                  <th>Qty</th>
                  {printShowFatColumn && <th>Fat</th>}
                  {printShowSnfColumn && <th>SNF</th>}
                  <th>Rate</th>
                  <th className="payment-billing-divider-cell">Amount</th>
                  <th>Collection No</th>
                  <th>Qty</th>
                  {printShowFatColumn && <th>Fat</th>}
                  {printShowSnfColumn && <th>SNF</th>}
                  <th>Rate</th>
                  <th>Amount</th>
                  <th className="payment-billing-shared-total-start">Total Milk</th>
                  <th className="payment-billing-shared-total-cell">Total for the day</th>
                </tr>
              </thead>
              <tbody>
                {printCombinedBillRows.length === 0 && (
                  <tr>
                    <td colSpan={3 + ((2 + (printShowFatColumn ? 1 : 0) + (printShowSnfColumn ? 1 : 0) + 2) * 2)}>No collection data found for this filter.</td>
                  </tr>
                )}
                {printCombinedBillRows.map((row, index) => {
                  const morningItem = row.morningItem
                  const eveningItem = row.eveningItem
                  const sharedDate = formatDisplayDate(row.date)
                  const morningQty = Number(morningItem?.quantity || 0)
                  const eveningQty = Number(eveningItem?.quantity || 0)
                  const morningAmount = Number(morningItem?.grossAmount || 0)
                  const eveningAmount = Number(eveningItem?.grossAmount || 0)
                  const totalMilkForRow = morningQty + eveningQty
                  const totalAmountForRow = morningAmount + eveningAmount

                  return (
                    <tr key={`${morningItem?.uuid || 'morning-empty'}-${eveningItem?.uuid || 'evening-empty'}-${index}`}>
                      <td className="payment-billing-shared-date-cell">{sharedDate}</td>
                      <td>{morningItem?.collectionNo || '-'}</td>
                      <td>{morningItem ? morningItem.quantity : '-'}</td>
                      {printShowFatColumn && <td>{morningItem?.fat != null ? morningItem.fat : '-'}</td>}
                      {printShowSnfColumn && <td>{morningItem?.snf != null ? morningItem.snf : '-'}</td>}
                      <td>{morningItem ? formatAmount(getRowRate(morningItem)) : '-'}</td>
                      <td className="payment-billing-divider-cell">{morningItem ? formatAmount(morningItem.grossAmount) : '-'}</td>
                      <td>{eveningItem?.collectionNo || '-'}</td>
                      <td>{eveningItem ? eveningItem.quantity : '-'}</td>
                      {printShowFatColumn && <td>{eveningItem?.fat != null ? eveningItem.fat : '-'}</td>}
                      {printShowSnfColumn && <td>{eveningItem?.snf != null ? eveningItem.snf : '-'}</td>}
                      <td>{eveningItem ? formatAmount(getRowRate(eveningItem)) : '-'}</td>
                      <td>{eveningItem ? formatAmount(eveningItem.grossAmount) : '-'}</td>
                      <td className="payment-billing-shared-total-start">{formatAmount(totalMilkForRow)}</td>
                      <td className="payment-billing-shared-total-cell">{formatAmount(totalAmountForRow)}</td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr className="payment-template-footer-row">
                  <td className="payment-billing-shared-date-cell">Totals</td>
                  <td colSpan={1}>Morning Totals</td>
                  <td>{formatAmount(printSplitCollectionsByShift.morning.reduce((sum, item) => sum + Number(item.quantity || 0), 0))}</td>
                  {printHiddenQualityColumnCount > 0 && <td colSpan={printHiddenQualityColumnCount} />}
                  <td>{formatAmount(printSplitCollectionsByShift.morning.reduce((sum, item) => sum + Number(item.quantity || 0), 0) > 0 ? printSplitCollectionsByShift.morning.reduce((sum, item) => sum + Number(item.grossAmount || 0), 0) / printSplitCollectionsByShift.morning.reduce((sum, item) => sum + Number(item.quantity || 0), 0) : 0)}</td>
                  <td className="payment-billing-divider-cell">{formatAmount(printSplitCollectionsByShift.morning.reduce((sum, item) => sum + Number(item.grossAmount || 0), 0))}</td>
                  <td colSpan={1}>Evening Totals</td>
                  <td>{formatAmount(printSplitCollectionsByShift.evening.reduce((sum, item) => sum + Number(item.quantity || 0), 0))}</td>
                  {printHiddenQualityColumnCount > 0 && <td colSpan={printHiddenQualityColumnCount} />}
                  <td>{formatAmount(printSplitCollectionsByShift.evening.reduce((sum, item) => sum + Number(item.quantity || 0), 0) > 0 ? printSplitCollectionsByShift.evening.reduce((sum, item) => sum + Number(item.grossAmount || 0), 0) / printSplitCollectionsByShift.evening.reduce((sum, item) => sum + Number(item.quantity || 0), 0) : 0)}</td>
                  <td>{formatAmount(printSplitCollectionsByShift.evening.reduce((sum, item) => sum + Number(item.grossAmount || 0), 0))}</td>
                  <td className="payment-billing-shared-total-start">{formatAmount(generatedBill.totalQty || 0)}</td>
                  <td className="payment-billing-shared-total-cell">{formatAmount(generatedBill.totalAmount || 0)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>
      )}
    </section>
  )
}