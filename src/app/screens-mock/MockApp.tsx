import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Home } from './Home';
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
import { Toaster } from '../components/ui/sonner';
import { toast } from 'sonner';

type Screen = 
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
  | 'help'
  | 'settings';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [selectedInsightId, setSelectedInsightId] = useState<string>('');

  const handleNavigate = (screen: string) => {
    setCurrentScreen(screen as Screen);
  };

  const handleSelectSource = (sourceId: string) => {
    toast.success('Connecting to data source...');
    setCurrentScreen('upload-progress');
  };

  const handleViewInsight = (id: string) => {
    setSelectedInsightId(id);
    setCurrentScreen('insight-detail');
  };

  const handlePublish = () => {
    toast.success('Insight published successfully!');
    setCurrentScreen('home');
  };

  const renderScreen = () => {
    switch (currentScreen) {
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