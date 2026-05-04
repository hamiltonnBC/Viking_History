interface HomeSplashProps {
  isVisible: boolean;
  onEnter: () => void;
}

export function HomeSplash({ isVisible, onEnter }: HomeSplashProps) {
  return (
    <div className={`home-splash ${isVisible ? 'visible' : 'hidden'}`}>
      <div className="home-splash-content">
        <h1>About The Viking Age</h1>
        <p>
          The Viking Age (c. 750–1100 AD) was a period of rapid Scandinavian expansion driven by a culture of gift-giving, internal politics, and maritime innovation. What began as raids on monasteries and coastal towns evolved into permanent settlements, long-distance trade networks, and the formation of new kingdoms from the Danelaw to Dublin, Iceland to Greenland, and even briefly North America.
        </p>
        <p>
          Use the timeline below to travel through centuries of history, exploring the battles,
          voyages, and settlements that defined the era.
        </p>
        <button className="enter-button" onClick={onEnter}>
          Click here to view the timeline
        </button>
        <div className="credits-section" style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--glass-border)', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Made by <strong>Nicholas Hamilton</strong> & <strong>America Gaona Borges</strong>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', marginTop: '8px' }}>
            
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nicholas</span>
              <a href="https://github.com/hamiltonnBC" target="_blank" rel="noreferrer">
                <img src="https://img.shields.io/badge/GitHub-100000?style=flat&logo=github&logoColor=white" alt="GitHub" />
              </a>
              <a href="https://www.linkedin.com/in/nicholas-trey-hamilton/" target="_blank" rel="noreferrer">
                <img src="https://img.shields.io/badge/LinkedIn-0077B5?style=flat&logo=linkedin&logoColor=white" alt="LinkedIn" />
              </a>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>America</span>
              <a href="https://github.com/gaonaborgesa" target="_blank" rel="noreferrer">
                <img src="https://img.shields.io/badge/GitHub-100000?style=flat&logo=github&logoColor=white" alt="GitHub" />
              </a>
              <a href="https://www.linkedin.com/in/america-gaona-borges/" target="_blank" rel="noreferrer">
                <img src="https://img.shields.io/badge/LinkedIn-0077B5?style=flat&logo=linkedin&logoColor=white" alt="LinkedIn" />
              </a>
            </div>

          </div>
          <div style={{ marginTop: '16px' }}>
            Professor: <a href="https://www.berea.edu/facultyMember/dr-tyler-sergent" target="_blank" rel="noreferrer" style={{ color: 'var(--gold-bright)', textDecoration: 'none' }}><strong>Dr. Tyler Sergent</strong></a>
          </div>
        </div>
      </div>
    </div>
  );
}
