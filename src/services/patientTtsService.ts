import { findSpeechVoice, SPEECH_LOCALES, SupportedLanguage } from '../i18n/translations';

export type PatientTtsStatus = 'Ready' | 'Speaking' | 'Waiting' | 'Unsupported';

export interface PatientTtsSnapshot {
  selectedLanguage: SupportedLanguage;
  selectedLocale: string;
  provider: 'Browser SpeechSynthesis' | 'Unavailable';
  voiceName: string;
  voiceLanguage: string;
  status: PatientTtsStatus;
}

class PatientTtsService {
  private selectedLanguage: SupportedLanguage = 'en';
  private voices: SpeechSynthesisVoice[] = [];
  private listeners = new Set<(snapshot: PatientTtsSnapshot) => void>();
  private initialized = false;
  private handleVoicesChanged = () => this.refreshVoices();

  public subscribe(listener: (snapshot: PatientTtsSnapshot) => void): () => void {
    this.listeners.add(listener);
    listener(this.getSnapshot());
    return () => this.listeners.delete(listener);
  }

  public initialize(): PatientTtsSnapshot {
    if (this.initialized || typeof window === 'undefined') return this.getSnapshot();
    this.initialized = true;
    if (this.isSupported()) {
      window.speechSynthesis.addEventListener('voiceschanged', this.handleVoicesChanged);
      this.refreshVoices();
    } else {
      this.notify();
    }
    return this.getSnapshot();
  }

  public dispose(): void {
    if (typeof window !== 'undefined' && this.initialized && this.isSupported()) {
      window.speechSynthesis.removeEventListener('voiceschanged', this.handleVoicesChanged);
    }
    this.initialized = false;
  }

  public setLanguage(language: SupportedLanguage): PatientTtsSnapshot {
    this.selectedLanguage = language;
    this.cancel();
    this.refreshVoices();
    return this.getSnapshot();
  }

  public refreshVoices(): PatientTtsSnapshot {
    if (this.isSupported()) {
      this.voices = window.speechSynthesis.getVoices();
    } else {
      this.voices = [];
    }
    this.notify();
    return this.getSnapshot();
  }

  public getSnapshot(): PatientTtsSnapshot {
    const voice = findSpeechVoice(this.voices, this.selectedLanguage);
    const supported = this.isSupported();
    return {
      selectedLanguage: this.selectedLanguage,
      selectedLocale: SPEECH_LOCALES[this.selectedLanguage],
      provider: supported ? 'Browser SpeechSynthesis' : 'Unavailable',
      voiceName: voice?.name || 'No matching voice loaded',
      voiceLanguage: voice?.lang || '',
      status: !supported ? 'Unsupported' : voice ? 'Ready' : 'Unsupported'
    };
  }

  public speak(text: string, language: SupportedLanguage): boolean {
    if (language !== this.selectedLanguage) this.setLanguage(language);
    if (!this.isSupported()) {
      this.notify();
      return false;
    }

    this.cancel();
    const voice = findSpeechVoice(this.voices, language);
    if (!voice) {
      this.notify();
      return false;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = SPEECH_LOCALES[language];
    utterance.voice = voice;
    utterance.onstart = () => this.notify('Speaking');
    utterance.onend = () => this.notify('Waiting');
    utterance.onerror = () => this.notify('Waiting');
    window.speechSynthesis.speak(utterance);
    return true;
  }

  public pause(): void {
    if (this.isSupported()) window.speechSynthesis.pause();
  }

  public resume(): void {
    if (this.isSupported()) window.speechSynthesis.resume();
  }

  public cancel(): void {
    if (this.isSupported()) window.speechSynthesis.cancel();
    this.notify('Waiting');
  }

  private isSupported(): boolean {
    return typeof window !== 'undefined'
      && 'speechSynthesis' in window
      && 'SpeechSynthesisUtterance' in window;
  }

  private notify(status?: PatientTtsStatus): void {
    const snapshot = this.getSnapshot();
    const nextSnapshot = status ? { ...snapshot, status } : snapshot;
    this.listeners.forEach(listener => listener(nextSnapshot));
  }
}

export const patientTtsService = new PatientTtsService();
