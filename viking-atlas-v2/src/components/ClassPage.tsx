import { useState } from 'react';

interface ClassPageProps {
  isVisible: boolean;
  onClose: () => void;
}

interface Topic {
  id: string;
  title: string;
  subtitle: string;
}

const TOPICS: Topic[] = [
  {
    id: 'dr-tyler-sergent',
    title: 'Dr. Tyler Sergent',
    subtitle: 'Learn more about Dr. Tyler Sergent',
  },
  {
    id: 'projects',
    title: 'Projects',
    subtitle: 'Class projects and research',
  },
];

export function ClassPage({ isVisible, onClose }: ClassPageProps) {
  const [activeTopic, setActiveTopic] = useState<string | null>(null);

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
          <h1>{topic?.title}</h1>
          <div className="learn-more-detail-body">
            <p className="learn-more-placeholder">Content coming soon.</p>
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

        <h1>Class</h1>
        <p className="learn-more-intro">
          Information regarding the class, the professor, and student projects.
        </p>

        <div className="learn-more-grid">
          {TOPICS.map(topic => (
            <button
              key={topic.id}
              className="learn-more-card"
              onClick={() => setActiveTopic(topic.id)}
            >
              <span className="learn-more-card-title">{topic.title}</span>
              <span className="learn-more-card-subtitle">{topic.subtitle}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
