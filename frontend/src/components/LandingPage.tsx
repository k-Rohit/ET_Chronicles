import { useState, useEffect, useRef } from 'react';
import { Search, ArrowRight, Brain, Zap, MessageCircle, Sparkles, Flame, Loader2, Mic } from 'lucide-react';
import { fetchTrending, type TrendingStory } from '@/services/api';

interface LandingPageProps {
  onAnalyze: (query: string) => void;
}

const LandingPage = ({ onAnalyze }: LandingPageProps) => {
  const [query, setQuery] = useState('');
  const [trending, setTrending] = useState<TrendingStory[]>([]);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [visible, setVisible] = useState(false);
  const trendingRef = useRef<HTMLDivElement>(null);
  const [trendingVisible, setTrendingVisible] = useState(false);

  useEffect(() => {
    // Trigger hero animations on mount
    requestAnimationFrame(() => setVisible(true));
  }, []);

  useEffect(() => {
    fetchTrending()
      .then(setTrending)
      .catch(() => {})
      .finally(() => setLoadingTrending(false));
  }, []);

  // Observe trending section separately so it triggers when scrolled into view
  useEffect(() => {
    if (!trendingRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setTrendingVisible(true); },
      { threshold: 0.05 }
    );
    observer.observe(trendingRef.current);
    return () => observer.disconnect();
  }, []);

  const quickTopics = trending.slice(0, 4).map((s) => s.title);
  const cardStories = trending.slice(0, 6);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) onAnalyze(query.trim());
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-primary/[0.03] blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-primary/[0.02] blur-[100px]" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-6xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-foreground">ET Chronicle</span>
        </div>
        <span className="text-xs text-muted-foreground tracking-wide uppercase">AI-Powered Intelligence</span>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-4xl mx-auto px-8 pt-24 pb-20 text-center">
        <p className={`text-xs uppercase tracking-[0.2em] text-primary/70 mb-6 font-medium transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          From breaking news to full narrative
        </p>

        <h1 className={`text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[0.95] text-foreground text-balance mb-6 transition-all duration-700 delay-100 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          Stop reading news.{' '}
          <span className="gradient-text">Start interacting</span> with it.
        </h1>

        <p className={`text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed transition-all duration-700 delay-200 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          AI-powered intelligence built on Economic Times journalism.
          Ask the story — don't read 10 articles.
        </p>

        {/* Search Input */}
        <form onSubmit={handleSubmit}
              className={`max-w-2xl mx-auto transition-all duration-700 delay-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="glass-panel rounded-2xl p-2 glow-sm group focus-within:glow-md transition-shadow duration-500">
            <div className="flex items-center gap-3">
              <Search className="w-5 h-5 text-muted-foreground ml-4 shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Paste a news URL or type a topic"
                className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground/60 text-base py-3 outline-none"
              />
              <button
                type="submit"
                className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium text-sm flex items-center gap-2 hover:brightness-110 active:scale-[0.97] transition-all duration-200 shrink-0"
              >
                Analyze Story
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </form>

        {/* Quick topics */}
        <div className={`flex flex-wrap justify-center gap-2 mt-6 transition-all duration-700 delay-[400ms] ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {quickTopics.map((t) => (
            <button
              key={t}
              onClick={() => onAnalyze(t)}
              className="text-xs px-3 py-1.5 rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all duration-200 active:scale-[0.96]"
            >
              {t}
            </button>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-5xl mx-auto px-8 pb-24">
        <div className={`grid md:grid-cols-3 gap-5 transition-all duration-700 delay-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          {[
            { icon: Brain, title: 'AI Briefings', desc: 'All articles condensed into one structured story with key facts, impact analysis, and key players.', accent: 'text-primary' },
            { icon: Zap, title: 'Deep Dive', desc: 'Key quotes, sentiment breakdown, and TL;DR flashcards — understand the full picture in seconds.', accent: 'text-sentiment-positive' },
            { icon: Mic, title: 'Voice Q&A', desc: 'Ask questions by voice or text. Get concise, cited answers grounded in ET journalism.', accent: 'text-sentiment-caution' },
          ].map((f, i) => (
            <div
              key={f.title}
              className="glass-panel-hover rounded-2xl p-7 group"
            >
              <div className={`w-10 h-10 rounded-xl bg-secondary flex items-center justify-center mb-5 ${f.accent} group-hover:scale-[1.05] transition-transform duration-300`}>
                <f.icon className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trending News Cards */}
      <section ref={trendingRef} className="relative z-10 max-w-5xl mx-auto px-8 pb-24">
        <div className={`flex items-center gap-2 mb-8 transition-all duration-700 ${trendingVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <Flame className="w-5 h-5 text-sentiment-caution" />
          <h2 className="text-lg font-semibold text-foreground">Trending on Economic Times</h2>
        </div>

        {loadingTrending ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cardStories.map((story, i) => (
              <button
                key={story.id}
                onClick={() => onAnalyze(story.title)}
                className={`text-left glass-panel-hover rounded-2xl overflow-hidden group active:scale-[0.98] transition-all duration-500 ${
                  trendingVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                }`}
                style={{ transitionDelay: trendingVisible ? `${i * 100}ms` : '0ms' }}
              >
                {/* Image */}
                <div className="aspect-[16/9] bg-secondary overflow-hidden">
                  {story.image ? (
                    <img
                      src={story.image}
                      alt={story.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-secondary to-secondary/50">
                      <Sparkles className="w-8 h-8 text-muted-foreground/20" />
                    </div>
                  )}
                </div>
                {/* Content */}
                <div className="p-4">
                  <span className="text-[10px] uppercase tracking-wider font-medium text-primary/70 mb-2 block">
                    {story.tag}
                  </span>
                  <h3 className="text-sm font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors duration-200">
                    {story.title}
                  </h3>
                  <p className="text-[11px] text-muted-foreground/50 mt-2">
                    Click to analyze with AI
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border py-8 px-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="w-3.5 h-3.5 text-primary/50" />
            ET Chronicle
          </div>
          <p className="text-xs text-muted-foreground/50">From breaking news to full narrative</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
