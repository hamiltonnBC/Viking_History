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
          The Viking Age (c. 750–1100 AD) was a period of rapid expansion, exploration, and
          conquest by Norse seafarers. From the raid on Lindisfarne to the founding of Normandy,
          from the rivers of Russia to the shores of North America, the Vikings left an indelible
          mark on global history.
        </p>
        <p>
          Use the timeline below to travel through centuries of history, exploring the pivotal battles,
          legendary voyages, and deep settlements that defined an era.
        </p>
        <button className="enter-button" onClick={onEnter}>
          Click here to view the timeline
        </button>
      </div>
    </div>
  );
}
