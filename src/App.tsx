import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { Toaster } from 'sonner';
// Layouts
import { DashboardLayout } from './components/layout/DashboardLayout';
// Pages
import { Dashboard } from './pages/Dashboard';
import { Products } from './pages/Products';
import { AddProduct } from './pages/AddProduct';
import { Categories } from './pages/Categories';
import { Orders } from './pages/Orders';
import { OrderDetail } from './pages/OrderDetail';
import { Returns } from './pages/Returns';
import { Reports } from './pages/Reports';
import { Payouts } from './pages/Payouts';
import { Settings } from './pages/Settings';
import { Support } from './pages/Support';
import { VendorApplication } from './pages/VendorApplication';
import { Login } from './pages/Login';
import { OnboardingChecklist } from './pages/OnboardingChecklist';
export function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/apply" element={<VendorApplication />} />
          <Route path="/login" element={<Login />} />

          {/* Onboarding Route */}
          <Route path="/onboarding" element={<OnboardingChecklist />} />

          {/* Dashboard Routes */}
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="products/new" element={<AddProduct />} />
            <Route path="products/:id/edit" element={<AddProduct />} />
            <Route path="categories" element={<Categories />} />
            <Route path="orders" element={<Orders />} />
            <Route path="orders/:id" element={<OrderDetail />} />
            <Route path="returns" element={<Returns />} />
            <Route path="reports" element={<Reports />} />
            <Route path="payouts" element={<Payouts />} />
            <Route path="settings" element={<Settings />} />
            <Route path="support" element={<Support />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </ThemeProvider>);

}