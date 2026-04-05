import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AccountProvider } from './contexts/AccountContext'
import { AppLayout } from './components/layout/AppLayout'
import { APP_NAV } from './config/appNavigation'

function App() {
  return (
    <BrowserRouter>
      <AccountProvider>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            {APP_NAV.map(({ segment, Page }) =>
              segment === '' ? (
                <Route key="/" index element={<Page />} />
              ) : (
                <Route key={segment} path={segment} element={<Page />} />
              )
            )}
          </Route>
        </Routes>
      </AccountProvider>
    </BrowserRouter>
  )
}

export default App
