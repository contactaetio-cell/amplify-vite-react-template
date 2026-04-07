import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import { Sidebar } from './screens/Sidebar';
import { Home } from './screens/Home';
import { DataSourceConnection } from './screens/DataSourceConnection';
import { UploadProgress } from './screens/UploadProgress';
import { InsightReview } from './screens/InsightReview';
import { FinalValidation } from './screens/FinalValidation';
import { InsightDetail } from './screens/InsightDetail';
import { InsightLibrary } from './screens/InsightLibrary';
import { Help } from './screens/Help';
import { ManualEntry } from './screens/ManualEntry';
import { TopInsights } from './screens/TopInsights';
import { SearchResults } from './screens/SearchResults';
import { InsightsList } from './screens/InsightsList';
import { Settings } from './screens/Settings';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';
import { parseSearchSource } from './search/sourceOptions';
import type { SearchSource } from './api/insights';

type Screen = 
  | 'home'
  | 'ingestion'
  | 'upload-progress'
  | 'insight-review'
  | 'final-validation'
  | 'library'
  | 'insight-detail'
  | 'insights'
  | 'my-insights'
  | 'my-library'
  | 'manual-entry'
  | 'browse-insights'
  | 'top-insights'
  | 'search'
  | 'help'
  | 'settings';

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const { screen, insightId } = useParams();

  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [selectedInsightId, setSelectedInsightId] = useState<string>('');

  useEffect(() => {
    const path = location.pathname;

    if (path.startsWith('/insight/')) {
      if (insightId) setSelectedInsightId(insightId);
      setCurrentScreen('insight-detail');
      return;
    }

    if (path.startsWith('/dashboard/ingestion/approval-review-queue/')) {
      if (insightId) setSelectedInsightId(insightId);
      setCurrentScreen('ingestion');
      return;
    }

    if (path.startsWith('/dashboard/ingestion')) {
      setCurrentScreen('ingestion');
      return;
    }

    const knownScreens: Screen[] = [
      'home',
      'ingestion',
      'upload-progress',
      'insight-review',
      'final-validation',
      'library',
      'insight-detail',
      'insights',
      'my-insights',
      'my-library',
      'manual-entry',
      'browse-insights',
      'top-insights',
      'search',
      'help',
      'settings'
    ];

    if (screen && knownScreens.includes(screen as Screen)) {
      setCurrentScreen(screen as Screen);
      return;
    }

    if (path.startsWith('/dashboard/')) {
      const derivedScreen = path.replace('/dashboard/', '').split('/')[0] as Screen;
      if (knownScreens.includes(derivedScreen)) {
        setCurrentScreen(derivedScreen);
        return;
      }
    }

    if (path === '/dashboard') {
      setCurrentScreen('home');
    }
  }, [insightId, location.pathname, screen]);

  const handleNavigate = (screen: string) => {
    const next = screen as Screen;
    setCurrentScreen(next);
    navigate(`/dashboard/${next}`);
  };

  const handleSelectSource = (sourceId: string) => {
    void sourceId;
    toast.success('Connecting to data source...');
    setCurrentScreen('upload-progress');
    navigate('/dashboard/upload-progress');
  };

  const handleViewInsight = (id: string, source?: SearchSource) => {
    setSelectedInsightId(id);
    setCurrentScreen('insight-detail');
    const resolvedSource =
      source ?? parseSearchSource(new URLSearchParams(location.search).get('source'));
    navigate(`/insight/${id}?source=${encodeURIComponent(resolvedSource)}`);
  };

  const handleInsightBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    setCurrentScreen('home');
    navigate('/dashboard/home');
  };

  const handlePublish = () => {
    toast.success('Insight published successfully!');
    setCurrentScreen('home');
    navigate('/dashboard/home');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <Home onViewInsight={handleViewInsight} onNavigate={handleNavigate} />;
      
      case 'ingestion':
        return (
          <DataSourceConnection
            onSelectSource={handleSelectSource}
            onManualEntry={() => handleNavigate('manual-entry')}
          />
        );
      
      case 'upload-progress':
        return <UploadProgress onContinue={() => handleNavigate('insight-review')} />;
      
      case 'insight-review':
        return <InsightReview onApprove={() => handleNavigate('final-validation')} />;
      
      case 'final-validation':
        return (
          <FinalValidation
            onPublish={handlePublish}
            onEdit={() => handleNavigate('insight-review')}
          />
        );
      
      case 'library':
        return (
          <InsightLibrary
            onViewInsight={handleViewInsight}
            onBack={() => handleNavigate('home')}
          />
        );
      
      case 'insight-detail':
        return (
          <InsightDetail
            insightId={selectedInsightId}
            onBack={handleInsightBack}
            onViewRelated={handleViewInsight}
            forceEditMode={false}
          />
        );
      
      case 'insights':
        return <InsightsList mode="all" onViewInsight={handleViewInsight} />;

      case 'my-insights':
        return <InsightsList mode="mine" onViewInsight={handleViewInsight} />;

      case 'my-library':
        return <InsightsList mode="mine" onViewInsight={handleViewInsight} />;
      
      case 'manual-entry':
        return (
          <ManualEntry
            onBack={() => handleNavigate('ingestion')}
            onSubmit={() => handleNavigate('insight-review')}
          />
        );
      
      case 'browse-insights':
        return <InsightsList mode="all" onViewInsight={handleViewInsight} />;
      
      case 'top-insights':
        return <TopInsights onViewInsight={handleViewInsight} onBack={() => handleNavigate('home')} />;

      case 'search':
        return <SearchResults onViewInsight={handleViewInsight} />;
      
      case 'help':
        return <Help />;
      
      case 'settings':
        return <Settings />;
      
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
