import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/Layout'
import SuppliersPage from './pages/SuppliersPage'
import SupplierDetailPage from './pages/SupplierDetailPage'
import MessagePage from './pages/MessagePage'
import HistoryPage from './pages/HistoryPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<SuppliersPage />} />
            <Route path="/suppliers/:rowIndex" element={<SupplierDetailPage />} />
            <Route path="/suppliers/:rowIndex/message" element={<MessagePage />} />
            <Route path="/history" element={<HistoryPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
