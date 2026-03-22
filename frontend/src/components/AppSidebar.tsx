import { useState, useEffect } from 'react';
import { Search, Sparkles, Flame, BarChart3, Zap, Loader2, Home } from 'lucide-react';
import { fetchTrending, type TrendingStory } from '@/services/api';

interface AppSidebarProps {
  onSelectStory: (title: string) => void;
  activeMode: 'briefing' | 'deepdive';
  onModeChange: (mode: 'briefing' | 'deepdive') => void;
  searchQuery: string;
  onSearch: (q: string) => void;
  onSearchSubmit?: () => void;
  onGoHome?: () => void;
}

const AppSidebar = ({ onSelectStory, activeMode, onModeChange, searchQuery, onSearch, onSearchSubmit, onGoHome }: AppSidebarProps) => {
  const [trending, setTrending] = useState<TrendingStory[]>([]);
  const [loadingTrending, setLoadingTrending] = useState(true);

  useEffect(() => {
    fetchTrending()
      .then(setTrending)
      .catch(() => {})
      .finally(() => setLoadingTrending(false));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearchSubmit) {
      onSearchSubmit();
    } else if (searchQuery.trim()) {
      onSelectStory(searchQuery.trim());
    }
  };

  return (
    <aside className="w-72 shrink-0 h-screen bg-[hsl(var(--sidebar-background))] border-r border-sidebar-border flex flex-col overflow-hidden">
      {/* Logo + Home */}
      <div className="px-5 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
          </div>
          <span className="text-sm font-semibold tracking-tight text-foreground">ET Chronicle</span>
        </div>
        {onGoHome && (
          <button
            onClick={onGoHome}
            className="w-8 h-8 rounded-lg bg-secondary text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors active:scale-[0.95]"
            title="Back to Home"
          >
            <Home className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Search */}
      <div className="px-5 pb-4">
        <form onSubmit={handleSubmit}>
          <div className="flex items-center gap-2 bg-secondary rounded-xl px-3 py-2.5 focus-within:ring-1 focus-within:ring-primary/30 transition-all">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Search a new topic…"
              className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 outline-none w-full"
            />
          </div>
        </form>
      </div>

      {/* Mode Toggle */}
      <div className="px-5 pb-4">
        <div className="flex gap-1 p-1 bg-secondary rounded-xl">
          <button
            onClick={() => onModeChange('briefing')}
            className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-medium py-2 rounded-lg transition-all duration-200 ${
              activeMode === 'briefing'
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Briefing
          </button>
          <button
            onClick={() => onModeChange('deepdive')}
            className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-medium py-2 rounded-lg transition-all duration-200 ${
              activeMode === 'deepdive'
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            Deep Dive
          </button>
        </div>
      </div>

      {/* Trending */}
      <div className="px-5 pb-2">
        <div className="flex items-center gap-1.5 mb-3">
          <Flame className="w-3.5 h-3.5 text-sentiment-caution" />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Trending on ET</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-4">
        {loadingTrending ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
          </div>
        ) : (
          <div className="space-y-0.5">
            {trending.map((story) => (
              <button
                key={story.id}
                onClick={() => onSelectStory(story.title)}
                className="w-full text-left px-3 py-2.5 rounded-xl text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground transition-all duration-200 group active:scale-[0.98] flex items-center justify-between gap-2"
              >
                <span className="truncate">{story.title}</span>
                <span className="text-[10px] text-muted-foreground/50 shrink-0 group-hover:text-muted-foreground transition-colors">
                  {story.tag}
                </span>
              </button>
            ))}
            {trending.length === 0 && (
              <p className="text-xs text-muted-foreground/40 text-center py-4">No trending stories available</p>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-sidebar-border">
        <p className="text-[10px] text-muted-foreground/40">AI synthesized from ET journalism</p>
      </div>
    </aside>
  );
};

export default AppSidebar;
