import { useState, useCallback, useRef } from 'react';
import { Sparkles } from 'lucide-react';
import LandingPage from '@/components/LandingPage';
import LoadingScreen from '@/components/LoadingScreen';
import AppDashboard from '@/components/AppDashboard';
import ForYouPage from '@/components/ForYouPage';
import { analyzeStoryStream, type AnalyzeResponse, type ArticleMeta, type StreamProgress } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

type AppState = 'landing' | 'loading' | 'dashboard' | 'foryou';

const Index = () => {
  const { user, profile } = useAuth();
  const [state, setState] = useState<AppState>('landing');
  const [transitioning, setTransitioning] = useState<'exit' | 'enter' | null>(null);
  const [sessionId, setSessionId] = useState('');
  const [storyData, setStoryData] = useState<AnalyzeResponse['story'] | null>(null);
  const [articleCount, setArticleCount] = useState(0);
  const [articleMeta, setArticleMeta] = useState<ArticleMeta[]>([]);
  const [loadingProgress, setLoadingProgress] = useState<StreamProgress | undefined>();
  const abortRef = useRef<AbortController | null>(null);

  const handleCancel = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setState('landing');
  }, []);

  const transitionTo = useCallback((target: AppState) => {
    setTransitioning('exit');
    setTimeout(() => {
      setState(target);
      setTransitioning('enter');
      setTimeout(() => setTransitioning(null), 500);
    }, 350);
  }, []);

  const handleAnalyze = useCallback((query: string) => {
    setState('loading');
    setLoadingProgress(undefined);
    abortRef.current?.abort();

    abortRef.current = analyzeStoryStream(
      query,
      (progress) => {
        setLoadingProgress(progress);
      },
      (data) => {
        setSessionId(data.session_id);
        setStoryData(data.story);
        setArticleCount(data.articleCount || 0);
        setArticleMeta(data.articleMeta || []);
        setState('dashboard');
      },
      (error) => {
        toast.error(error || 'Failed to analyze story');
        setState('landing');
      },
    );
  }, []);

  const showForYouButton = user && profile?.preferred_domains?.length && state === 'landing';

  if (state === 'loading') {
    return <LoadingScreen onComplete={() => {}} onCancel={handleCancel} progress={loadingProgress} />;
  }

  if (state === 'dashboard' && storyData) {
    return (
      <AppDashboard
        story={storyData}
        sessionId={sessionId}
        articleCount={articleCount}
        articleMeta={articleMeta}
        onNewSearch={(query) => handleAnalyze(query)}
        onGoHome={() => setState('landing')}
      />
    );
  }

  return (
    <div className="relative">
      <div className={transitioning === 'exit' ? 'page-transition-exit' : transitioning === 'enter' ? 'page-transition-enter' : ''}>
        {state === 'foryou' ? (
          <ForYouPage
            onBack={() => transitionTo('landing')}
            onAnalyze={handleAnalyze}
          />
        ) : (
          <LandingPage onAnalyze={handleAnalyze} />
        )}
      </div>

      {/* Floating For You button */}
      {showForYouButton && transitioning === null && (
        <button
          onClick={() => transitionTo('foryou')}
          className="fixed bottom-8 right-8 z-40 flex items-center gap-2 px-5 py-3 rounded-full bg-primary text-primary-foreground font-medium text-sm shadow-xl animate-sparkle-float hover:brightness-110 active:scale-[0.95] transition-all duration-200"
        >
          <Sparkles className="w-4 h-4" />
          For You
        </button>
      )}
    </div>
  );
};

export default Index;
