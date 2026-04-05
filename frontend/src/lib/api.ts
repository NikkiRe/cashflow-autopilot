import type {
  AppInfoDTO,
  CompanyDTO,
  CashAccountDTO,
  InvoiceDTO,
  ObligationDTO,
  BankTransactionDTO,
  ForecastPointDTO,
  DashboardSummaryDTO,
  CreateCompanyRequest,
  CreateCashAccountRequest,
  CreateInvoiceRequest,
  CreateObligationRequest,
  CreateBankTransactionRequest,
} from '@/types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`
    const hasJsonBody =
      options.body != null && typeof options.body === 'string'
    const config: RequestInit = {
      ...options,
      headers: {
        ...(hasJsonBody ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers,
      },
    }

    try {
      const response = await fetch(url, config)
      const text = await response.text()

      if (!response.ok) {
        let message = `HTTP ${response.status}`
        if (text) {
          try {
            const j = JSON.parse(text) as { message?: string; error?: string }
            message = j.message || j.error || text.slice(0, 240)
          } catch {
            message = text.slice(0, 240)
          }
        }
        throw new Error(message)
      }

      if (!text || response.status === 204) {
        return undefined as T
      }

      return JSON.parse(text) as T
    } catch (error) {
      if (import.meta.env.DEV) console.error(`API request failed: ${url}`, error)
      throw error
    }
  }

  private get<T>(path: string) {
    return this.request<T>(path)
  }

  private post<T>(path: string, body: unknown) {
    return this.request<T>(path, { method: 'POST', body: JSON.stringify(body) })
  }

  private del(path: string) {
    return this.request<void>(path, { method: 'DELETE' })
  }

  getAppInfo() {
    return this.get<AppInfoDTO>('/app/info')
  }

  getCompanies() {
    return this.get<CompanyDTO[]>('/companies')
  }

  getCompany(id: number) {
    return this.get<CompanyDTO>(`/companies/${id}`)
  }

  createCompany(data: CreateCompanyRequest) {
    return this.post<CompanyDTO>('/companies', data)
  }

  deleteCompany(id: number) {
    return this.del(`/companies/${id}`)
  }

  getCashAccountsByCompany(companyId: number) {
    return this.get<CashAccountDTO[]>(`/cash-accounts/company/${companyId}`)
  }

  getCashAccount(id: number) {
    return this.get<CashAccountDTO>(`/cash-accounts/${id}`)
  }

  createCashAccount(data: CreateCashAccountRequest) {
    return this.post<CashAccountDTO>('/cash-accounts', data)
  }

  deleteCashAccount(id: number) {
    return this.del(`/cash-accounts/${id}`)
  }

  getInvoicesByCashAccount(cashAccountId: number) {
    return this.get<InvoiceDTO[]>(`/invoices/cash-account/${cashAccountId}`)
  }

  getInvoice(id: number) {
    return this.get<InvoiceDTO>(`/invoices/${id}`)
  }

  createInvoice(data: CreateInvoiceRequest) {
    return this.post<InvoiceDTO>('/invoices', data)
  }

  deleteInvoice(id: number) {
    return this.del(`/invoices/${id}`)
  }

  getObligationsByCashAccount(cashAccountId: number) {
    return this.get<ObligationDTO[]>(`/obligations/cash-account/${cashAccountId}`)
  }

  getObligation(id: number) {
    return this.get<ObligationDTO>(`/obligations/${id}`)
  }

  createObligation(data: CreateObligationRequest) {
    return this.post<ObligationDTO>('/obligations', data)
  }

  deleteObligation(id: number) {
    return this.del(`/obligations/${id}`)
  }

  getBankTransactionsByCashAccount(cashAccountId: number) {
    return this.get<BankTransactionDTO[]>(`/bank-transactions/cash-account/${cashAccountId}`)
  }

  getBankTransaction(id: number) {
    return this.get<BankTransactionDTO>(`/bank-transactions/${id}`)
  }

  createBankTransaction(data: CreateBankTransactionRequest) {
    return this.post<BankTransactionDTO>('/bank-transactions', data)
  }

  deleteBankTransaction(id: number) {
    return this.del(`/bank-transactions/${id}`)
  }

  getForecast(cashAccountId: number, startDate: string, days = 91) {
    const params = new URLSearchParams({
      cashAccountId: String(cashAccountId),
      startDate,
      days: String(days),
    })
    return this.get<ForecastPointDTO[]>(`/forecast?${params}`)
  }

  getDashboardSummary(cashAccountId: number, startDate: string, days = 91) {
    const params = new URLSearchParams({
      cashAccountId: String(cashAccountId),
      startDate,
      days: String(days),
    })
    return this.get<DashboardSummaryDTO>(`/dashboard/summary?${params}`)
  }
}

export const api = new ApiClient()
