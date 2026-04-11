import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from 'react'
import { api } from '@/lib/api'
import type { CompanyDTO, CashAccountDTO, AppInfoDTO } from '@/types'

export interface PresentationStrip {
  disclaimer: string
  currencyLabel: string
  sampleDatasetSeededThisStartup: boolean
}

interface AccountContextType {
  companies: CompanyDTO[]
  cashAccounts: CashAccountDTO[]
  selectedCompanyId: number | null
  selectedCashAccountId: number | null
  startDate: string
  days: number
  loading: boolean
  error: string | null
  inFallbackMode: boolean
  appInfo: AppInfoDTO | null
  presentationStrip: PresentationStrip | null
  setSelectedCompanyId: (id: number | null) => void
  setSelectedCashAccountId: (id: number | null) => void
  setStartDate: (date: string) => void
  setDays: (days: number) => void
  loadCompanies: () => Promise<void>
  loadCashAccounts: (companyId: number) => Promise<void>
}

const AccountContext = createContext<AccountContextType | undefined>(undefined)

const FALLBACK_COMPANIES: CompanyDTO[] = [
  { id: -1, name: 'Demo Company', taxId: null, createdAt: new Date().toISOString() },
]

const FALLBACK_CASH_ACCOUNTS: CashAccountDTO[] = [
  {
    id: -1,
    name: 'Demo Cash Account',
    currency: 'USD',
    companyId: -1,
    accountNumber: null,
    active: true,
    createdAt: new Date().toISOString(),
  },
]

export function AccountProvider({ children }: { children: ReactNode }) {
  const [companies, setCompanies] = useState<CompanyDTO[]>([])
  const [cashAccounts, setCashAccounts] = useState<CashAccountDTO[]>([])
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null)
  const [selectedCashAccountId, setSelectedCashAccountId] = useState<number | null>(null)
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0])
  const [days, setDays] = useState(91)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [inFallbackMode, setInFallbackMode] = useState(false)
  const [appInfo, setAppInfo] = useState<AppInfoDTO | null>(null)

  const loadCashAccounts = useCallback(async (companyId: number) => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.getCashAccountsByCompany(companyId)
      setCashAccounts(data)
      if (data.length > 0) {
        setSelectedCashAccountId(data[0].id)
      }
    } catch (err) {
    } finally {
      setLoading(false)
    }
  }, [])

  const loadCompanies = async () => {
    try {
      setLoading(true)
      setError(null)
      const [data, info] = await Promise.all([
        api.getCompanies(),
        api.getAppInfo().catch(() => null),
      ])
      setAppInfo(info)
      setCompanies(data)
      setSelectedCompanyId((prev) => (data.length > 0 && prev === null ? data[0].id : prev))
    } catch (err) {
      setAppInfo(null)
      setCompanies(FALLBACK_COMPANIES)
      setCashAccounts(FALLBACK_CASH_ACCOUNTS)
      setSelectedCompanyId(FALLBACK_COMPANIES[0].id)
      setSelectedCashAccountId(FALLBACK_CASH_ACCOUNTS[0].id)
      setError('Backend unavailable — using demo mode')
      setInFallbackMode(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCompanies()
  }, [])

  useEffect(() => {
    if (inFallbackMode || selectedCompanyId === null) return
    void loadCashAccounts(selectedCompanyId)
  }, [selectedCompanyId, inFallbackMode, loadCashAccounts])

  const presentationStrip = useMemo((): PresentationStrip | null => {
    if (inFallbackMode || !appInfo?.presentationMode) return null
    return {
      disclaimer: appInfo.disclaimer,
      currencyLabel: appInfo.currencyLabel,
      sampleDatasetSeededThisStartup: appInfo.sampleDatasetSeededThisStartup,
    }
  }, [inFallbackMode, appInfo])

  const handleSetCompanyId = (id: number | null) => {
    setSelectedCompanyId(id)
    if (id === null) {
      setCashAccounts([])
      setSelectedCashAccountId(null)
    }
  }

  return (
    <AccountContext.Provider
      value={{
        companies,
        cashAccounts,
        selectedCompanyId,
        selectedCashAccountId,
        startDate,
        days,
        loading,
        error,
        inFallbackMode,
        appInfo,
        presentationStrip,
        setSelectedCompanyId: handleSetCompanyId,
        setSelectedCashAccountId,
        setStartDate,
        setDays,
        loadCompanies,
        loadCashAccounts,
      }}
    >
      {children}
    </AccountContext.Provider>
  )
}

export function useAccount() {
  const context = useContext(AccountContext)
  if (context === undefined) {
    throw new Error('useAccount must be used within an AccountProvider')
  }
  return context
}
