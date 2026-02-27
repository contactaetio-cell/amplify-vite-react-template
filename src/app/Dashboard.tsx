import { useCallback, useEffect, useRef, useState } from 'react';
import { Sidebar } from './screens/Sidebar';
import { Home } from './screens/Home';
import { DataSourceConnection } from './screens/DataSourceConnection';
import { InsightReview } from './screens/InsightReview';
import { FinalValidation } from './screens/FinalValidation';
import { DiscoveryHome } from './screens/DiscoveryHome';
import { SearchResults } from './screens/SearchResults';
import { InsightDetail } from './screens/InsightDetail';
import { MyLibrary } from './screens/MyLibrary';
import { InsightLibrary } from './screens/InsightLibrary';
import { Help } from './screens/Help';
import { ManualEntry } from './screens/ManualEntry';
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
import { Alert, AlertDescription, AlertTitle } from './components/ui/alert';
import { Button } from './components/ui/button';
import {
  deleteExtractionFileFromS3,
  type UploadedS3Object,
} from './api/storage';

type Screen = 
  | 'home'
  | 'ingestion'
  | 'add-new-insight'
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
  'add-new-insight',
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

const legacyProcessingScreens = new Set([
  'upload',
  'extraction',
  'structuring',
  'validation',
  'publish',
]);

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { insightId, screen } = useParams<{ insightId?: string; screen?: string }>();
  const baseDashboardPath = '/dashboard';
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInsightId, setSelectedInsightId] = useState<string>('');
  const [workflowStep, setWorkflowStep] = useState(0);
  const [workflowFile, setWorkflowFile] = useState<File | null>(null);
  const [uploadedWorkflowObject, setUploadedWorkflowObject] = useState<UploadedS3Object | null>(null);
  const [isLeaveBannerVisible, setIsLeaveBannerVisible] = useState(false);
  const [isDeletingUploadedFile, setIsDeletingUploadedFile] = useState(false);
  const pendingLeaveActionRef = useRef<null | (() => void)>(null);

  const isInAddNewInsightWorkflow = currentScreen === 'add-new-insight';
  const shouldGuardWorkflowExit = isInAddNewInsightWorkflow && !!uploadedWorkflowObject;

  const getScreenPath = (nextScreen: Screen) =>
    nextScreen === 'home' ? baseDashboardPath : `${baseDashboardPath}/${nextScreen}`;

  const resetAddNewInsightWorkflow = useCallback(() => {
    setWorkflowStep(0);
    setWorkflowFile(null);
    setUploadedWorkflowObject(null);
  }, []);

  const navigateToScreenDirect = (nextScreen: Screen) => {
    setCurrentScreen(nextScreen);
    navigate(getScreenPath(nextScreen));
  };

  const requestWorkflowLeaveConfirmation = useCallback(
    (action: () => void) => {
      if (!shouldGuardWorkflowExit) {
        action();
        return;
      }

      pendingLeaveActionRef.current = action;
      setIsLeaveBannerVisible(true);
    },
    [shouldGuardWorkflowExit],
  );

  const navigateToScreen = (nextScreen: Screen) => {
    if (isInAddNewInsightWorkflow && nextScreen !== 'add-new-insight') {
      requestWorkflowLeaveConfirmation(() => navigateToScreenDirect(nextScreen));
      return;
    }

    navigateToScreenDirect(nextScreen);
  };

  useEffect(() => {
    if (insightId) {
      setSelectedInsightId(insightId);
      setCurrentScreen('insight-detail');
      return;
    }

    if (screen && legacyProcessingScreens.has(screen)) {
      setCurrentScreen('add-new-insight');
      navigate(getScreenPath('add-new-insight'), { replace: true });
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

    if (screen === 'upload-progress') {
      setCurrentScreen('add-new-insight');
      navigate(getScreenPath('add-new-insight'), { replace: true });
      return;
    }

    if (!screen) {
      setCurrentScreen('home');
    }
  }, [insightId, screen, location.search, navigate]);

  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!shouldGuardWorkflowExit) return;
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [shouldGuardWorkflowExit]);

  const handleNavigate = (screen: string) => {
    if (!isScreen(screen)) return;
    navigateToScreen(screen);
  };

  const handleSelectSource = (_sourceId: string) => {
    toast.success('Connecting to data source...');
    resetAddNewInsightWorkflow();
    navigateToScreen('add-new-insight');
  };

  const handleSearch = (query: string) => {
    requestWorkflowLeaveConfirmation(() => {
      setSearchQuery(query);
      navigate(`${getScreenPath('search-results')}?q=${encodeURIComponent(query)}`);
      setCurrentScreen('search-results');
    });
  };

  const handleViewInsight = (id: string) => {
    requestWorkflowLeaveConfirmation(() => {
      setSelectedInsightId(id);
      setCurrentScreen('insight-detail');
      navigate(`/insight/${id}`);
    });
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

  const stayInAddNewInsightWorkflow = () => {
    pendingLeaveActionRef.current = null;
    setIsLeaveBannerVisible(false);
  };

  const leaveAddNewInsightWorkflow = async () => {
    const pendingAction = pendingLeaveActionRef.current;
    if (!pendingAction) {
      setIsLeaveBannerVisible(false);
      return;
    }

    setIsDeletingUploadedFile(true);
    if (uploadedWorkflowObject?.path) {
      try {
        await deleteExtractionFileFromS3(uploadedWorkflowObject.path);
      } catch (error) {
        console.error('Failed to delete uploaded S3 object:', error);
        toast.error('Could not delete uploaded file. Please try leaving again.');
        setIsDeletingUploadedFile(false);
        return;
      }
    }

    resetAddNewInsightWorkflow();
    pendingLeaveActionRef.current = null;
    setIsLeaveBannerVisible(false);
    setIsDeletingUploadedFile(false);
    pendingAction();
  };

  const renderAddNewInsightWorkflow = () => {
    switch (workflowStep) {
      case 0:
        return (
          <UploadStage
            onContinue={(file) => {
              setWorkflowFile(file);
              setWorkflowStep(1);
            }}
          />
        );
      case 1:
        return (
          <ExtractionStage
            selectedFile={workflowFile}
            onFileUploaded={(uploadedObject) => setUploadedWorkflowObject(uploadedObject)}
            onContinue={() => setWorkflowStep(2)}
          />
        );
      case 2:
        return <StructuringStage onContinue={() => setWorkflowStep(3)} />;
      case 3:
        return <ValidationStage onContinue={() => setWorkflowStep(4)} />;
      case 4:
        return (
          <PublishStage
            onContinue={() => {
              resetAddNewInsightWorkflow();
              navigateToScreenDirect('insight-review');
            }}
          />
        );
      default:
        return (
          <UploadStage
            onContinue={(file) => {
              setWorkflowFile(file);
              setWorkflowStep(1);
            }}
          />
        );
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

      case 'add-new-insight':
        return renderAddNewInsightWorkflow();
      
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
      {isLeaveBannerVisible && (
        <div className="absolute top-4 left-1/2 z-50 w-[min(680px,calc(100%-2rem))] -translate-x-1/2">
          <Alert className="border-amber-300 bg-amber-50 text-amber-950 shadow-lg">
            <AlertTitle>Leave Add New Insight workflow?</AlertTitle>
            <AlertDescription className="text-amber-950">
              <p>You will lose this in-progress insight if you leave now.</p>
              <div className="mt-3 flex items-center gap-2">
                <Button variant="outline" onClick={stayInAddNewInsightWorkflow} disabled={isDeletingUploadedFile}>
                  Stay
                </Button>
                <Button
                  variant="destructive"
                  onClick={leaveAddNewInsightWorkflow}
                  disabled={isDeletingUploadedFile}
                >
                  {isDeletingUploadedFile ? 'Deleting file...' : 'Leave'}
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      )}
      {renderScreen()}
      <Toaster position="top-right" />
    </div>
  );
}
