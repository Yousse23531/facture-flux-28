import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Invoices from "./pages/Invoices";
import InvoiceForm from "./pages/InvoiceForm";
import InvoiceDetail from "./pages/InvoiceDetail";
import Clients from "./pages/Clients";
import ClientForm from "./pages/ClientForm";
import Products from "./pages/Products";
import ProductForm from "./pages/ProductForm";
import Reports from "./pages/Reports";
import Auth from "./pages/Auth";
import PurchaseOrders from "./pages/PurchaseOrders";
import PurchaseOrderForm from "./pages/PurchaseOrderForm";
import PurchaseOrderDetail from "./pages/PurchaseOrderDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HashRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/invoices" element={
            <ProtectedRoute>
              <Invoices />
            </ProtectedRoute>
          } />
          <Route path="/invoices/new" element={
            <ProtectedRoute>
              <InvoiceForm />
            </ProtectedRoute>
          } />
          <Route path="/invoices/:id" element={
            <ProtectedRoute>
              <InvoiceDetail />
            </ProtectedRoute>
          } />
          <Route path="/invoices/:id/edit" element={
            <ProtectedRoute>
              <InvoiceForm />
            </ProtectedRoute>
          } />
          <Route path="/clients" element={
            <ProtectedRoute>
              <Clients />
            </ProtectedRoute>
          } />
          <Route path="/clients/:id" element={
            <ProtectedRoute>
              <ClientForm />
            </ProtectedRoute>
          } />
          <Route path="/products" element={
            <ProtectedRoute>
              <Products />
            </ProtectedRoute>
          } />
          <Route path="/products/:id" element={
            <ProtectedRoute>
              <ProductForm />
            </ProtectedRoute>
          } />
          <Route path="/reports" element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          } />
          <Route path="/purchase-orders" element={
            <ProtectedRoute>
              <PurchaseOrders />
            </ProtectedRoute>
          } />
          <Route path="/purchase-orders/new" element={
            <ProtectedRoute>
              <PurchaseOrderForm />
            </ProtectedRoute>
          } />
          <Route path="/purchase-orders/:id" element={
            <ProtectedRoute>
              <PurchaseOrderDetail />
            </ProtectedRoute>
          } />
          <Route path="/purchase-orders/:id/edit" element={
            <ProtectedRoute>
              <PurchaseOrderForm />
            </ProtectedRoute>
          } />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;