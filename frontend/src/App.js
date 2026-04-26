import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { ThemeProvider } from './contexts/ThemeContext';
import { RealTimeProvider } from './contexts/RealTimeContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import QuickActions from './pages/QuickActions';
import AddAsset from './pages/quickactions/AddAsset';
import BackupDashboard from './pages/backup/BackupDashboard';
import CreateBackup from './pages/backup/CreateBackup';
import ScheduledBackups from './pages/backup/ScheduledBackups';
import BackupHistory from './pages/backup/BackupHistory';
import RestoreSystem from './pages/backup/RestoreSystem';
import StorageSettings from './pages/backup/StorageSettings';
import SecuritySettings from './pages/backup/SecuritySettings';
import BackupLogs from './pages/backup/BackupLogs';
import AlertsNotifications from './pages/backup/AlertsNotifications';
import AdvancedSettings from './pages/backup/AdvancedSettings';
import Profile from './pages/settings/Profile';
import Security from './pages/settings/Security';
import Notifications from './pages/settings/Notifications';
import SystemSettings from './pages/settings/SystemSettings';
import Appearance from './pages/settings/Appearance';
import Workspace from './pages/settings/Workspace';
import Integrations from './pages/settings/Integrations';
import Preferences from './pages/settings/Preferences';
import AuditLogs from './pages/settings/AuditLogs';
import RoleManagement from './pages/settings/RoleManagement';
import Users from './pages/Users';
import Customers from './pages/Customers';
import Inventory from './pages/Inventory';
import ProductTools from './pages/ProductTools';
import ProductWorkspace from './pages/ProductWorkspace';
import MetadataManagement from './pages/MetadataManagement';
import Purchases from './pages/Purchases';
import PurchaseOrders from './pages/purchases/PurchaseOrders';
import AddPurchase from './pages/purchases/AddPurchase';
import PurchaseReturns from './pages/purchases/PurchaseReturns';
import POS from './pages/POS';
import Invoices from './pages/Invoices';
import Payments from './pages/Payments';
import SalesReturns from './pages/SalesReturns';
import Quotations from './pages/Quotations';
import SalesReports from './pages/SalesReports';
import SalesAgents from './pages/SalesAgents';
import SalesHistory from './pages/SalesHistory';
// Import new sales pages
import AllSales from './pages/sales/AllSales';
import AddSalePOS from './pages/sales/AddSalePOS';
import SalesCustomers from './pages/sales/SalesCustomers';
import SalesInvoices from './pages/sales/SalesInvoices';
import SalesPayments from './pages/sales/SalesPayments';
import SalesQuotations from './pages/sales/SalesQuotations';
import SalesAgentsPage from './pages/sales/SalesAgents';
import StockTransfers from './pages/StockTransfers';
import StockAdjustments from './pages/StockAdjustments';
import Stocks from './pages/Stocks';
// Import Assets pages
import AssetDashboard from './pages/assets/AssetDashboard';
import ManageAssets from './pages/assets/ManageAssets';
import AssetCategories from './pages/assets/AssetCategories';
import AssetLocations from './pages/assets/AssetLocations';
import AssetAssignment from './pages/assets/AssetAssignment';
import AssetMaintenance from './pages/assets/AssetMaintenance';
import AssetDepreciation from './pages/assets/AssetDepreciation';
import AssetReports from './pages/assets/AssetReports';
import AssetDocuments from './pages/assets/AssetDocuments';
// Import User Management pages
import AllUsers from './pages/assets/AllUsers';
import AddUser from './pages/assets/AddUser';
import RolesPermissions from './pages/assets/RolesPermissions';
import UserPermissions from './pages/assets/UserPermissions';
import UserActivityLogs from './pages/assets/UserActivityLogs';
import BlockedInactiveUsers from './pages/assets/BlockedInactiveUsers';

// Import Suppliers pages
import AllSuppliers from './pages/suppliers/AllSuppliers';
import AddSupplier from './pages/suppliers/AddSupplier';
import SupplierProducts from './pages/suppliers/SupplierProducts';
import SupplierPurchaseOrders from './pages/suppliers/PurchaseOrders';
import SupplierPayments from './pages/suppliers/SupplierPayments';
import OutstandingDues from './pages/suppliers/OutstandingDues';
import SupplierPerformance from './pages/suppliers/SupplierPerformance';
import SupplierContracts from './pages/suppliers/SupplierContracts';
import DocumentsAttachments from './pages/suppliers/DocumentsAttachments';
import ReturnsToSupplier from './pages/suppliers/ReturnsToSupplier';
import SupplierReports from './pages/suppliers/SupplierReports';

// Import User Management pages
import UserManagement from './pages/userManagement/Users';
import Roles from './pages/userManagement/Roles';
import Permissions from './pages/userManagement/Permissions';
import RolePermissions from './pages/userManagement/RolePermissions';
import UserLogs from './pages/userManagement/UserLogs';

// Import Alerts pages
import AllAlerts from './pages/alerts/AllAlerts';
import InventoryAlerts from './pages/alerts/InventoryAlerts';
import PaymentAlerts from './pages/alerts/PaymentAlerts';
import AssetAlerts from './pages/alerts/AssetAlerts';
import ExpiryAlerts from './pages/alerts/ExpiryAlerts';
import UserActivityAlerts from './pages/alerts/UserActivityAlerts';
import SystemAlerts from './pages/alerts/SystemAlerts';
import AlertSettings from './pages/alerts/AlertSettings';
import NotificationChannels from './pages/alerts/NotificationChannels';
import AlertLogs from './pages/alerts/AlertLogs';

// Import Transactions pages
import SalesTransactions from './pages/transactions/SalesTransactions';
import PurchaseTransactions from './pages/transactions/PurchaseTransactions';
import ReturnsRefunds from './pages/transactions/ReturnsRefunds';
import TransactionPayments from './pages/transactions/Payments';
import InvoicesBilling from './pages/transactions/InvoicesBilling';
import StockMovement from './pages/transactions/StockMovement';
import ExpenseTracking from './pages/transactions/ExpenseTracking';
import TransactionHistory from './pages/transactions/TransactionHistory';
import PendingDuePayments from './pages/transactions/PendingDuePayments';
import DiscountsTaxes from './pages/transactions/DiscountsTaxes';
import TransactionReports from './pages/transactions/TransactionReports';
import AddTransaction from './pages/transactions/AddTransaction';
import ViewTransactions from './pages/transactions/ViewTransactions';
import PrintTransactions from './pages/transactions/PrintTransactions';
import DownloadTransactions from './pages/transactions/DownloadTransactions';
import Expenses from './pages/Expenses';
import PaymentAccounts from './pages/PaymentAccounts';
import PaymentAccountsAccounts from './pages/paymentAccounts/Accounts';
import PaymentAccountsTransactions from './pages/paymentAccounts/Transactions';
import PaymentAccountsReports from './pages/paymentAccounts/Reports';
import Reports from './pages/Reports';
import CustomerReports from './pages/reports/CustomerReports';
import UserActivityReports from './pages/reports/UserActivityReports';
import ReportCategory from './pages/ReportCategory';
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
import Alerts from './pages/Alerts';
import Settings from './pages/Settings';
import Assets from './pages/Assets';
import Transactions from './pages/Transactions';
import Suppliers from './pages/Suppliers';
import Analytics from './pages/Analytics';
import ComingSoon from './pages/ComingSoon';
import MobileDashboard from './components/MobileDashboard';
import Layout from './components/Layout';
import RealtimeQueryBridge from './components/RealtimeQueryBridge';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';
import { PRODUCT_SECTION_ROLES } from './components/ProductSectionNav';

const RoleGate = ({ userRole, allowedRoles, children }) => {
  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const LayoutPage = ({ children }) => (
  <Layout>
    <RealtimeQueryBridge />
    {children}
  </Layout>
);

const AdminPage = ({ userRole, children }) => (
  <RoleGate userRole={userRole} allowedRoles={['admin']}>
    <LayoutPage>{children}</LayoutPage>
  </RoleGate>
);

const ManagerPage = ({ userRole, children }) => (
  <RoleGate userRole={userRole} allowedRoles={['admin', 'manager']}>
    <LayoutPage>{children}</LayoutPage>
  </RoleGate>
);

const contactSectionRoles = {
  list: ['admin', 'manager', 'staff', 'viewer'],
  create: ['admin', 'manager', 'staff'],
  ledger: ['admin', 'manager', 'staff', 'viewer'],
  'sales-history': ['admin', 'manager', 'staff', 'viewer'],
  'due-payments': ['admin', 'manager', 'staff', 'viewer'],
  analytics: ['admin', 'manager', 'staff', 'viewer'],
  communication: ['admin', 'manager', 'staff', 'viewer'],
  'import-export': ['admin', 'manager'],
};

const ContactPage = ({ userRole, section = 'list', initialShowForm = false }) => (
  <RoleGate userRole={userRole} allowedRoles={contactSectionRoles[section] || contactSectionRoles.list}>
    <LayoutPage>
      <Customers section={section} initialShowForm={initialShowForm} />
    </LayoutPage>
  </RoleGate>
);

const ProductPage = ({ userRole, section = 'list', children }) => (
  <RoleGate userRole={userRole} allowedRoles={PRODUCT_SECTION_ROLES[section] || PRODUCT_SECTION_ROLES.list}>
    <LayoutPage>{children}</LayoutPage>
  </RoleGate>
);

function AppContent() {
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
      <ErrorBoundary>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/dashboard" element={<LayoutPage><Dashboard /></LayoutPage>} />
        <Route path="/dashboard/mobile" element={<MobileDashboard />} />
        <Route path="/dashboard/desktop" element={<Navigate to="/dashboard" replace />} />

        <Route path="/quick-actions" element={<LayoutPage><QuickActions /></LayoutPage>} />
        <Route path="/quick-actions/add-product" element={<Navigate to="/products/create" replace />} />
        <Route path="/quick-actions/new-sale" element={<Navigate to="/sell" replace />} />
        <Route path="/quick-actions/create-purchase" element={<Navigate to="/purchases/create" replace />} />
        <Route path="/quick-actions/add-user" element={<Navigate to="/user-management/users/create" replace />} />
        <Route path="/quick-actions/add-asset" element={<LayoutPage><AddAsset /></LayoutPage>} />
        <Route path="/quick-actions/transfer-stock" element={<Navigate to="/stock-transfers/create" replace />} />
        <Route path="/quick-actions/record-payment" element={<Navigate to="/payment-accounts" state={{ openTab: 'transactions', openTransactionForm: true, transactionType: 'deposit' }} replace />} />
        <Route path="/quick-actions/generate-invoice" element={<Navigate to="/sales/invoices" replace />} />
        <Route path="/quick-actions/report-issue" element={<Navigate to="/alerts/all" replace />} />
        <Route path="/quick-actions/search" element={<LayoutPage><QuickActions initialSection="search" /></LayoutPage>} />
        
        {/* Administrator Backup Routes */}
        <Route path="/backup/dashboard" element={<LayoutPage><BackupDashboard /></LayoutPage>} />
        <Route path="/backup/create" element={<LayoutPage><CreateBackup /></LayoutPage>} />
        <Route path="/backup/scheduled" element={<LayoutPage><ScheduledBackups /></LayoutPage>} />
        <Route path="/backup/history" element={<LayoutPage><BackupHistory /></LayoutPage>} />
        <Route path="/backup/restore" element={<LayoutPage><RestoreSystem /></LayoutPage>} />
        <Route path="/backup/storage" element={<LayoutPage><StorageSettings /></LayoutPage>} />
        <Route path="/backup/security" element={<LayoutPage><SecuritySettings /></LayoutPage>} />
        <Route path="/backup/logs" element={<LayoutPage><BackupLogs /></LayoutPage>} />
        <Route path="/backup/alerts" element={<LayoutPage><AlertsNotifications /></LayoutPage>} />
        <Route path="/backup/advanced" element={<LayoutPage><AdvancedSettings /></LayoutPage>} />
        
        <Route path="/inventory" element={<LayoutPage><Inventory /></LayoutPage>} />
        <Route path="/inventory/create" element={<LayoutPage><Inventory initialShowForm={true} /></LayoutPage>} />
        <Route path="/assets" element={<LayoutPage><Assets /></LayoutPage>} />
        <Route path="/assets/create" element={<LayoutPage><Assets initialShowForm={true} /></LayoutPage>} />
        <Route path="/transactions" element={<LayoutPage><Transactions /></LayoutPage>} />
        <Route path="/suppliers" element={<LayoutPage><Suppliers /></LayoutPage>} />
        <Route path="/suppliers/create" element={<LayoutPage><Suppliers initialShowForm={true} /></LayoutPage>} />
        <Route path="/analytics" element={<LayoutPage><Analytics /></LayoutPage>} />
        <Route path="/alerts" element={<LayoutPage><Alerts /></LayoutPage>} />
        <Route path="/settings" element={<LayoutPage><Settings /></LayoutPage>} />
        
        {/* Settings Routes */}
        <Route path="/settings/profile" element={<LayoutPage><Profile /></LayoutPage>} />
        <Route path="/settings/security" element={<LayoutPage><Security /></LayoutPage>} />
        <Route path="/settings/notifications" element={<LayoutPage><Notifications /></LayoutPage>} />
        <Route path="/settings/system" element={<LayoutPage><SystemSettings /></LayoutPage>} />
        <Route path="/settings/appearance" element={<LayoutPage><Appearance /></LayoutPage>} />
        <Route path="/settings/workspace" element={<LayoutPage><Workspace /></LayoutPage>} />
        <Route path="/settings/integrations" element={<LayoutPage><Integrations /></LayoutPage>} />
        <Route path="/settings/preferences" element={<LayoutPage><Preferences /></LayoutPage>} />
        <Route path="/settings/audit-logs" element={<LayoutPage><AuditLogs /></LayoutPage>} />
        
        <Route path="/payment-accounts" element={<LayoutPage><PaymentAccounts /></LayoutPage>} />

        <Route path="/users" element={<LayoutPage><Users /></LayoutPage>} />
        <Route path="/user-management/users/create" element={<LayoutPage><Users /></LayoutPage>} />

        <Route path="/sales-history" element={<LayoutPage><SalesHistory /></LayoutPage>} />

        <Route path="/contacts" element={<ContactPage userRole={user.role} section="list" />} />
        <Route path="/contacts/create" element={<ContactPage userRole={user.role} section="create" initialShowForm={true} />} />
        <Route path="/contacts/ledger" element={<ContactPage userRole={user.role} section="ledger" />} />
        <Route path="/contacts/sales-history" element={<ContactPage userRole={user.role} section="sales-history" />} />
        <Route path="/contacts/due-payments" element={<ContactPage userRole={user.role} section="due-payments" />} />
        <Route path="/contacts/analytics" element={<ContactPage userRole={user.role} section="analytics" />} />
        <Route path="/contacts/communication" element={<ContactPage userRole={user.role} section="communication" />} />
        <Route path="/contacts/import-export" element={<ContactPage userRole={user.role} section="import-export" />} />

        <Route path="/products" element={<ProductPage userRole={user.role} section="list"><Inventory /></ProductPage>} />
        <Route path="/products/create" element={<ProductPage userRole={user.role} section="create"><Inventory initialShowForm={true} /></ProductPage>} />
        <Route path="/products/pricing" element={<ProductPage userRole={user.role} section="pricing"><ProductWorkspace section="pricing" /></ProductPage>} />
        <Route path="/products/stock" element={<ProductPage userRole={user.role} section="stock"><ProductWorkspace section="stock" /></ProductPage>} />
        <Route path="/products/locations" element={<ProductPage userRole={user.role} section="locations"><ProductWorkspace section="locations" /></ProductPage>} />
        <Route path="/products/media" element={<ProductPage userRole={user.role} section="media"><ProductWorkspace section="media" /></ProductPage>} />
        <Route path="/products/reports" element={<ProductPage userRole={user.role} section="reports"><ProductWorkspace section="reports" /></ProductPage>} />
        <Route path="/products/low-stock" element={<ProductPage userRole={user.role} section="low-stock"><ProductWorkspace section="low-stock" /></ProductPage>} />
        <Route path="/products/stock-transfers" element={<ProductPage userRole={user.role} section="stock-transfers"><Navigate to="/stock-transfers" replace /></ProductPage>} />
        <Route path="/products/stock-adjustments" element={<ProductPage userRole={user.role} section="stock-adjustments"><Navigate to="/stock-adjustments" replace /></ProductPage>} />
        <Route path="/products/update-price" element={<Navigate to="/products/pricing" replace />} />
        <Route path="/products/labels" element={<ProductPage userRole={user.role} section="labels"><ProductTools section="labels" /></ProductPage>} />
        <Route path="/products/variations" element={<ProductPage userRole={user.role} section="variations"><ProductTools section="variations" /></ProductPage>} />
        <Route path="/products/import" element={<ProductPage userRole={user.role} section="import"><ProductTools section="import" /></ProductPage>} />
        <Route path="/products/import-stock" element={<ProductPage userRole={user.role} section="import-stock"><ProductTools section="import-stock" /></ProductPage>} />
        <Route path="/products/price-groups" element={<ProductPage userRole={user.role} section="price-groups"><ProductTools section="price-groups" /></ProductPage>} />
        <Route path="/products/units" element={<ProductPage userRole={user.role} section="units"><MetadataManagement type="units" title="Units" /></ProductPage>} />
        <Route path="/products/categories" element={<ProductPage userRole={user.role} section="categories"><MetadataManagement type="categories" title="Categories" /></ProductPage>} />
        <Route path="/products/brands" element={<ProductPage userRole={user.role} section="brands"><MetadataManagement type="brands" title="Brands" /></ProductPage>} />
        <Route path="/products/warranties" element={<ProductPage userRole={user.role} section="warranties"><MetadataManagement type="warranties" title="Warranties" /></ProductPage>} />

        <Route path="/purchases" element={<LayoutPage><Purchases /></LayoutPage>} />
        <Route path="/purchases/orders" element={<LayoutPage><PurchaseOrders /></LayoutPage>} />
        <Route path="/purchases/create" element={<LayoutPage><AddPurchase /></LayoutPage>} />
        <Route path="/purchases/returns" element={<LayoutPage><PurchaseReturns /></LayoutPage>} />

        <Route path="/sell" element={<LayoutPage><POS /></LayoutPage>} />
        <Route path="/sales" element={<LayoutPage><AllSales /></LayoutPage>} />
        <Route path="/sales/pos" element={<LayoutPage><AddSalePOS /></LayoutPage>} />
        <Route path="/sales/customers" element={<LayoutPage><SalesCustomers /></LayoutPage>} />
        <Route path="/sales/invoices" element={<LayoutPage><SalesInvoices /></LayoutPage>} />
        <Route path="/sales/payments" element={<LayoutPage><SalesPayments /></LayoutPage>} />
        <Route path="/sales/returns" element={<LayoutPage><SalesReturns /></LayoutPage>} />
        <Route path="/sales/quotations" element={<LayoutPage><SalesQuotations /></LayoutPage>} />
        <Route path="/sales/reports" element={<LayoutPage><SalesReports /></LayoutPage>} />
        <Route path="/sales/agents" element={<ManagerPage userRole={user.role}><SalesAgentsPage /></ManagerPage>} />

        <Route path="/stock-transfers" element={<LayoutPage><StockTransfers /></LayoutPage>} />
        <Route path="/stock-transfers/create" element={<LayoutPage><StockTransfers initialShowForm={true} /></LayoutPage>} />
        <Route path="/stock-adjustments" element={<LayoutPage><StockAdjustments /></LayoutPage>} />

        <Route path="/stocks" element={<LayoutPage><Stocks /></LayoutPage>} />

        {/* Assets Routes */}
        <Route path="/assets/dashboard" element={<LayoutPage><AssetDashboard /></LayoutPage>} />
        <Route path="/assets/manage" element={<LayoutPage><ManageAssets /></LayoutPage>} />
        <Route path="/assets/categories" element={<LayoutPage><AssetCategories /></LayoutPage>} />
        <Route path="/assets/locations" element={<LayoutPage><AssetLocations /></LayoutPage>} />
        <Route path="/assets/assignment" element={<LayoutPage><AssetAssignment /></LayoutPage>} />
        <Route path="/assets/maintenance" element={<LayoutPage><AssetMaintenance /></LayoutPage>} />
        <Route path="/assets/depreciation" element={<LayoutPage><AssetDepreciation /></LayoutPage>} />
        <Route path="/assets/reports" element={<LayoutPage><AssetReports /></LayoutPage>} />
        <Route path="/assets/documents" element={<LayoutPage><AssetDocuments /></LayoutPage>} />

        {/* User Management Routes */}
        <Route path="/assets/users" element={<LayoutPage><AllUsers /></LayoutPage>} />
        <Route path="/assets/add-user" element={<LayoutPage><AddUser /></LayoutPage>} />
        <Route path="/assets/roles" element={<LayoutPage><RolesPermissions /></LayoutPage>} />
        <Route path="/assets/permissions" element={<LayoutPage><UserPermissions /></LayoutPage>} />
        <Route path="/assets/activity-logs" element={<LayoutPage><UserActivityLogs /></LayoutPage>} />
        <Route path="/assets/blocked-users" element={<LayoutPage><BlockedInactiveUsers /></LayoutPage>} />

        {/* Suppliers Routes */}
        <Route path="/suppliers/all" element={<LayoutPage><AllSuppliers /></LayoutPage>} />
        <Route path="/suppliers/add" element={<LayoutPage><AddSupplier /></LayoutPage>} />
        <Route path="/suppliers/products" element={<LayoutPage><SupplierProducts /></LayoutPage>} />
        <Route path="/suppliers/purchase-orders" element={<LayoutPage><SupplierPurchaseOrders /></LayoutPage>} />
        <Route path="/suppliers/payments" element={<LayoutPage><SupplierPayments /></LayoutPage>} />
        <Route path="/suppliers/outstanding-dues" element={<LayoutPage><OutstandingDues /></LayoutPage>} />
        <Route path="/suppliers/performance" element={<LayoutPage><SupplierPerformance /></LayoutPage>} />
        <Route path="/suppliers/contracts" element={<LayoutPage><SupplierContracts /></LayoutPage>} />
        <Route path="/suppliers/documents" element={<LayoutPage><DocumentsAttachments /></LayoutPage>} />
        <Route path="/suppliers/returns" element={<LayoutPage><ReturnsToSupplier /></LayoutPage>} />
        <Route path="/suppliers/reports" element={<LayoutPage><SupplierReports /></LayoutPage>} />

        {/* User Management Routes */}
        <Route path="/user-management/users" element={<LayoutPage><UserManagement /></LayoutPage>} />
        <Route path="/user-management/roles" element={<LayoutPage><Roles /></LayoutPage>} />
        <Route path="/user-management/permissions" element={<LayoutPage><Permissions /></LayoutPage>} />
        <Route path="/user-management/role-permissions" element={<LayoutPage><RolePermissions /></LayoutPage>} />
        <Route path="/user-management/user-logs" element={<LayoutPage><UserLogs /></LayoutPage>} />

        {/* Alerts Routes */}
        <Route path="/alerts/all" element={<LayoutPage><AllAlerts /></LayoutPage>} />
        <Route path="/alerts/inventory" element={<LayoutPage><InventoryAlerts /></LayoutPage>} />
        <Route path="/alerts/payment" element={<LayoutPage><PaymentAlerts /></LayoutPage>} />
        <Route path="/alerts/asset" element={<LayoutPage><AssetAlerts /></LayoutPage>} />
        <Route path="/alerts/expiry" element={<LayoutPage><ExpiryAlerts /></LayoutPage>} />
        <Route path="/alerts/user-activity" element={<LayoutPage><UserActivityAlerts /></LayoutPage>} />
        <Route path="/alerts/system" element={<LayoutPage><SystemAlerts /></LayoutPage>} />
        <Route path="/alerts/settings" element={<LayoutPage><AlertSettings /></LayoutPage>} />
        <Route path="/alerts/channels" element={<LayoutPage><NotificationChannels /></LayoutPage>} />
        <Route path="/alerts/logs" element={<LayoutPage><AlertLogs /></LayoutPage>} />

        {/* Transactions Routes */}
        <Route path="/transactions/add" element={<LayoutPage><AddTransaction /></LayoutPage>} />
        <Route path="/transactions/view" element={<LayoutPage><ViewTransactions /></LayoutPage>} />
        <Route path="/transactions/print" element={<LayoutPage><PrintTransactions /></LayoutPage>} />
        <Route path="/transactions/download" element={<LayoutPage><DownloadTransactions /></LayoutPage>} />
        <Route path="/transactions/sales" element={<LayoutPage><SalesTransactions /></LayoutPage>} />
        <Route path="/transactions/purchases" element={<LayoutPage><PurchaseTransactions /></LayoutPage>} />
        <Route path="/transactions/returns" element={<LayoutPage><ReturnsRefunds /></LayoutPage>} />
        <Route path="/transactions/payments" element={<LayoutPage><TransactionPayments /></LayoutPage>} />
        <Route path="/transactions/invoices" element={<LayoutPage><InvoicesBilling /></LayoutPage>} />
        <Route path="/transactions/stock-movement" element={<LayoutPage><StockMovement /></LayoutPage>} />
        <Route path="/transactions/expenses" element={<LayoutPage><ExpenseTracking /></LayoutPage>} />
        <Route path="/transactions/history" element={<LayoutPage><TransactionHistory /></LayoutPage>} />
        <Route path="/transactions/pending-payments" element={<LayoutPage><PendingDuePayments /></LayoutPage>} />
        <Route path="/transactions/discounts-taxes" element={<LayoutPage><DiscountsTaxes /></LayoutPage>} />
        <Route path="/transactions/reports" element={<LayoutPage><TransactionReports /></LayoutPage>} />

        <Route path="/expenses" element={<LayoutPage><Expenses /></LayoutPage>} />
        <Route path="/expenses/create" element={<LayoutPage><Expenses initialShowForm={true} /></LayoutPage>} />
        <Route path="/expenses/categories" element={<LayoutPage><Expenses /></LayoutPage>} />

        <Route path="/payment-accounts" element={<LayoutPage><PaymentAccounts /></LayoutPage>} />
        <Route path="/payment-accounts/accounts" element={<LayoutPage><PaymentAccountsAccounts /></LayoutPage>} />
        <Route path="/payment-accounts/transactions" element={<LayoutPage><PaymentAccountsTransactions /></LayoutPage>} />
        <Route path="/payment-accounts/reports" element={<LayoutPage><PaymentAccountsReports /></LayoutPage>} />

        <Route path="/reports" element={<LayoutPage><Reports /></LayoutPage>} />
        <Route path="/reports/customers" element={<LayoutPage><CustomerReports /></LayoutPage>} />
        <Route path="/reports/suppliers" element={<LayoutPage><SupplierReports /></LayoutPage>} />
        <Route path="/reports/user-activity" element={<LayoutPage><UserActivityReports /></LayoutPage>} />
        <Route path="/reports/:reportType" element={<LayoutPage><ReportCategory /></LayoutPage>} />

        <Route path="/ai-insights" element={<LayoutPage><AIInsights /></LayoutPage>} />
        <Route path="/ai-insights/live-views" element={<LayoutPage><AIInsights /></LayoutPage>} />
        <Route path="/ai-insights/demand-forecasting" element={<LayoutPage><DemandForecasting /></LayoutPage>} />
        <Route path="/ai-insights/smart-reorder" element={<LayoutPage><SmartReorder /></LayoutPage>} />
        <Route path="/ai-insights/inventory-optimization" element={<LayoutPage><InventoryOptimization /></LayoutPage>} />
        <Route path="/ai-insights/profit-pricing" element={<LayoutPage><ProfitPricing /></LayoutPage>} />
        <Route path="/ai-insights/expense-intelligence" element={<LayoutPage><ExpenseIntelligence /></LayoutPage>} />
        <Route path="/ai-insights/fraud-detection" element={<LayoutPage><FraudDetection /></LayoutPage>} />
        <Route path="/ai-insights/sales-intelligence" element={<LayoutPage><SalesIntelligence /></LayoutPage>} />
        <Route path="/ai-insights/customer-insights" element={<LayoutPage><CustomerInsights /></LayoutPage>} />
        <Route path="/ai-insights/smart-alerts" element={<LayoutPage><SmartAlerts /></LayoutPage>} />
        <Route path="/ai-insights/smart-reports" element={<LayoutPage><SmartReports /></LayoutPage>} />
        <Route path="/ai-insights/ai-assistant" element={<LayoutPage><AIAssistant /></LayoutPage>} />

        <Route path="/modules" element={<AdminPage userRole={user.role}><Settings initialTab="system" /></AdminPage>} />
        <Route path="/notifications" element={<AdminPage userRole={user.role}><Settings initialTab="notifications" /></AdminPage>} />
        <Route path="/backup" element={<AdminPage userRole={user.role}><Settings initialTab="system" /></AdminPage>} />
        <Route path="/profile" element={<LayoutPage><ComingSoon title="Profile" /></LayoutPage>} />
        <Route path="/help" element={<LayoutPage><ComingSoon title="Help & Support" /></LayoutPage>} />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <ThemeProvider>
      <RealTimeProvider>
        <AppContent />
      </RealTimeProvider>
    </ThemeProvider>
  );
}

export default App;
