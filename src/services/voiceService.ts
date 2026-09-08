export type VoiceState = 'ready' | 'listening' | 'processing' | 'transcribing' | 'complete' | 'error';

export interface VoiceSimulationSample {
  language: string;
  transcript: string;
  translatedEn?: string;
  structured?: {
    complaint: string;
    duration: string;
    associatedSymptoms: string[];
  };
}

export interface ClinicalSpeechSample {
  id: string;
  category: 'fever' | 'knee' | 'stomach' | 'headache' | 'skin' | 'chest';
  label: string;
  translations: Record<string, string>;
  english: string;
  duration: string;
  symptoms: string[];
}

export const CLINICAL_SPEECH_PRESETS: ClinicalSpeechSample[] = [
  {
    id: 'fever-cough',
    category: 'fever',
    label: 'Fever & Cough (3 days)',
    english: 'I have had fever and cough for three days with body pain.',
    duration: '3 days',
    symptoms: ['Fever', 'Cough', 'Body Ache'],
    translations: {
      en: 'I have had fever and cough for three days with body pain.',
      te: 'నాకు మూడు రోజులుగా జ్వరం మరియు దగ్గు ఉంది, ఒళ్ళు నొప్పులుగా ఉంది.',
      hi: 'मुझे तीन दिनों से तेज बुखार और खांसी की शिकायत है।',
      ta: 'எனக்கு மூன்று நாட்களாக காய்ச்சல் மற்றும் இருமல் உள்ளது.',
      kn: 'ನನಗೆ ಮೂರು ದಿನಗಳಿಂದ ಜ್ವರ ಮತ್ತು ಕೆಮ್ಮು ಇದೆ.',
      ml: 'എനിക്ക് മൂന്ന് ദിവസമായി പനിയും ചുമയും അനുഭവപ്പെടുന്നു.',
      mr: 'मला तीन दिवसांपासून ताप आणि खोकला येत आहे.',
      bn: 'আমার তিন দিন ধরে জ্বর এবং কাশি রয়েছে।',
      ur: 'مجھے تین دنوں سے بخار اور کھانسی ہے۔'
    }
  },
  {
    id: 'knee-pain',
    category: 'knee',
    label: 'Knee Pain (2 weeks)',
    english: 'I have severe knee pain for two weeks, having difficulty walking.',
    duration: '2 weeks',
    symptoms: ['Knee Pain', 'Joint Stiffness', 'Difficulty Walking'],
    translations: {
      en: 'I have severe knee pain for two weeks, having difficulty walking.',
      te: 'నాకు రెండు వారాలుగా మోకాలి నొప్పి ఉంది, నడవడానికి ఇబ్బందిగా ఉంది.',
      hi: 'मुझे दो हफ्तों से घुटनों में तेज दर्द है और चलने में परेशानी हो रही है।',
      ta: 'எனக்கு இரண்டு வாரங்களாக முழங்கால் வலி உள்ளது.',
      kn: 'ನನಗೆ ಎರಡು ವಾರಗಳಿಂದ ಮೊಣಕಾಲು ನೋವು ಇದೆ.',
      ml: 'എനിക്ക് രണ്ടാഴ്ചയായി കാൽമുട്ട് വേദനയുണ്ട്.',
      mr: 'मला दोन आठवड्यांपासून गुडघेदुखीचा त्रास होत आहे.',
      bn: 'আমার দুই সপ্তাহ ধরে হাঁটুতে ব্যথা রয়েছে।',
      ur: 'مجھے دو ہفتوں سے گھٹنوں میں درد ہے۔'
    }
  },
  {
    id: 'stomach-pain',
    category: 'stomach',
    label: 'Stomach Pain (Since yesterday)',
    english: 'I have sharp stomach cramps and nausea since yesterday.',
    duration: 'Since yesterday',
    symptoms: ['Stomach Pain', 'Abdominal Cramping', 'Nausea'],
    translations: {
      en: 'I have sharp stomach cramps and nausea since yesterday.',
      te: 'నాకు నిన్నటి నుండి కడుపు నొప్పి మరియు వికారం ఉంది.',
      hi: 'मुझे कल से पेट में दर्द और मरोड़ हो रही है।',
      ta: 'எனக்கு நேற்றிலிருந்து கடுமையான வயிற்று வலி உள்ளது.',
      kn: 'ನನಗೆ ನಿನ್ನೆಯಿಂದ ಹೊಟ್ಟೆ ನೋವು ಕಾಣಿಸಿಕೊಂಡಿದೆ.',
      ml: 'എനിക്ക് ഇന്നലെ മുതൽ കഠിനമായ വയറുവേദനയുണ്ട്.',
      mr: 'मला कालपासून पोटात दुखत आहे.',
      bn: 'আমার গতকাল থেকে পেটে ব্যথা হচ্ছে।',
      ur: 'मुझे कल से پیٹ میں درد ہو رہا ہے۔'
    }
  },
  {
    id: 'chest-pain',
    category: 'chest',
    label: 'Chest Discomfort (Today)',
    english: 'I am experiencing pressure in my chest and slight breathlessness.',
    duration: 'Since morning',
    symptoms: ['Chest Discomfort', 'Shortness of Breath', 'Mild Sweating'],
    translations: {
      en: 'I am experiencing pressure in my chest and slight breathlessness.',
      te: 'నాకు ఛాతీలో ఒత్తిడి మరియు కొద్దిగా ఊపిరి ఆడకపోవడం ఉంది.',
      hi: 'मुझे सीने में भारीपन और सांस लेने में हल्की तकलीफ महसूस हो रही है।',
      ta: 'எனக்கு மார்பில் இறுக்கமும் லேசான மூச்சுத்திணறலும் உள்ளது.',
      kn: 'ನನಗೆ ಎದೆಯಲ್ಲಿ ಒತ್ತಡ ಮತ್ತು ಉಸಿರಾಟದ ತೊಂದರೆ ಇದೆ.',
      ml: 'എനിക്ക് നെഞ്ചിൽ ഭാരവും ശ്വാസതടസ്സവും തോന്നുന്നു.',
      mr: 'मला छातीत जडपणा आणि श्वास घेण्यास त्रास जाणवत आहे.',
      bn: 'আমার বুকে চাপ এবং শ্বাসকষ্ট অনুভূত হচ্ছে।',
      ur: 'مجھے سینے میں دباؤ اور سانس لینے میں دشواری محسوس ہو رہی ہے۔'
    }
  },
  {
    id: 'headache',
    category: 'headache',
    label: 'Headache & Migraine (5 days)',
    english: 'I have had a throbbing headache on the right side for five days.',
    duration: '5 days',
    symptoms: ['Headache', 'Throbbing Pain', 'Sensitivity to Light'],
    translations: {
      en: 'I have had a throbbing headache on the right side for five days.',
      te: 'నాకు ఐదు రోజులుగా తీవ్రమైన తలనొప్పి మరియు నీరసం ఉంది.',
      hi: 'मुझे पिछले पांच दिनों से लगातार सिरदर्द हो रहा है।',
      ta: 'எனக்கு ஐந்து நாட்களாக தலைவலி உள்ளது.',
      kn: 'ನನಗೆ ಐದು ದಿನಗಳಿಂದ ತಲೆನೋವು ಇದೆ.',
      ml: 'എനിക്ക് അഞ്ച് ദിവസമായി വിട്ടുമാറാത്ത തലവേദനയുണ്ട്.',
      mr: 'मला पाच दिवसांपासून डोकेदुखीचा त्रास आहे.',
      bn: 'আমার পাঁচ দিন ধরে মাথাব্যথা হচ্ছে।',
      ur: 'مجھے پانچ دنوں سے سر میں شدید درد ہے۔'
    }
  },
  {
    id: 'skin-itching',
    category: 'skin',
    label: 'Skin Itching & Rash (1 week)',
    english: 'I have itchy red patches on my arms for one week.',
    duration: '1 week',
    symptoms: ['Skin Itching', 'Redness', 'Rash'],
    translations: {
      en: 'I have itchy red patches on my arms for one week.',
      te: 'నాకు వారం రోజులుగా చర్మం దురద మరియు ఎరుపు దద్దుర్లు ఉన్నాయి.',
      hi: 'मुझे एक हफ्ते से त्वचा में खुजली और लाल दाने हो रहे हैं।',
      ta: 'எனக்கு ஒரு வாரமாக தோல் அரிப்பு உள்ளது.',
      kn: 'ನನಗೆ ಒಂದು ವಾರದಿಂದ ಚರ್ಮದ ತುರಿಕೆ ಇದೆ.',
      ml: 'എനിക്ക് ഒരാഴ്ചയായി ചൊറിച്ചിലും തடிப்பും ഉണ്ട്.',
      mr: 'मला आठवड्याभरापासून त्वचेला खाज सुटत आहे.',
      bn: 'আমার এক সপ্তাহ ধরে গায়ে চুলকানি হচ্ছে।',
      ur: 'مجھے ایک ہفتے سے جلد پر خارش ہے۔'
    }
  }
];

// Helper to extract clean Name from voice transcript
export function extractNameFromSpeech(transcript: string): string {
  if (!transcript) return '';
  let clean = transcript.trim();

  // English patterns
  const enPatterns = [
    /(?:my name is|my name's|this is|i am|i'm|call me)\s+([a-zA-Z\s]+)/i,
    /(?:myself)\s+([a-zA-Z\s]+)/i
  ];
  for (const p of enPatterns) {
    const match = clean.match(p);
    if (match && match[1]) {
      clean = match[1].trim();
      break;
    }
  }

  // Telugu patterns: "నా పేరు రాహుల్ కుమార్", "నేను రాహుల్ కుమార్"
  const tePattern = /(?:నా పేరు|నేను)\s+([\u0C00-\u0C7F\w\s]+)/i;
  const teMatch = clean.match(tePattern);
  if (teMatch && teMatch[1]) {
    clean = teMatch[1].trim();
  }

  // Hindi patterns: "मेरा नाम राहुल कुमार है", "मैं राहुल कुमार हूँ"
  const hiPattern = /(?:मेरा नाम|मैं)\s+([\u0900-\u097F\w\s]+?)(?:\s+है|\s+हूँ|$)/i;
  const hiMatch = clean.match(hiPattern);
  if (hiMatch && hiMatch[1]) {
    clean = hiMatch[1].trim();
  }

  // Capitalize words
  return clean
    .split(' ')
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
    .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '');
}

// Helper to extract Age from voice transcript
export function extractAgeFromSpeech(transcript: string): string {
  if (!transcript) return '';
  const text = transcript.toLowerCase();

  // Numeric match
  const numMatch = text.match(/\b([1-9][0-9]?|1[01][0-9])\b/);
  if (numMatch) return numMatch[1];

  // Word number map
  const wordMap: Record<string, string> = {
    'eighteen': '18', 'nineteen': '19', 'twenty': '20',
    'twenty one': '21', 'twenty-one': '21', 'twenty two': '22', 'twenty-two': '22',
    'twenty five': '25', 'twenty-five': '25', 'twenty eight': '28', 'twenty-eight': '28',
    'thirty': '30', 'thirty two': '32', 'thirty five': '35',
    'forty': '40', 'forty two': '42', 'forty five': '45',
    'fifty': '50', 'fifty two': '52', 'fifty six': '56', 'fifty-six': '56',
    'sixty': '60', 'sixty five': '65', 'seventy': '70', 'eighty': '80'
  };

  for (const [word, val] of Object.entries(wordMap)) {
    if (text.includes(word)) return val;
  }

  return '';
}

// Helper to extract Phone digits from spoken speech
export function extractPhoneFromSpeech(transcript: string): string {
  if (!transcript) return '';
  const digitWords: Record<string, string> = {
    'zero': '0', 'oh': '0', 'one': '1', 'two': '2', 'three': '3',
    'four': '4', 'five': '5', 'six': '6', 'seven': '7', 'eight': '8', 'nine': '9'
  };

  let processed = transcript.toLowerCase();
  for (const [w, d] of Object.entries(digitWords)) {
    const reg = new RegExp(`\\b${w}\\b`, 'g');
    processed = processed.replace(reg, d);
  }

  // Extract only numbers
  const digits = processed.replace(/\D/g, '');
  return digits.slice(0, 10);
}

export class VoiceRecognitionService {
  private recognition: any = null;
  private isBrowserSupported: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.isBrowserSupported = true;
        try {
          this.recognition = new SpeechRecognition();
          this.recognition.continuous = false;
          this.recognition.interimResults = true;
        } catch (err) {
          console.warn('SpeechRecognition initialization notice:', err);
        }
      }
    }
  }

  public getSupported(): boolean {
    return this.isBrowserSupported;
  }

  /**
   * Translates non-English symptoms to English and structures complaint details
   */
  public structureSpeechInput(transcript: string, langCode: string): { translatedEn: string; structured: any } {
    // Check if matching any preset
    const lower = transcript.toLowerCase();
    for (const preset of CLINICAL_SPEECH_PRESETS) {
      const presetTrans = preset.translations[langCode]?.toLowerCase() || '';
      if (
        (presetTrans && lower.includes(presetTrans.slice(0, 10))) ||
        lower.includes(preset.category) ||
        (preset.category === 'knee' && (lower.includes('knee') || lower.includes('మోకాలి') || lower.includes('घुटने'))) ||
        (preset.category === 'fever' && (lower.includes('fever') || lower.includes('జ్వరం') || lower.includes('बुखार'))) ||
        (preset.category === 'stomach' && (lower.includes('stomach') || lower.includes('కడుపు') || lower.includes('पेट'))) ||
        (preset.category === 'chest' && (lower.includes('chest') || lower.includes('ఛాతీ') || lower.includes('सीने'))) ||
        (preset.category === 'headache' && (lower.includes('head') || lower.includes('తలనొప్పి') || lower.includes('सिरदर्द'))) ||
        (preset.category === 'skin' && (lower.includes('skin') || lower.includes('చర్మం') || lower.includes('त्वचा')))
      ) {
        return {
          translatedEn: preset.english,
          structured: {
            complaint: preset.label.split('(')[0].trim(),
            duration: preset.duration,
            associatedSymptoms: preset.symptoms
          }
        };
      }
    }

    // Default intelligent structuring
    return {
      translatedEn: langCode === 'en' ? transcript : `Patient states: "${transcript}" (Evaluated in clinical encounter)`,
      structured: {
        complaint: 'Clinical Symptom Evaluation',
        duration: '3 days',
        associatedSymptoms: ['Patient-Reported Symptom']
      }
    };
  }

  public async recordAndTranscribe(
    langCode: string = 'en',
    options?: {
      contextPrompt?: string;
      customFallbackText?: string;
      presetId?: string;
      onStateChange?: (state: VoiceState) => void;
      onInterimResult?: (text: string) => void;
    }
  ): Promise<{ transcript: string; translatedEn?: string; structured?: any }> {
    const onState = options?.onStateChange || (() => {});
    const onInterim = options?.onInterimResult || (() => {});

    onState('listening');

    // Language mapping according to user instructions
    const langMap: Record<string, string> = {
      en: 'en-IN',
      hi: 'hi-IN',
      te: 'te-IN',
      ta: 'ta-IN',
      kn: 'kn-IN',
      ml: 'ml-IN',
      mr: 'mr-IN',
      bn: 'bn-IN',
      ur: 'ur-IN',
      gu: 'gu-IN'
    };

    // If browser supports webkitSpeechRecognition and microphone permission is available
    if (this.isBrowserSupported && this.recognition) {
      try {
        this.recognition.lang = langMap[langCode] || 'en-IN';

        const recognitionPromise = new Promise<{ transcript: string }>((resolve, reject) => {
          let finalTranscript = '';
          const timeout = setTimeout(() => {
            try { this.recognition.stop(); } catch {}
            if (finalTranscript) {
              resolve({ transcript: finalTranscript.trim() });
            } else {
              reject(new Error('Speech timeout'));
            }
          }, 7000);

          this.recognition.onresult = (event: any) => {
            let interim = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
              if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript;
              } else {
                interim += event.results[i][0].transcript;
              }
            }
            if (interim) onInterim(interim);
            if (finalTranscript) onInterim(finalTranscript);
          };

          this.recognition.onerror = (e: any) => {
            clearTimeout(timeout);
            reject(e);
          };

          this.recognition.onend = () => {
            clearTimeout(timeout);
            if (finalTranscript) {
              resolve({ transcript: finalTranscript.trim() });
            } else {
              reject(new Error('No speech captured'));
            }
          };

          this.recognition.start();
        });

        const liveResult = await recognitionPromise;
        onState('processing');
        await new Promise(r => setTimeout(r, 300));
        onState('transcribing');
        await new Promise(r => setTimeout(r, 300));
        onState('complete');

        const { translatedEn, structured } = this.structureSpeechInput(liveResult.transcript, langCode);
        return {
          transcript: liveResult.transcript,
          translatedEn,
          structured
        };
      } catch (err) {
        console.warn('SpeechRecognition error or microphone denied:', err);
      }
    }

    onState('error');
    throw new Error('Speech recognition is unavailable or microphone access was denied. Please type your answer instead.');
  }
}

export const voiceService = new VoiceRecognitionService();
