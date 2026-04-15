interface HomeSplashProps {
  isVisible: boolean;
  onEnter: () => void;
}

export function HomeSplash({ isVisible, onEnter }: HomeSplashProps) {
  return (
    <div className={`home-splash ${isVisible ? 'visible' : 'hidden'}`}>
      <div className="home-splash-content">
        <h1>Welcome to The Viking Age timeline!</h1>
        <p>
          The Viking Age (c. 750–1100 AD - Maybe put specific dates here?) was a period of rapid expansion, exploration, and
          conquest. - Add general description of viking history here
        </p>
        <p>
          Use the timeline below to travel through centuries of history, exploring the battles,
          voyages, and settlements that defined the era.
        </p>
        <button className="enter-button" onClick={onEnter}>
          Click here to view the timeline
        </button>
      </div>
    </div>
  );
}
