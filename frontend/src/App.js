import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from './hooks/useAuth';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import QuickActions from './pages/QuickActions';
import Inventory from './pages/Inventory';
import ProductTools from './pages/ProductTools';
import Assets from './pages/Assets';
import Transactions from './pages/Transactions';
import Suppliers from './pages/Suppliers';
import Customers from './pages/Customers';
import Analytics from './pages/Analytics';
import AIInsights from './pages/AIInsights';
import DemandForecasting from './pages/DemandForecasting';
import SmartReorder from './pages/SmartReorder';
import InventoryOptimization from './pages/InventoryOptimization';
import ProfitPricing from './pages/ProfitPricing';
import ExpenseIntelligence from './pages/ExpenseIntelligence';
import FraudDetection from './pages/FraudDetection';
import SalesIntelligence from './pages/SalesIntelligence';
import CustomerInsights from './pages/CustomerInsights';
import SmartAlerts from './pages/SmartAlerts';
import SmartReports from './pages/SmartReports';
import AIAssistant from './pages/AIAssistant';
import Users from './pages/Users';
import Alerts from './pages/Alerts';
import Expenses from './pages/Expenses';
import Purchases from './pages/Purchases';
import Sell from './pages/POS';
import StockAdjustments from './pages/StockAdjustments';
import StockTransfers from './pages/StockTransfers';
import Reports from './pages/Reports';
import StockReport from './pages/StockReport';
import ReportCategory from './pages/ReportCategory';
import MetadataManagement from './pages/MetadataManagement';
import PaymentAccounts from './pages/PaymentAccounts';
import Settings from './pages/Settings';
import ComingSoon from './pages/ComingSoon';
import LoadingSpinner from './components/LoadingSpinner';
import RealtimeQueryBridge from './components/RealtimeQueryBridge';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <RealtimeQueryBridge enabled={Boolean(user)} />
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/quick-actions" element={<QuickActions />} />
          
          {/* Products & Inventory */}
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/products" element={<Inventory />} />
          <Route path="/products/create" element={<Inventory initialShowForm={true} />} />
          <Route path="/products/:id" element={<Inventory />} />
          <Route path="/products/update-price" element={<ProductTools section="update-price" />} />
          <Route path="/products/labels" element={<ProductTools section="labels" />} />
          <Route path="/products/variations" element={<ProductTools section="variations" />} />
          <Route path="/products/import" element={<ProductTools section="import" />} />
          <Route path="/products/import-stock" element={<ProductTools section="import-stock" />} />
          <Route path="/products/price-groups" element={<ProductTools section="price-groups" />} />
          <Route path="/products/units" element={<MetadataManagement type="units" title="Units" />} />
          <Route path="/products/categories" element={<MetadataManagement type="categories" title="Categories" />} />
          <Route path="/products/brands" element={<MetadataManagement type="brands" title="Brands" />} />
          <Route path="/products/warranties" element={<MetadataManagement type="warranties" title="Warranties" />} />

          {/* Contacts */}
          <Route path="/contacts" element={<Customers />} />
          <Route path="/contacts/create" element={<Customers initialShowForm={true} />} />
          <Route path="/contacts/ledger" element={<Customers />} />
          <Route path="/contacts/sales-history" element={<Customers />} />
          <Route path="/contacts/due-payments" element={<Customers />} />
          <Route path="/contacts/analytics" element={<Customers />} />
          <Route path="/contacts/communication" element={<Customers />} />
          <Route path="/contacts/alerts-reminders" element={<Customers />} />
          <Route path="/contacts/import-export" element={<Customers />} />
          <Route path="/contacts/segments" element={<Customers />} />
          <Route path="/suppliers" element={<Suppliers />} />
          <Route path="/suppliers/create" element={<Suppliers initialShowForm={true} />} />

          {/* Purchases */}
          <Route path="/purchases" element={<Purchases />} />
          <Route path="/purchases/order" element={<Purchases initialShowForm={true} />} />
          <Route path="/purchases/create" element={<Purchases initialShowForm={true} />} />
          <Route path="/purchases/returns" element={<ComingSoon title="Purchase Returns" />} />

          {/* Sell */}
          <Route path="/sell" element={<Sell />} />

          {/* Stock */}
          <Route path="/stock-transfers" element={<StockTransfers />} />
          <Route path="/stock-adjustments" element={<StockAdjustments />} />

          {/* Expenses */}
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/expenses/create" element={<Expenses initialShowForm={true} />} />
          <Route path="/expenses/categories" element={<Expenses />} />

          {/* Payment Accounts */}
          <Route path="/payment-accounts" element={<PaymentAccounts />} />

          {/* Reports */}
          <Route path="/reports" element={<Reports />} />
          <Route path="/reports/stock" element={<StockReport />} />
          <Route path="/reports/:reportType" element={<ReportCategory />} />

          {/* Other Sections */}
          <Route path="/assets" element={<Assets />} />
          <Route path="/assets/create" element={<Assets initialShowForm={true} />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/ai-insights" element={<AIInsights />} />
        <Route path="/ai-insights/demand-forecasting" element={<DemandForecasting />} />
        <Route path="/ai-insights/smart-reorder" element={<SmartReorder />} />
        <Route path="/ai-insights/inventory-optimization" element={<InventoryOptimization />} />
        <Route path="/ai-insights/profit-pricing" element={<ProfitPricing />} />
        <Route path="/ai-insights/expense-intelligence" element={<ExpenseIntelligence />} />
        <Route path="/ai-insights/fraud-detection" element={<FraudDetection />} />
        <Route path="/ai-insights/sales-intelligence" element={<SalesIntelligence />} />
        <Route path="/ai-insights/customer-insights" element={<CustomerInsights />} />
        <Route path="/ai-insights/smart-alerts" element={<SmartAlerts />} />
        <Route path="/ai-insights/smart-reports" element={<SmartReports />} />
        <Route path="/ai-insights/ai-assistant" element={<AIAssistant />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/users" element={<Users />} />
          
          {/* Admin Tools */}
          <Route path="/backup" element={<ComingSoon title="Administer Backup" />} />
          <Route path="/modules" element={<ComingSoon title="Modules" />} />
          <Route path="/notifications" element={<ComingSoon title="Notification Templates" />} />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Layout>
    </motion.div>
  );
}

export default App;
