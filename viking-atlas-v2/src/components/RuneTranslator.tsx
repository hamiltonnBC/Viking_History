import { useState } from 'react';

const RUNIC_MAPS = {
  elder: {
    a: 'ᚨ', b: 'ᛒ', c: 'ᚲ', d: 'ᛞ', e: 'ᛖ', f: 'ᚠ', g: 'ᚷ', h: 'ᚺ',
    i: 'ᛁ', j: 'ᛃ', k: 'ᚲ', l: 'ᛚ', m: 'ᛗ', n: 'ᚾ', o: 'ᛟ', p: 'ᛈ',
    q: 'ᚲ', r: 'ᚱ', s: 'ᛊ', t: 'ᛏ', u: 'ᚢ', v: 'ᚢ', w: 'ᚢ', x: 'ᚲᛊ',
    y: 'ᛃ', z: 'ᛉ', ' ': ' ',
  } as Record<string, string>,
  younger: {
    a: 'ᛅ', b: 'ᛒ', c: 'ᚴ', d: 'ᛏ', e: 'ᛁ', f: 'ᚠ', g: 'ᚴ', h: 'ᚼ',
    i: 'ᛁ', j: 'ᛁ', k: 'ᚴ', l: 'ᛚ', m: 'ᛘ', n: 'ᚾ', o: 'ᚢ', p: 'ᛒ',
    q: 'ᚴ', r: 'ᚱ', s: 'ᛋ', t: 'ᛏ', u: 'ᚢ', v: 'ᚠ', w: 'ᚠ', x: 'ᚴᛋ',
    y: 'ᛁ', z: 'ᛋ', ' ': ' ',
  } as Record<string, string>
};

type RuneTheme = 'younger' | 'elder';

function translateToRunes(text: string, theme: RuneTheme): string {
  let lower = text.toLowerCase();
  lower = lower.replace(/th/g, 'ᚦ');
  if (theme === 'elder') {
    lower = lower.replace(/ng/g, 'ᛜ');
  }
  return lower.split('').map(char => RUNIC_MAPS[theme][char] || char).join('');
}

interface RuneTranslatorProps {
  isVisible: boolean;
  onClose: () => void;
}

export function RuneTranslator({ isVisible, onClose }: RuneTranslatorProps) {
  const [inputText, setInputText] = useState('');
  const [activeTheme, setActiveTheme] = useState<RuneTheme>('younger');

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
            {translateToRunes(inputText, activeTheme) || '...'}
          </div>
        </div>
      </div>
    </div>
  );
}
