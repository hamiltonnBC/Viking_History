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

export type RuneTheme = 'younger' | 'elder';

export function translateToRunes(text: string, theme: RuneTheme): string {
  let lower = text.toLowerCase();
  lower = lower.replace(/th/g, 'ᚦ');
  if (theme === 'elder') {
    lower = lower.replace(/ng/g, 'ᛜ');
  }
  return lower.split('').map(char => RUNIC_MAPS[theme][char] || char).join('');
}
