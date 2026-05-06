import { useFigure } from '../FigureContext';

interface DetailsPageProps {
  isVisible: boolean;
  onClose: () => void;
}

export function DetailsPage({ isVisible, onClose }: DetailsPageProps) {
  const { linkifyText } = useFigure();
  return (
    <div className={`details-page ${isVisible ? 'visible' : 'hidden'}`}>
      <div className="details-page-content">
        <button className="details-close-btn" onClick={onClose} aria-label="Close details">
          ✕
        </button>

        <h1>About This Application</h1>

        <section className="details-section">
          <h2>A Note on the Era Categories</h2>
          <p>
            {linkifyText("This application organises the Viking Age into four periods: Age of Raids (750–869), Age of Conquest & Settlement (870–979), Age of Kings (980–1100), and End of the Viking Age (1101–1408).")}
          </p>
          <p>
            {linkifyText('These categories are not formally recognised academic periodisations. They were inspired by the narrative structure used in the History.com article "Vikings: History" and adapted to suit the interactive timeline format of this application. Historians may divide the Viking Age differently depending on region, theme, or scholarly tradition. We chose these labels because they provide an intuitive narrative arc for exploring the era, from early raiding, through expansion and state-building, to the eventual decline of the Norse world.')}
          </p>
        </section>

        <section className="details-section">
          <h2>Data Sources</h2>
          <p>
            {linkifyText('The scholarly Chronicle entries in the sidebar are sourced from The Age of the Vikings by Anders Winroth (Princeton University Press, 2016).')}
          </p>
        </section>

        <section className="details-section">
          <h2>Technology</h2>
          <p>
            {linkifyText('Viking Atlas is built with React, TypeScript, and Vite. The map uses D3\'s geographic projection library for coordinate maths, but all rendering is handled declaratively by React. There is no backend, all data is compiled into the client bundle.')}
          </p>
        </section>

        <button className="enter-button" onClick={onClose}>
          Back to the Atlas
        </button>
      </div>
    </div>
  );
}
