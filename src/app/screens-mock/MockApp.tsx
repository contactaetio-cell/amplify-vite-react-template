import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Sidebar } from './Sidebar';
import { Home } from './Home';
import { Dashboard as DashboardScreen } from './Dashboard';
import { DataSourceConnection } from './DataSourceConnection';
import { UploadProgress } from './UploadProgress';
import { InsightReview } from './InsightReview';
import { FinalValidation } from './FinalValidation';
import { InsightDetail } from './InsightDetail';
import { MyLibrary } from './MyLibrary';
import { InsightLibrary } from './InsightLibrary';
import { Help } from './Help';
import { ManualEntry } from './ManualEntry';
import { BrowseInsights } from './BrowseInsights';
import { TopInsights } from './TopInsights';
import { SearchResults } from './SearchResults';
import { Toaster } from '../components/ui/sonner';
import { toast } from 'sonner';
import { mockPathToScreen, mockScreenPaths, type MockScreen } from './routesMock';

type Screen = 
  | 'dashboard'
  | 'home'
  | 'ingestion'
  | 'upload-progress'
  | 'insight-review'
  | 'final-validation'
  | 'library'
  | 'insight-detail'
  | 'my-library'
  | 'manual-entry'
  | 'browse-insights'
  | 'top-insights'
  | 'search-results'
  | 'help'
  | 'settings';

const screenByMockRoute: Partial<Record<MockScreen, Screen>> = {
  home: 'home',
  ingestion: 'ingestion',
  'upload-progress': 'upload-progress',
  upload: 'upload-progress',
  extraction: 'upload-progress',
  structuring: 'upload-progress',
  validation: 'insight-review',
  publish: 'final-validation',
  'insight-review': 'insight-review',
  'final-validation': 'final-validation',
  library: 'library',
  discovery: 'browse-insights',
  'search-results': 'search-results',
  'my-library': 'my-library',
  'manual-entry': 'manual-entry',
  help: 'help',
  settings: 'settings',
  'insight-detail': 'insight-detail',
};

const pathByScreen: Partial<Record<Screen, string>> = {
  dashboard: '/mock/dashboard',
  home: mockScreenPaths.home,
  ingestion: mockScreenPaths.ingestion,
  'upload-progress': mockScreenPaths['upload-progress'],
  'insight-review': mockScreenPaths['insight-review'],
  'final-validation': mockScreenPaths['final-validation'],
  library: mockScreenPaths.library,
  'my-library': mockScreenPaths['my-library'],
  'manual-entry': mockScreenPaths['manual-entry'],
  'browse-insights': mockScreenPaths.discovery,
  'search-results': mockScreenPaths['search-results'],
  help: mockScreenPaths.help,
  settings: mockScreenPaths.settings,
};

const knownScreens = new Set<Screen>([
  'dashboard',
  'home',
  'ingestion',
  'upload-progress',
  'insight-review',
  'final-validation',
  'library',
  'insight-detail',
  'my-library',
  'manual-entry',
  'browse-insights',
  'top-insights',
  'search-results',
  'help',
  'settings',
]);

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentScreen, setCurrentScreen] = useState<Screen>('dashboard');
  const [selectedInsightId, setSelectedInsightId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const legacyInsightPrefix = '/mock/dashboard/insight/';
    if (location.pathname.startsWith(legacyInsightPrefix)) {
      const insightId = location.pathname.slice(legacyInsightPrefix.length);
      if (insightId) {
        setSelectedInsightId(insightId);
      }
      setCurrentScreen('insight-detail');
      return;
    }

    const legacyScreenPrefix = '/mock/dashboard/';
    if (location.pathname.startsWith(legacyScreenPrefix)) {
      const legacyScreen = location.pathname.slice(legacyScreenPrefix.length);
      const normalizedScreen = legacyScreen === 'search' ? 'search-results' : legacyScreen;
      if (knownScreens.has(normalizedScreen as Screen)) {
        const candidate = normalizedScreen as Screen;
        setCurrentScreen(candidate);
      }
      return;
    }

    if (location.pathname === '/mock/dashboard') {
      setCurrentScreen('dashboard');
      return;
    }

    const insightPrefix = `${mockScreenPaths['insight-detail']}/`;
    if (location.pathname.startsWith(insightPrefix)) {
      const insightId = location.pathname.slice(insightPrefix.length);
      if (insightId) {
        setSelectedInsightId(insightId);
      }
      setCurrentScreen('insight-detail');
      return;
    }

    const mapped = screenByMockRoute[mockPathToScreen[location.pathname]];
    if (mapped) {
      setCurrentScreen(mapped);
    }
  }, [location.pathname]);

  const handleNavigate = (screen: string) => {
    const next = screen as Screen;
    setCurrentScreen(next);
    const targetPath = pathByScreen[next];
    if (targetPath) {
      navigate(targetPath);
    }
  };

  const handleSelectSource = (sourceId: string) => {
    void sourceId;
    toast.success('Connecting to data source...');
    setCurrentScreen('upload-progress');
  };

  const handleViewInsight = (id: string) => {
    setSelectedInsightId(id);
    setCurrentScreen('insight-detail');
    navigate(`${mockScreenPaths['insight-detail']}/${id}`);
  };

  const handlePublish = () => {
    toast.success('Insight published successfully!');
    handleNavigate('home');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'dashboard':
        return <DashboardScreen onViewInsight={handleViewInsight} onNavigate={handleNavigate} />;

      case 'home':
        return <Home onViewInsight={handleViewInsight} onNavigate={handleNavigate} />;
      
      case 'ingestion':
        return (
          <DataSourceConnection
            onSelectSource={handleSelectSource}
            onManualEntry={() => setCurrentScreen('manual-entry')}
          />
        );
      
      case 'upload-progress':
        return <UploadProgress onContinue={() => setCurrentScreen('insight-review')} />;
      
      case 'insight-review':
        return <InsightReview onApprove={() => setCurrentScreen('final-validation')} />;
      
      case 'final-validation':
        return (
          <FinalValidation
            onPublish={handlePublish}
            onEdit={() => setCurrentScreen('insight-review')}
          />
        );
      
      case 'library':
        return (
          <InsightLibrary
            onViewInsight={handleViewInsight}
            onBack={() => setCurrentScreen('home')}
          />
        );
      
      case 'insight-detail':
        return (
          <InsightDetail
            insightId={selectedInsightId}
            onBack={() => setCurrentScreen('home')}
            onViewRelated={handleViewInsight}
          />
        );
      
      case 'my-library':
        return <MyLibrary onViewInsight={handleViewInsight} onBack={() => setCurrentScreen('home')} />;
      
      case 'manual-entry':
        return (
          <ManualEntry
            onBack={() => setCurrentScreen('ingestion')}
            onSubmit={() => setCurrentScreen('insight-review')}
          />
        );
      
      case 'browse-insights':
        return <BrowseInsights onViewInsight={handleViewInsight} onBack={() => setCurrentScreen('home')} />;
      
      case 'top-insights':
        return <TopInsights onViewInsight={handleViewInsight} onBack={() => setCurrentScreen('home')} />;

      case 'search-results':
        return (
          <SearchResults
            searchQuery={searchQuery}
            onViewInsight={handleViewInsight}
            onSearch={setSearchQuery}
            onNavigate={handleNavigate}
          />
        );
      
      case 'help':
        return <Help />;
      
      case 'settings':
        return (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Settings</h2>
              <p className="text-gray-600">Settings screen coming soon</p>
            </div>
          </div>
        );
      
      default:
        return <Home onNavigate={handleNavigate} onViewInsight={handleViewInsight} />;
    }
  };

  return (
    <div className="size-full flex bg-white">
      <Sidebar currentScreen={currentScreen} onNavigate={handleNavigate} />
      {renderScreen()}
      <Toaster position="top-right" />
    </div>
  );
}
