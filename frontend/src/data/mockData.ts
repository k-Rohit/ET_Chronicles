export interface Story {
  id: string;
  title: string;
  topic: string;
  summary: string;
  keyFacts: string[];
  impactCards: { audience: string; icon: string; sentiment: 'positive' | 'caution' | 'negative'; text: string }[];
  keyPlayers: { name: string; initials: string; role: string; stance: 'positive' | 'caution' | 'negative' }[];
  suggestedQuestions: string[];
  timeline: TimelineChapter[];
  sources: string[];
}

export interface TimelineChapter {
  id: string;
  date: string;
  title: string;
  summary: string;
  sentiment: 'positive' | 'caution' | 'negative';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  sources?: string[];
}

export const trendingStories: { id: string; title: string; tag: string }[] = [
  { id: '1', title: "Byju's Collapse", tag: 'EdTech' },
  { id: '2', title: 'Budget 2026 Analysis', tag: 'Policy' },
  { id: '3', title: 'Zepto vs Blinkit Wars', tag: 'Quick Commerce' },
  { id: '4', title: 'AI Regulation in India', tag: 'Tech Policy' },
  { id: '5', title: 'Adani Green Energy Push', tag: 'Energy' },
  { id: '6', title: 'UPI Global Expansion', tag: 'Fintech' },
  { id: '7', title: 'Tata Semiconductor Play', tag: 'Manufacturing' },
  { id: '8', title: 'SEBI vs Hindenburg', tag: 'Markets' },
  { id: '9', title: 'EV Battery Race', tag: 'Automotive' },
  { id: '10', title: 'Startup IPO Wave 2026', tag: 'Markets' },
];

export const sampleStory: Story = {
  id: '1',
  title: "The Rise and Fall of Byju's: India's EdTech Giant",
  topic: "Byju's Collapse",
  summary: "Once valued at $22 billion, Byju's has become the most dramatic cautionary tale in Indian startup history. A combination of aggressive acquisitions, governance failures, and shifting market dynamics led to a spectacular unraveling that affected millions of students and thousands of employees.",
  keyFacts: [
    "Peak valuation of $22 billion in 2022, now effectively worthless",
    "Over 10,000 employees laid off across multiple rounds",
    "NCLT ordered insolvency proceedings in July 2024",
    "Founder Byju Raveendran faces multiple legal battles",
    "Acquired companies like Aakash, WhiteHat Jr saw massive write-downs",
    "Board members including Deloitte resigned citing governance concerns",
  ],
  impactCards: [
    { audience: 'Students & Parents', icon: '🎓', sentiment: 'negative', text: 'Millions of active subscriptions at risk. Refund claims piling up. Alternative platforms seeing surge in signups.' },
    { audience: 'Investors', icon: '📉', sentiment: 'negative', text: 'Total investor losses estimated at $5B+. Tiger Global, Sequoia, and others face write-downs. Due diligence practices under scrutiny.' },
    { audience: 'EdTech Founders', icon: '🚀', sentiment: 'caution', text: 'Funding winter deepened for edtech sector. Sustainable unit economics now mandatory. Consolidation expected across the space.' },
  ],
  keyPlayers: [
    { name: 'Byju Raveendran', initials: 'BR', role: 'Founder & CEO', stance: 'negative' },
    { name: 'Riju Raveendran', initials: 'RR', role: 'Co-Founder', stance: 'negative' },
    { name: 'Mohandas Pai', initials: 'MP', role: 'Investor & Critic', stance: 'caution' },
    { name: 'Prosus', initials: 'PR', role: 'Lead Investor', stance: 'negative' },
  ],
  suggestedQuestions: [
    "What went wrong with Byju's acquisitions?",
    "How does this compare to WeWork's collapse?",
    "What happens to students with active subscriptions?",
    "Which investors lost the most money?",
    "What are the regulatory implications?",
  ],
  timeline: [
    { id: 't1', date: '2011', title: 'The Beginning', summary: "Byju Raveendran launches 'Think and Learn' from a Bangalore apartment. The app quickly gains traction with its engaging video content.", sentiment: 'positive' },
    { id: 't2', date: '2015-2018', title: 'Hyper Growth', summary: 'Raises massive funding rounds. Acquires TutorVista, Edurite. Becomes the most valued edtech startup globally.', sentiment: 'positive' },
    { id: 't3', date: '2020-2021', title: 'Pandemic Boom', summary: 'COVID-19 drives unprecedented demand. Revenue triples. Launches spree of acquisitions including Aakash for $1B and WhiteHat Jr for $300M.', sentiment: 'positive' },
    { id: 't4', date: '2022', title: 'Cracks Appear', summary: 'Revenue misses targets. Audit delays raise concerns. First major layoffs begin. Board tensions emerge.', sentiment: 'caution' },
    { id: 't5', date: '2023', title: 'Unraveling', summary: 'Mass layoffs, board resignations, investor lawsuits. Valuation slashed by investors. Governance failures exposed.', sentiment: 'negative' },
    { id: 't6', date: '2024', title: 'Insolvency', summary: 'NCLT orders insolvency proceedings. Founder faces legal battles. Company effectively defunct.', sentiment: 'negative' },
  ],
  sources: [
    'Economic Times',
    'Moneycontrol',
    'Business Standard',
    'The Ken',
    'Bloomberg',
  ],
};

export const sampleChatMessages: ChatMessage[] = [
  {
    id: 'c1',
    role: 'user',
    content: "What went wrong with Byju's acquisitions?",
  },
  {
    id: 'c2',
    role: 'ai',
    content: "Byju's acquisition strategy was fundamentally flawed in three ways:\n\n**1. Overpayment at peak valuations** — Aakash was acquired for ~$1B and WhiteHat Jr for $300M at the height of the edtech bubble. Both were later written down significantly.\n\n**2. Integration failures** — Acquired companies operated as silos with overlapping products and teams. No unified tech platform was built.\n\n**3. Debt-fueled expansion** — Many acquisitions were funded through term loans rather than equity, creating unsustainable debt obligations that became critical when revenue growth slowed.",
    sources: ['Economic Times', 'The Ken', 'Business Standard'],
  },
];
