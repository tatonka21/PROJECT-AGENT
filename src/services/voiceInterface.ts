// ============================================================
// Voice Interface — Speech-to-Text + Text-to-Speech
// Lets users talk to the agent naturally
// ============================================================

// ============================================================
// Speech-to-Text (Speech Recognition)
// ============================================================

let recognition: SpeechRecognition | null = null;
let onResultCallback: ((text: string) => void) | null = null;
let onErrorCallback: ((error: string) => void) | null = null;
let isListening = false;

export function initSpeechToText(
  onResult: (text: string) => void,
  onError?: (error: string) => void
): boolean {
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!SpeechRecognition) {
    onError?.('Speech recognition not supported in this browser');
    return false;
  }

  recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-US';

  onResultCallback = onResult;
  onErrorCallback = onError || (() => {});

  recognition.onresult = (event: SpeechRecognitionEvent) => {
    const text = event.results[0][0].transcript;
    onResultCallback?.(text);
  };

  recognition.onerror = (event: any) => {
    onErrorCallback?.(`Recognition error: ${event.error}`);
    isListening = false;
  };

  recognition.onend = () => {
    isListening = false;
  };

  return true;
}

export function startListening(): boolean {
  if (!recognition) {
    onErrorCallback?.('Speech recognition not initialized');
    return false;
  }
  try {
    recognition.start();
    isListening = true;
    return true;
  } catch (e) {
    onErrorCallback?.('Failed to start listening');
    return false;
  }
}

export function stopListening(): void {
  recognition?.stop();
  isListening = false;
}

export function isCurrentlyListening(): boolean {
  return isListening;
}

// ============================================================
// Text-to-Speech (Speech Synthesis)
// ============================================================

export function speak(text: string, onEnd?: () => void): boolean {
  if (!('speechSynthesis' in window)) {
    return false;
  }

  // Stop any current speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.9;
  utterance.pitch = 1;
  utterance.volume = 1;

  // Try to find a good voice
  const voices = window.speechSynthesis.getVoices();
  const preferredVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Google')) || voices[0];
  if (preferredVoice) utterance.voice = preferredVoice;

  if (onEnd) {
    utterance.onend = onEnd;
  }

  window.speechSynthesis.speak(utterance);
  return true;
}

export function stopSpeaking(): void {
  window.speechSynthesis.cancel();
}

export function isSpeaking(): boolean {
  return window.speechSynthesis.speaking;
}