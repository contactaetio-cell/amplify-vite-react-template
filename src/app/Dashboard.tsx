import { useEffect, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Home } from './screens/Home';
import { DataSourceConnection } from './screens/DataSourceConnection';
import { UploadProgress } from './screens/UploadProgress';
import { InsightReview } from './screens/InsightReview';
import { FinalValidation } from './screens/FinalValidation';
import { DiscoveryHome } from './screens/DiscoveryHome';
import { SearchResults } from './screens/SearchResults';
import { InsightDetail } from './screens/InsightDetail';
import { MyLibrary } from './screens/MyLibrary';
import { InsightLibrary } from './screens/InsightLibrary';
import { Help } from './screens/Help';
import { ManualEntry } from './screens/ManualEntry';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';
import { useParams } from 'react-router-dom';
import { signOut } from 'aws-amplify/auth';
import { useLocation, useNavigate } from 'react-router';

type Screen = 
  | 'home'
  | 'ingestion'
  | 'upload-progress'
  | 'insight-review'
  | 'final-validation'
  | 'library'
  | 'discovery'
  | 'search-results'
  | 'insight-detail'
  | 'my-library'
  | 'manual-entry'
  | 'help'
  | 'settings';

const validScreens: Screen[] = [
  'home',
  'ingestion',
  'upload-progress',
  'insight-review',
  'final-validation',
  'library',
  'discovery',
  'search-results',
  'insight-detail',
  'my-library',
  'manual-entry',
  'help',
  'settings',
];

const isScreen = (value: string | undefined): value is Screen =>
  !!value && validScreens.includes(value as Screen);

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { mock, insightId, screen } = useParams<{ mock?: string; insightId?: string; screen?: string }>();
  const baseDashboardPath = mock ? `/${mock}/dashboard` : '/dashboard';
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInsightId, setSelectedInsightId] = useState<string>('');

  const getScreenPath = (nextScreen: Screen) =>
    nextScreen === 'home' ? baseDashboardPath : `${baseDashboardPath}/${nextScreen}`;

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

    if (isScreen(screen)) {
      setCurrentScreen(screen);
      if (screen === 'search-results') {
        const params = new URLSearchParams(location.search);
        setSearchQuery(params.get('q') ?? '');
      }
      return;
    }

    if (!screen) {
      setCurrentScreen('home');
    }
  }, [insightId, screen, location.search]);

  const handleNavigate = (screen: string) => {
    if (!isScreen(screen)) return;
    navigateToScreen(screen);
  };

  const handleSelectSource = (sourceId: string) => {
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
    navigate(`/insight/${id}`);
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
      
      case 'upload-progress':
        return <UploadProgress onContinue={() => navigateToScreen('insight-review')} />;
      
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
      <Sidebar currentScreen={currentScreen} onNavigate={handleNavigate} onLogout={logout} />
      {renderScreen()}
      <Toaster position="top-right" />
    </div>
  );
}
