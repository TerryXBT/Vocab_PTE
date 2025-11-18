export type Accent = 'us' | 'uk';

export async function speakWord(text: string, accent: Accent = 'us') {
  if (!('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported in this browser.');
    return;
  }

  const ensureVoices = (): Promise<SpeechSynthesisVoice[]> =>
    new Promise((resolve) => {
      const existing = window.speechSynthesis.getVoices();
      if (existing.length) {
        resolve(existing);
        return;
      }
      const handle = () => {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length) {
          resolve(voices);
          window.speechSynthesis.removeEventListener('voiceschanged', handle);
        }
      };
      window.speechSynthesis.addEventListener('voiceschanged', handle);
      // fallback timeout
      setTimeout(() => {
        resolve(window.speechSynthesis.getVoices());
        window.speechSynthesis.removeEventListener('voiceschanged', handle);
      }, 800);
    });

  const voices = await ensureVoices();
  const langCode = accent === 'us' ? 'en-US' : 'en-GB';
  const match =
    voices.find((v) => v.lang.toLowerCase() === langCode.toLowerCase()) ||
    voices.find((v) => v.lang.toLowerCase().startsWith(langCode.split('-')[0])) ||
    voices.find((v) => v.lang.toLowerCase().includes('en-gb')) ||
    voices.find((v) => v.lang.toLowerCase().includes('en')) ||
    null;

  // Some browsers need resume to kick off audio after user interaction
  if (window.speechSynthesis.paused) {
    window.speechSynthesis.resume();
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = langCode;
  if (match) {
    utterance.voice = match;
  }

  window.speechSynthesis.cancel();
  // Small timeout helps on some browsers after cancel/resume
  setTimeout(() => {
    try {
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('speechSynthesis error', err);
    }
  }, 50);
}
