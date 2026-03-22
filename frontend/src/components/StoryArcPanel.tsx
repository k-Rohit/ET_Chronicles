import { useState } from 'react';
import { ChevronDown, Eye } from 'lucide-react';
import type { Story } from '@/data/mockData';

const sentimentLine = (s: string) =>
  s === 'positive' ? 'bg-sentiment-positive' :
  s === 'caution' ? 'bg-sentiment-caution' :
  'bg-sentiment-negative';

const sentimentBg = (s: string) =>
  s === 'positive' ? 'border-sentiment-positive/20 bg-sentiment-positive/5' :
  s === 'caution' ? 'border-sentiment-caution/20 bg-sentiment-caution/5' :
  'border-sentiment-negative/20 bg-sentiment-negative/5';

interface StoryArcPanelProps {
  story: Story & { whatToWatch?: string[] };
}

const StoryArcPanel = ({ story }: StoryArcPanelProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const watchItems = (story as any).whatToWatch || [
    'Ongoing developments in this story',
    'Regulatory and policy responses',
    'Market and stakeholder reactions',
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-up">
      {/* Header */}
      <div>
        <p className="text-xs uppercase tracking-[0.15em] text-primary/70 font-medium mb-3">Story Arc</p>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight leading-tight text-balance mb-2">
          {story.title}
        </h1>
        <p className="text-sm text-muted-foreground">How this story evolved over time</p>
      </div>

      {/* Sentiment Overview */}
      <div className="glass-panel rounded-2xl p-5">
        <h2 className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-medium mb-4">📈 Sentiment Trend</h2>
        <div className="flex items-end gap-1 h-16">
          {story.timeline.map((ch) => {
            const height = ch.sentiment === 'positive' ? '100%' : ch.sentiment === 'caution' ? '60%' : '30%';
            return (
              <div key={ch.id} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full max-w-[40px] rounded-t-md transition-all duration-500" style={{ height }}>
                  <div className={`w-full h-full rounded-t-md ${sentimentLine(ch.sentiment)} opacity-60`} />
                </div>
                <span className="text-[9px] text-muted-foreground/50">{ch.date}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[19px] top-2 bottom-2 w-px bg-border" />

        <div className="space-y-2">
          {story.timeline.map((ch, i) => (
            <div
              key={ch.id}
              className="relative pl-12 animate-fade-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              {/* Dot */}
              <div className={`absolute left-3 top-4 w-3 h-3 rounded-full border-2 border-background ${sentimentLine(ch.sentiment)}`} />

              <button
                onClick={() => setExpandedId(expandedId === ch.id ? null : ch.id)}
                className={`w-full text-left glass-panel-hover rounded-2xl p-5 border ${
                  expandedId === ch.id ? sentimentBg(ch.sentiment) : 'border-transparent'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{ch.date}</span>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${expandedId === ch.id ? 'rotate-180' : ''}`} />
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-1">{ch.title}</h3>
                <div className={`overflow-hidden transition-all duration-300 ${expandedId === ch.id ? 'max-h-40 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
                  <p className="text-xs text-muted-foreground leading-relaxed">{ch.summary}</p>
                </div>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* What to Watch */}
      <div className="glass-panel rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Eye className="w-4 h-4 text-primary" />
          <h2 className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-medium">🔮 What to Watch Next</h2>
        </div>
        <ul className="space-y-2">
          {watchItems.map((item: string, i: number) => (
            <li key={i} className="text-sm text-muted-foreground leading-relaxed">• {item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default StoryArcPanel;
