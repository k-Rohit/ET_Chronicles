import type { StoryData } from '@/services/api';

const sentimentBarColor = (type: string) =>
  type === 'positive' ? 'bg-sentiment-positive' :
  type === 'neutral' ? 'bg-primary/40' :
  'bg-sentiment-negative';

interface DeepDivePanelProps {
  story: StoryData;
}

const DeepDivePanel = ({ story }: DeepDivePanelProps) => {
  const dd = story.deepDive;

  if (!dd) {
    return (
      <div className="max-w-3xl mx-auto flex items-center justify-center py-20">
        <p className="text-sm text-muted-foreground">Deep Dive data not available for this story.</p>
      </div>
    );
  }

  const { sentimentBreakdown, keyQuotes, tldrCards } = dd;

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-up">
      {/* Header */}
      <div>
        <p className="text-xs uppercase tracking-[0.15em] text-primary/70 font-medium mb-3">Deep Dive</p>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight leading-tight text-balance mb-2">
          {story.title}
        </h1>
        <p className="text-sm text-muted-foreground">Sentiment, quotes, and quick insights from {story.sources?.length || 0} sources.</p>
      </div>

      {/* Sentiment Meter */}
      <div className="glass-panel rounded-2xl p-6">
        <h2 className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-medium mb-5 flex items-center gap-2">
          <span>📊</span> Sentiment Breakdown
        </h2>
        {/* Bar */}
        <div className="flex h-4 rounded-full overflow-hidden mb-4">
          {sentimentBreakdown.positive > 0 && (
            <div
              className={`${sentimentBarColor('positive')} transition-all duration-500`}
              style={{ width: `${sentimentBreakdown.positive}%` }}
            />
          )}
          {sentimentBreakdown.neutral > 0 && (
            <div
              className={`${sentimentBarColor('neutral')} transition-all duration-500`}
              style={{ width: `${sentimentBreakdown.neutral}%` }}
            />
          )}
          {sentimentBreakdown.negative > 0 && (
            <div
              className={`${sentimentBarColor('negative')} transition-all duration-500`}
              style={{ width: `${sentimentBreakdown.negative}%` }}
            />
          )}
        </div>
        {/* Legend */}
        <div className="flex items-center gap-6 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-sentiment-positive" />
            <span className="text-xs text-muted-foreground">Positive {sentimentBreakdown.positive}%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary/40" />
            <span className="text-xs text-muted-foreground">Neutral {sentimentBreakdown.neutral}%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-sentiment-negative" />
            <span className="text-xs text-muted-foreground">Negative {sentimentBreakdown.negative}%</span>
          </div>
        </div>
        <p className="text-sm text-foreground/80 leading-relaxed">{sentimentBreakdown.summary}</p>
      </div>

      {/* TL;DR Flashcards */}
      <div>
        <h2 className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-medium mb-4 flex items-center gap-2">
          <span>⚡</span> TL;DR
        </h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {tldrCards.map((card, i) => (
            <div
              key={i}
              className="glass-panel-hover rounded-2xl p-5"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{card.emoji}</span>
                <h3 className="text-sm font-semibold text-foreground">{card.title}</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{card.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Key Quotes */}
      <div>
        <h2 className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-medium mb-4 flex items-center gap-2">
          <span>💬</span> Key Quotes
        </h2>
        <div className="space-y-3">
          {keyQuotes.map((q, i) => (
            <div
              key={i}
              className="glass-panel rounded-2xl px-6 py-5 border-l-2 border-primary/30"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <p className="text-sm text-foreground/90 leading-relaxed italic mb-3">
                "{q.quote}"
              </p>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-[10px] font-semibold text-foreground">
                  {q.speaker.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-medium text-foreground">{q.speaker}</p>
                  <p className="text-[10px] text-muted-foreground/60">{q.context}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* What to Watch */}
      {story.whatToWatch && story.whatToWatch.length > 0 && (
        <div>
          <h2 className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-medium mb-4 flex items-center gap-2">
            <span>🔮</span> What to Watch
          </h2>
          <div className="grid gap-2">
            {story.whatToWatch.map((item, i) => (
              <div
                key={i}
                className="glass-panel rounded-xl px-4 py-3 text-sm text-foreground/90 leading-relaxed flex items-start gap-3"
              >
                <span className="text-primary/60 text-xs mt-0.5 shrink-0">→</span>
                {item}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sources footer */}
      <div className="pt-4 border-t border-border">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] text-muted-foreground/40 uppercase tracking-wider">Sources:</span>
          {story.sources.map((s) => (
            <span key={s} className="text-[10px] text-muted-foreground/50 px-2 py-0.5 bg-secondary rounded-full">{s}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DeepDivePanel;
