import { useState } from 'react';
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

export default function Dashboard() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInsightId, setSelectedInsightId] = useState<string>('');

  const handleNavigate = (screen: string) => {
    setCurrentScreen(screen as Screen);
  };

  const handleSelectSource = (sourceId: string) => {
    toast.success('Connecting to data source...');
    setCurrentScreen('upload-progress');
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentScreen('search-results');
  };

  const handleViewInsight = (id: string) => {
    setSelectedInsightId(id);
    setCurrentScreen('insight-detail');
  };

  const handlePublish = () => {
    toast.success('Insight published successfully!');
    setCurrentScreen('discovery');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <Home onViewInsight={handleViewInsight} onSearch={handleSearch} />;
  
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
            onBack={() => setCurrentScreen('discovery')}
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
            onBack={() => setCurrentScreen('search-results')}
            onViewRelated={handleViewInsight}
          />
        );
      
      case 'my-library':
        return <MyLibrary onViewInsight={handleViewInsight} onSearch={handleSearch} />;
      
      case 'manual-entry':
        return (
          <ManualEntry
            onBack={() => setCurrentScreen('ingestion')}
            onSubmit={() => setCurrentScreen('insight-review')}
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