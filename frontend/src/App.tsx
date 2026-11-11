import React, { useState, useEffect } from 'react';
import { Layout } from './components/layout/Layout';
import { OverviewPage } from './pages/OverviewPage';
import { CustomerAnalyticsPage } from './pages/CustomerAnalyticsPage';
import { RetentionCohortPage } from './pages/RetentionCohortPage';
import { RFMSegmentationPage } from './pages/RFMSegmentationPage';
import { PurchaseBehaviourPage } from './pages/PurchaseBehaviourPage';
import { BusinessInsightsPage } from './pages/BusinessInsightsPage';
import { DataPipelinePage } from './pages/DataPipelinePage';
import { DataExplorerPage } from './pages/DataExplorerPage';
import {
  PageId,
  KPISummary,
  RFMSegmentMetric,
  CohortCell,
  CategoryMetric,
  PipelineStatus,
} from './types';
import {
  api,
  AUTHENTIC_KPI_DEFAULTS,
  AUTHENTIC_RFM_SEGMENTS,
  AUTHENTIC_COHORTS,
  AUTHENTIC_CATEGORIES,
} from './services/api';

export const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageId>('overview');
  const [dateRange, setDateRange] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isBackendLive, setIsBackendLive] = useState(false);

  // Analytical Data States
  const [kpis, setKpis] = useState<KPISummary>(AUTHENTIC_KPI_DEFAULTS);
  const [segments, setSegments] = useState<RFMSegmentMetric[]>(AUTHENTIC_RFM_SEGMENTS);
  const [cohorts, setCohorts] = useState<CohortCell[]>(AUTHENTIC_COHORTS);
  const [categories, setCategories] = useState<CategoryMetric[]>(AUTHENTIC_CATEGORIES);
  const [pipelineStatus, setPipelineStatus] = useState<PipelineStatus>({
    service_status: 'ready',
    database_status: 'PostgreSQL 16 connected (localhost:5432)',
    raw_dataset_verified: true,
    clean_marts_ready: true,
    last_execution_timestamp: '2026-11-11 11:28:03 UTC',
    total_records_analyzed: 99441,
    ml_model_status: 'RandomForest (100 estimators, 10-fold CV)',
  });

  const loadAllData = async () => {
    setIsRefreshing(true);
    const online = await api.checkHealth();
    setIsBackendLive(online);

    const [kpiData, rfmData, cohortData, catData, pipeData] = await Promise.all([
      api.getKPISummary(),
      api.getRFMSegments(),
      api.getCohorts(),
      api.getCategories(),
      api.getPipelineStatus(),
    ]);

    setKpis(kpiData);
    setSegments(rfmData);
    setCohorts(cohortData);
    setCategories(catData);
    setPipelineStatus(pipeData);
    setIsRefreshing(false);
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'overview':
        return (
          <OverviewPage
            kpis={kpis}
            segments={segments}
            onNavigate={(p) => setCurrentPage(p)}
          />
        );
      case 'customer-analytics':
        return <CustomerAnalyticsPage kpis={kpis} />;
      case 'retention-cohort':
        return <RetentionCohortPage cohorts={cohorts} />;
      case 'rfm-segmentation':
        return <RFMSegmentationPage segments={segments} />;
      case 'purchase-behaviour':
        return <PurchaseBehaviourPage categories={categories} />;
      case 'business-insights':
        return <BusinessInsightsPage />;
      case 'data-pipeline':
        return <DataPipelinePage status={pipelineStatus} onRefresh={loadAllData} />;
      case 'data-explorer':
        return <DataExplorerPage initialSearch={searchQuery} />;
      default:
        return (
          <OverviewPage
            kpis={kpis}
            segments={segments}
            onNavigate={(p) => setCurrentPage(p)}
          />
        );
    }
  };

  return (
    <Layout
      currentPage={currentPage}
      onSelectPage={(p) => setCurrentPage(p)}
      isBackendLive={isBackendLive}
      onRefresh={loadAllData}
      isRefreshing={isRefreshing}
      dateRange={dateRange}
      onChangeDateRange={setDateRange}
      searchQuery={searchQuery}
      onSearchChange={(q) => {
        setSearchQuery(q);
        if (q.trim() && currentPage !== 'data-explorer') {
          setCurrentPage('data-explorer');
        }
      }}
    >
      {renderCurrentPage()}
    </Layout>
  );
};

export default App;

