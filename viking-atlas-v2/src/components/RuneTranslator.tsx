import { useState } from 'react';
import { translateToRunes, type RuneTheme } from '../utils/runeTranslator';

interface RuneTranslatorProps {
  isVisible: boolean;
  onClose: () => void;
}

export function RuneTranslator({ isVisible, onClose }: RuneTranslatorProps) {
  const [inputText, setInputText] = useState('');
  const [activeTheme, setActiveTheme] = useState<RuneTheme>('younger');
  const [copyStatus, setCopyStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const runeOutput = translateToRunes(inputText, activeTheme);
  const isPlaceholder = inputText.trim() === '';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(runeOutput);
      setCopyStatus('success');
    } catch {
      setCopyStatus('error');
    } finally {
      setTimeout(() => setCopyStatus('idle'), 2000);
    }
  };

  return (
    <div className={`rune-translator ${isVisible ? 'visible' : 'hidden'}`}>
      <button className="panel-close" onClick={onClose} title="Close panel">
        ✕
      </button>

      <div className="rune-content">
        <h2>Write your name in Runes</h2>
        
        <input 
          type="text" 
          placeholder="Enter your name..." 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="rune-input-box"
        />

        <div className="rune-options">
          <button 
            className={`rune-option-card ${activeTheme === 'elder' ? 'active' : ''}`}
            onClick={() => setActiveTheme('elder')}
          >
            <h3>Elder Futhark</h3>
            <span className="rune-date">c. 150 – 800 AD</span>
            <p>The oldest form of runic alphabet consisting of 24 characters. Though predating the Viking Age, its direct letter-mapping makes it very popular today.</p>
          </button>

          <button 
            className={`rune-option-card ${activeTheme === 'younger' ? 'active' : ''}`}
            onClick={() => setActiveTheme('younger')}
          >
            <h3>Younger Futhark</h3>
            <span className="rune-date">c. 800 – 1100 AD</span>
            <p>The true "Viking Age" alphabet stringently simplified to just 16 characters. This is what you find etched into most Scandinavian runestones from the period.</p>
          </button>
        </div>

        <div className="rune-output-container">
          <div className="rune-output-box">
            {runeOutput || '...'}
          </div>
          <button
            className="rune-copy-btn"
            onClick={handleCopy}
            disabled={isPlaceholder}
          >
            {copyStatus === 'success' ? 'Copied!' : copyStatus === 'error' ? 'Copy failed' : 'Copy to Clipboard'}
          </button>
        </div>
      </div>
    </div>
  );
}
