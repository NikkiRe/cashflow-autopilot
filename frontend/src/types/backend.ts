export enum InvoiceStatus {
  ISSUED = 'ISSUED',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
  OVERDUE = 'OVERDUE',
}

export enum RecurrenceType {
  NONE = 'NONE',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
}

export enum TransactionDirection {
  IN = 'IN',
  OUT = 'OUT',
}

export interface CompanyDTO {
  id: number
  name: string
  taxId: string | null
  createdAt: string
}

export interface CashAccountDTO {
  id: number
  companyId: number
  name: string
  accountNumber: string | null
  currency: string
  active: boolean
  createdAt: string
}

export interface InvoiceDTO {
  id: number
  cashAccountId: number
  counterpartyId: number | null
  invoiceNumber: string | null
  issueDate: string
  dueDate: string
  amount: number
  currency: string
  status: InvoiceStatus
  description: string | null
  createdAt: string
}

export interface ObligationDTO {
  id: number
  cashAccountId: number
  name: string
  amount: number
  currency: string
  nextDueDate: string
  recurrence: RecurrenceType
  description: string | null
  active: boolean
  createdAt: string
}

export interface BankTransactionDTO {
  id: number
  cashAccountId: number
  bookedAt: string
  amount: number
  currency: string
  direction: TransactionDirection
  description: string | null
  referenceNumber: string | null
  createdAt: string
}

export interface ForecastPointDTO {
  date: string
  openingBalance: number
  expectedIn: number
  expectedOut: number
  closingBalance: number
}

export interface DashboardSummaryDTO {
  cashNow: number
  minCash: number
  minCashDate: string
  runwayDays: number
}

export interface CreateCompanyRequest {
  name: string
  taxId?: string
}

export interface CreateCashAccountRequest {
  companyId: number
  name: string
  accountNumber?: string
  currency: string
}

export interface CreateInvoiceRequest {
  cashAccountId: number
  counterpartyId?: number
  invoiceNumber?: string
  issueDate: string
  dueDate: string
  amount: number
  currency: string
  status: InvoiceStatus
  description?: string
}

export interface CreateObligationRequest {
  cashAccountId: number
  name: string
  amount: number
  currency: string
  nextDueDate: string
  recurrence: RecurrenceType
  description?: string
}

export interface AppInfoDTO {
  demoEnabled: boolean
  presentationMode: boolean
  noRealFunds: boolean
  disclaimer: string
  currencyLabel: string
  sampleDatasetSeededThisStartup: boolean
}

export interface CreateBankTransactionRequest {
  cashAccountId: number
  bookedAt: string
  amount: number
  currency: string
  direction: TransactionDirection
  description?: string
  referenceNumber?: string
}
