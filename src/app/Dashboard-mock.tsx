import { useEffect, useState } from 'react';
import { SidebarMock } from './screens-mock/Sidebar';
import { Home } from './screens-mock/Home';
import { DataSourceConnection } from './screens-mock/DataSourceConnection';
import { InsightReview } from './screens-mock/InsightReview';
import { FinalValidation } from './screens-mock/FinalValidation';
import { DiscoveryHome } from './screens-mock/DiscoveryHome';
import { SearchResults } from './screens-mock/SearchResults';
import { InsightDetail } from './screens-mock/InsightDetail';
import { MyLibrary } from './screens-mock/MyLibrary';
import { InsightLibrary } from './screens-mock/InsightLibrary';
import { Help } from './screens-mock/Help';
import { ManualEntry } from './screens-mock/ManualEntry';
import { UploadProgress } from './screens-mock/UploadProgress';
import { UploadStage } from './screens/processing/UploadStage';
import { ExtractionStage } from './screens/processing/ExtractionStage';
import { StructuringStage } from './screens/processing/StructuringStage';
import { ValidationStage } from './screens/processing/ValidationStage';
import { PublishStage } from './screens/processing/PublishStage';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';
import { useParams } from 'react-router-dom';
import { signOut } from 'aws-amplify/auth';
import { useLocation, useNavigate } from 'react-router';
import { mockPathToScreen, mockScreenPaths, type MockScreen } from './screens-mock/routesMock';

type Screen = MockScreen;

const isScreen = (value: string | undefined): value is Screen =>
  !!value && value in mockScreenPaths;

export default function DashboardMock() {
  const navigate = useNavigate();
  const location = useLocation();
  const { insightId, screen } = useParams<{ insightId?: string; screen?: string }>();
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInsightId, setSelectedInsightId] = useState<string>('');

  const getScreenPath = (nextScreen: Screen) => mockScreenPaths[nextScreen];

  const navigateToScreen = (nextScreen: Screen) => {
    setCurrentScreen(nextScreen);
    navigate(getScreenPath(nextScreen));
  };

  useEffect(() => {
    if (insightId) {
      setSelectedInsightId(insightId);
      setCurrentScreen('insight-detail');
      return;
    }

    const screenFromPath = mockPathToScreen[location.pathname];

    if (screenFromPath) {
      setCurrentScreen(screenFromPath);
      if (screenFromPath === 'search-results') {
        const params = new URLSearchParams(location.search);
        setSearchQuery(params.get('q') ?? '');
      }
      return;
    }

    if (isScreen(screen)) {
      setCurrentScreen(screen);
      navigate(getScreenPath(screen), { replace: true });
      return;
    }

    if (location.pathname === '/mock' || location.pathname === '/mock/dashboard') {
      setCurrentScreen('home');
      navigate(getScreenPath('home'), { replace: true });
    }
  }, [insightId, screen, location.pathname, location.search]);

  const handleNavigate = (target: string) => {
    if (isScreen(target)) {
      navigateToScreen(target);
      return;
    }

    const screen = mockPathToScreen[target];
    if (!screen) return;
    navigateToScreen(screen);
  };

  const handleSelectSource = (_sourceId: string) => {
    toast.success('Connecting to data source...');
    navigateToScreen('upload-progress');
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    navigate(`${getScreenPath('search-results')}?q=${encodeURIComponent(query)}`);
    setCurrentScreen('search-results');
  };

  const handleViewInsight = (id: string) => {
    setSelectedInsightId(id);
    setCurrentScreen('insight-detail');
    navigate(`${mockScreenPaths['insight-detail']}/${id}`);
  };

  const handlePublish = () => {
    toast.success('Insight published successfully!');
    navigateToScreen('discovery');
  };

  const logout = async () => {
    try {
      await signOut();
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Unable to log out. Please try again.');
    }
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <Home onViewInsight={handleViewInsight} onSearch={handleSearch} />;
  
      case 'ingestion':
        return (
          <DataSourceConnection
            onSelectSource={handleSelectSource}
            onManualEntry={() => navigateToScreen('manual-entry')}
          />
        );
      
      case 'upload':
        return <UploadStage onContinue={() => navigateToScreen('extraction')} />;

      case 'upload-progress':
        return <UploadProgress onContinue={() => navigateToScreen('insight-review')} />;

      case 'extraction':
        return <ExtractionStage onContinue={() => navigateToScreen('structuring')} />;

      case 'structuring':
        return <StructuringStage onContinue={() => navigateToScreen('validation')} />;

      case 'validation':
        return <ValidationStage onContinue={() => navigateToScreen('publish')} />;

      case 'publish':
        return <PublishStage onContinue={() => navigateToScreen('insight-review')} />;
      
      case 'insight-review':
        return <InsightReview onApprove={() => navigateToScreen('final-validation')} />;
      
      case 'final-validation':
        return (
          <FinalValidation
            onPublish={handlePublish}
            onEdit={() => navigateToScreen('insight-review')}
          />
        );
      
      case 'library':
        return (
          <InsightLibrary
            onViewInsight={handleViewInsight}
            onBack={() => navigateToScreen('discovery')}
          />
        );
      
      case 'discovery':
        return <DiscoveryHome onSearch={handleSearch} onNavigate={handleNavigate} />;
      
      case 'search-results':
        return (
          <SearchResults
            searchQuery={searchQuery}
            onViewInsight={handleViewInsight}
            onSearch={handleSearch}
            onNavigate={handleNavigate}
          />
        );
      
      case 'insight-detail':
        return (
          <InsightDetail
            insightId={selectedInsightId}
            onBack={() => {
              navigateToScreen('search-results');
            }}
            onViewRelated={handleViewInsight}
          />
        );
      
      case 'my-library':
        return <MyLibrary onViewInsight={handleViewInsight} onSearch={handleSearch} />;
      
      case 'manual-entry':
        return (
          <ManualEntry
            onBack={() => navigateToScreen('ingestion')}
            onSubmit={() => navigateToScreen('insight-review')}
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
    <div className="size-full flex bg-white relative">
      <SidebarMock currentScreen={getScreenPath(currentScreen)} onNavigate={handleNavigate} onLogout={logout} />
      {renderScreen()}
      <Toaster position="top-right" />
    </div>
  );
}
