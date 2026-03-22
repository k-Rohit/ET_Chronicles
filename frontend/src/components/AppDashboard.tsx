import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import AppSidebar from '@/components/AppSidebar';
import BriefingPanel from '@/components/BriefingPanel';
import DeepDivePanel from '@/components/DeepDivePanel';
import QADock from '@/components/QADock';
import type { StoryData, ArticleMeta } from '@/services/api';

interface AppDashboardProps {
  story: StoryData;
  sessionId: string;
  articleCount: number;
  articleMeta: ArticleMeta[];
  onNewSearch: (query: string) => void;
  onGoHome: () => void;
}

const AppDashboard = ({ story, sessionId, articleCount, articleMeta, onNewSearch, onGoHome }: AppDashboardProps) => {
  const [mode, setMode] = useState<'briefing' | 'deepdive'>('briefing');
  const [searchQuery, setSearchQuery] = useState('');
  const [pendingQuestion, setPendingQuestion] = useState<string | undefined>();
  const [chatOpen, setChatOpen] = useState(true);

  const handleSelectStory = (title: string) => {
    setSearchQuery('');
    onNewSearch(title);
  };

  const handleAskQuestion = (q: string) => {
    setPendingQuestion(q);
    setChatOpen(true);
  };

  const handleSearch = (q: string) => {
    setSearchQuery(q);
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      onNewSearch(searchQuery.trim());
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <AppSidebar
        onSelectStory={handleSelectStory}
        activeMode={mode}
        onModeChange={setMode}
        searchQuery={searchQuery}
        onSearch={handleSearch}
        onSearchSubmit={handleSearchSubmit}
        onGoHome={onGoHome}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto py-10 px-10 lg:px-14 relative">
        {mode === 'briefing' ? (
          <BriefingPanel
            story={story}
            articleCount={articleCount}
            articleMeta={articleMeta}
            onAskQuestion={handleAskQuestion}
          />
        ) : (
          <DeepDivePanel story={story} />
        )}

        {/* Chat toggle button (visible when chat is closed) */}
        {!chatOpen && (
          <button
            onClick={() => setChatOpen(true)}
            className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg glow-sm hover:brightness-110 active:scale-[0.95] transition-all duration-200 animate-scale-in"
          >
            <MessageCircle className="w-5 h-5" />
          </button>
        )}
      </main>

      {/* QA Dock */}
      {chatOpen && (
        <div className="w-96 shrink-0 hidden lg:flex flex-col relative animate-slide-in-right">
          <QADock
            sessionId={sessionId}
            storyTitle={story.title}
            initialQuestion={pendingQuestion}
            onClose={() => setChatOpen(false)}
          />
        </div>
      )}
    </div>
  );
};

export default AppDashboard;
