import { useState } from 'react';

const runicMap: Record<string, string> = {
  a: 'ᚨ', b: 'ᛒ', c: 'ᚲ', d: 'ᛞ', e: 'ᛖ', f: 'ᚠ', g: 'ᚷ', h: 'ᚺ',
  i: 'ᛁ', j: 'ᛃ', k: 'ᚲ', l: 'ᛚ', m: 'ᛗ', n: 'ᚾ', o: 'ᛟ', p: 'ᛈ',
  q: 'ᚲ', r: 'ᚱ', s: 'ᛊ', t: 'ᛏ', u: 'ᚢ', v: 'ᚢ', w: 'ᚢ', x: 'ᚲᛊ',
  y: 'ᛃ', z: 'ᛉ', ' ': ' ',
};

function translateToRunes(text: string): string {
  let lower = text.toLowerCase();
  lower = lower.replace(/th/g, 'ᚦ');
  lower = lower.replace(/ng/g, 'ᛜ');
  return lower.split('').map(char => runicMap[char] || char).join('');
}

interface RuneTranslatorProps {
  isVisible: boolean;
  onClose: () => void;
}

export function RuneTranslator({ isVisible, onClose }: RuneTranslatorProps) {
  const [inputText, setInputText] = useState('');

  return (
    <div className={`rune-translator ${isVisible ? 'visible' : 'hidden'}`}>
      <button className="panel-close" onClick={onClose} title="Close panel">
        ✕
      </button>
      <div className="rune-content">
        <h2>Write your name in Runes</h2>
        <p>Type your name below to see it translated into Elder Futhark runes.</p>
        <div className="rune-inputs">
          <input 
            type="text" 
            placeholder="Enter your name..." 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="rune-input-box"
          />
          <div className="rune-output-box">
            {translateToRunes(inputText) || '...'}
          </div>
        </div>
      </div>
    </div>
  );
}
