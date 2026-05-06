import { useState, useEffect } from 'react';
import { ImportantFigures } from './ImportantFigures';
import { StoryTelling } from './StoryTelling';

interface LearnMoreProps {
  isVisible: boolean;
  onClose: () => void;
  highlightedFigureId?: string | null;
}

interface Topic {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
}

const TOPICS: Topic[] = [
  {
    id: 'who-were-vikings',
    title: 'Who Were the Vikings?',
    subtitle: 'Origins and culture of the Norse people',
    icon: '⚔️',
  },
  {
    id: 'important-figures',
    title: 'Important Figures',
    subtitle: 'The chieftains, explorers, and kings who defined the age',
    icon: '👑',
  },
  {
    id: 'story-telling',
    title: 'Story-Telling',
    subtitle: 'Sagas, skalds, and the oral tradition of the North',
    icon: '📖',
  },
  {
    id: 'spread-of-christianity',
    title: 'Spread of Christianity',
    subtitle: 'How the Norse world transitioned from paganism to the Christian faith',
    icon: '✝️',
  },
  {
    id: 'history-during-viking-age',
    title: 'History During the Viking Age',
    subtitle: 'What was happening in the rest of Europe while the Vikings raided',
    icon: '📜',
  },
  {
    id: 'ships-and-seafaring',
    title: 'Ships and Seafaring',
    subtitle: 'Longships, navigation, and the technology that made expansion possible',
    icon: '⛵',
  },
  {
    id: 'trade-and-economy',
    title: 'Trade and Economy',
    subtitle: 'The commercial networks that spanned continents',
    icon: '⚖️',
  },
  {
    id: 'gallery',
    title: 'Gallery',
    subtitle: 'Visual history, artifacts, and reconstructions',
    icon: '🖼️',
  },
  {
    id: 'legacy-and-influence',
    title: 'Legacy and Influence',
    subtitle: 'How the Viking Age shaped modern language & culture',
    icon: '🏛️',
  },
];

export function LearnMore({ isVisible, onClose, highlightedFigureId }: LearnMoreProps) {
  const [activeTopic, setActiveTopic] = useState<string | null>(null);

  // Sync activeTopic if a figure is highlighted
  useEffect(() => {
    if (highlightedFigureId) {
      setActiveTopic('important-figures');
    }
  }, [highlightedFigureId]);

  const handleClose = () => {
    setActiveTopic(null);
    onClose();
  };

  const handleBack = () => {
    setActiveTopic(null);
  };

  // Topic detail page
  if (activeTopic) {
    const topic = TOPICS.find(t => t.id === activeTopic);
    
    let content = <p className="learn-more-placeholder">Content coming soon.</p>;
    
    if (activeTopic === 'important-figures') {
      content = <ImportantFigures highlightId={highlightedFigureId} />;
    } else if (activeTopic === 'story-telling') {
      content = <StoryTelling />;
    }

    return (
      <div className={`details-page ${isVisible ? 'visible' : 'hidden'}`}>
        <div className="details-page-content learn-more-detail">
          <div className="learn-more-detail-nav">
            <button className="learn-more-back-btn" onClick={handleBack} aria-label="Back to topics">
              ← Back
            </button>
            <button className="details-close-btn" onClick={handleClose} aria-label="Close">
              ✕
            </button>
          </div>
          <h1>{topic?.icon} {topic?.title}</h1>
          <div className="learn-more-detail-body">
            {content}
          </div>
        </div>
      </div>
    );
  }

  // Topic grid
  return (
    <div className={`details-page ${isVisible ? 'visible' : 'hidden'}`}>
      <div className="details-page-content learn-more-content">
        <button className="details-close-btn" onClick={handleClose} aria-label="Close">
          ✕
        </button>

        <h1>Learn More</h1>
        <p className="learn-more-intro">
          Dive deeper into the world of the Vikings. Choose a topic below to explore.
        </p>

        <div className="learn-more-grid">
          {TOPICS.map(topic => (
            <button
              key={topic.id}
              className="learn-more-card"
              onClick={() => setActiveTopic(topic.id)}
            >
              <span className="learn-more-card-icon">{topic.icon}</span>
              <span className="learn-more-card-title">{topic.title}</span>
              <span className="learn-more-card-subtitle">{topic.subtitle}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
