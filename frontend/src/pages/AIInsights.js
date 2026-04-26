import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ChartBarIcon,
  ArrowPathIcon,
  CubeIcon,
  BoltIcon,
  CurrencyDollarIcon,
  ReceiptRefundIcon,
  ShieldCheckIcon,
  BanknotesIcon,
  UserGroupIcon,
  BellIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';
import {
  DemandForecastingView,
  SmartReorderView,
  InventoryOptimizationView,
  ProfitPricingView,
  ExpenseIntelligenceView,
  FraudDetectionView,
  SalesIntelligenceView,
  CustomerInsightsView,
  SmartAlertsView,
  SmartReportsView,
  AIAssistantView,
} from './ai/LiveAIViews';

const tabs = [
  { id: 'live-views', label: 'Live Views', icon: BoltIcon, component: null },
  { id: 'demand-forecasting', label: 'Demand Forecasting', icon: ChartBarIcon, component: DemandForecastingView },
  { id: 'smart-reorder', label: 'Smart Reorder', icon: ArrowPathIcon, component: SmartReorderView },
  { id: 'inventory-optimization', label: 'Inventory Optimization', icon: CubeIcon, component: InventoryOptimizationView },
  { id: 'profit-pricing', label: 'Profit & Pricing', icon: CurrencyDollarIcon, component: ProfitPricingView },
  { id: 'expense-intelligence', label: 'Expense Intelligence', icon: ReceiptRefundIcon, component: ExpenseIntelligenceView },
  { id: 'fraud-detection', label: 'Fraud Detection', icon: ShieldCheckIcon, component: FraudDetectionView },
  { id: 'sales-intelligence', label: 'Sales Intelligence', icon: BanknotesIcon, component: SalesIntelligenceView },
  { id: 'customer-insights', label: 'Customer Insights', icon: UserGroupIcon, component: CustomerInsightsView },
  { id: 'smart-alerts', label: 'Smart Alerts', icon: BellIcon, component: SmartAlertsView },
  { id: 'smart-reports', label: 'Smart Reports', icon: DocumentTextIcon, component: SmartReportsView },
  { id: 'ai-assistant', label: 'AI Assistant', icon: ChatBubbleLeftRightIcon, component: AIAssistantView },
];

const tabPath = (tabId) => (tabId === 'live-views' ? '/ai-insights/live-views' : `/ai-insights/${tabId}`);

const LiveViewsOverview = () => {
  const liveTabs = tabs.filter((tab) => tab.id !== 'live-views');

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {liveTabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <Link
            key={tab.id}
            to={tabPath(tab.id)}
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="inline-flex rounded-full bg-blue-50 p-3 text-blue-700">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="mt-4 text-lg font-semibold text-gray-900">{tab.label}</h2>
                <p className="mt-2 text-sm text-gray-600">
                  Open the live {tab.label.toLowerCase()} workspace with current system data.
                </p>
              </div>
              <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                Live
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

const AIInsights = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('live-views');

  useEffect(() => {
    const routeTab = location.pathname.split('/')[2];
    if (!routeTab) {
      setActiveTab('live-views');
      return;
    }

    if (tabs.some((tab) => tab.id === routeTab)) {
      setActiveTab(routeTab);
    }
  }, [location.pathname]);

  const ActiveView = useMemo(() => {
    return tabs.find((tab) => tab.id === activeTab)?.component || LiveViewsOverview;
  }, [activeTab]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900">AI Insights Hub</h1>
          <p className="mt-1 text-sm text-gray-600">
            Structured live AI tools backed by current inventory, alerts, customers, sales, and expense data.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.id === activeTab;

            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  navigate(tabPath(tab.id));
                }}
                className={`inline-flex items-center rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'border-blue-200 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:text-gray-900'
                }`}
              >
                <Icon className="mr-2 h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <ActiveView />
    </div>
  );
};

export default AIInsights;
