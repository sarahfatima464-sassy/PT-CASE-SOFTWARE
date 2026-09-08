import { SupportedLanguage } from './translations';

export interface KioskLocaleStrings {
  titleGetToKnow: string;
  subtitleGetToKnow: string;
  fullNameLabel: string;
  fullNamePlaceholder: string;
  ageLabel: string;
  phoneLabel: string;
  genderLabel: string;
  chooseLanguageTitle: string;
  chooseLanguageSubtitle: string;
  whatBringsYouTitle: string;
  whatBringsYouSubtitle: string;
  durationQuestion: string;
  reviewTitle: string;
  reviewSubtitle: string;
  confirmSubmit: string;
  editInfo: string;
  savedAuto: string;
  tapToSpeak: string;
  typeSymptom: string;
  commonSymptoms: string;
  genders: {
    male: string;
    female: string;
    other: string;
    preferNot: string;
  };
  symptoms: {
    fever: string;
    cough: string;
    headache: string;
    stomachPain: string;
    chestPain: string;
    kneePain: string;
    backPain: string;
    skinProblem: string;
    vomiting: string;
    diarrhea: string;
    dizziness: string;
    breathingDiff: string;
  };
  durations: {
    yesterday: string;
    twoDays: string;
    fiveDays: string;
    oneWeek: string;
    twoWeeks: string;
    oneMonth: string;
  };
}

export const KIOSK_TRANSLATIONS: Record<SupportedLanguage, KioskLocaleStrings> = {
  en: {
    titleGetToKnow: "Let's get to know you",
    subtitleGetToKnow: "Please enter your details to create your independent medical profile",
    fullNameLabel: "What is your full name?",
    fullNamePlaceholder: "e.g. Rahul Kumar",
    ageLabel: "How old are you?",
    phoneLabel: "What is your phone number?",
    genderLabel: "Select your gender",
    chooseLanguageTitle: "Choose your preferred language",
    chooseLanguageSubtitle: "The clinical questions and voice intake will adapt to your choice",
    whatBringsYouTitle: "What brings you to the doctor today?",
    whatBringsYouSubtitle: "Describe what you are feeling using voice, typing, or touch",
    durationQuestion: "How long have you had this issue?",
    reviewTitle: "Review Your Information",
    reviewSubtitle: "Verify your details before forwarding to the attending doctor",
    confirmSubmit: "Confirm & Submit to Doctor",
    editInfo: "Edit Information",
    savedAuto: "Saved automatically",
    tapToSpeak: "Tap & Speak Symptoms",
    typeSymptom: "Type your symptoms here in any language...",
    commonSymptoms: "Common Health Concerns (Tap to select)",
    genders: {
      male: "Male",
      female: "Female",
      other: "Other",
      preferNot: "Prefer not to say"
    },
    symptoms: {
      fever: "Fever / Temperature",
      cough: "Cough & Cold",
      headache: "Headache",
      stomachPain: "Stomach / Belly Pain",
      chestPain: "Chest Discomfort",
      kneePain: "Knee / Joint Pain",
      backPain: "Lower Back Pain",
      skinProblem: "Skin Rash & Itching",
      vomiting: "Vomiting / Nausea",
      diarrhea: "Diarrhea",
      dizziness: "Dizziness & Vertigo",
      breathingDiff: "Breathing Difficulty"
    },
    durations: {
      yesterday: "Since yesterday",
      twoDays: "2 - 3 days",
      fiveDays: "5 days",
      oneWeek: "1 week",
      twoWeeks: "2 weeks",
      oneMonth: "1 month or more"
    }
  },

  te: {
    titleGetToKnow: "మీ గురించి తెలుసుకుందాం",
    subtitleGetToKnow: "మీ వైద్య రికార్డును ప్రారంభించడానికి ప్రాథమిక వివరాలను నమోదు చేయండి",
    fullNameLabel: "మీ పేరు ఏమిటి?",
    fullNamePlaceholder: "ఉదా: రాహుల్ కుమార్",
    ageLabel: "మీ వయస్సు ఎంత?",
    phoneLabel: "మీ ఫోన్ నంబర్ ఎంత?",
    genderLabel: "మీ లింగము ఎంచుకోండి",
    chooseLanguageTitle: "మీకు అనుకూలమైన భాషను ఎంచుకోండి",
    chooseLanguageSubtitle: "వైద్య ప్రశ్నలు మరియు వాయిస్ సిస్టమ్ మీ భాషలో అందుబాటులో ఉంటాయి",
    whatBringsYouTitle: "మీకు ఏ ఆరోగ్య సమస్య ఉంది?",
    whatBringsYouSubtitle: "మీరు ఎదుర్కొంటున్న ఇబ్బందిని వాయిస్, టైపింగ్ లేదా స్పర్శ ద్వారా తెలపండి",
    durationQuestion: "ఈ సమస్య ఎప్పటి నుండి ఉంది?",
    reviewTitle: "మీ వివరాలను సమీక్షించండి",
    reviewSubtitle: "డాక్టర్‌కు పంపే ముందు వివరాలను సరిచూసుకోండి",
    confirmSubmit: "ధృవీకరించి డాక్టర్‌కు పంపండి",
    editInfo: "వివరాలను సవరించండి",
    savedAuto: "స్వయంచాలకంగా భద్రపరచబడింది",
    tapToSpeak: "మైక్ నొక్కి మాట్లాడండి",
    typeSymptom: "మీ సమస్యను ఇక్కడ టైప్ చేయండి...",
    commonSymptoms: "సాధారణ ఆరోగ్య సమస్యలు (ఎంచుకోండి)",
    genders: {
      male: "పురుషుడు",
      female: "స్త్రీ",
      other: "ఇతర",
      preferNot: "చెప్పడానికి ఇష్టపడలేదు"
    },
    symptoms: {
      fever: "జ్వరం / ఒంటి కాలుడు",
      cough: "దగ్గు & జలుబు",
      headache: "తలనొప్పి",
      stomachPain: "కడుపు నొప్పి",
      chestPain: "ఛాతీ నొప్పి / బిగుతు",
      kneePain: "మోకాలి నొప్పి",
      backPain: "వెన్నునొప్పి / నడుము నొప్పి",
      skinProblem: "చర్మ దురద / దద్దుర్లు",
      vomiting: "వాంతులు / వికారం",
      diarrhea: "విరేచనాలు",
      dizziness: "తలతిరగడం",
      breathingDiff: "శ్వాస తీసుకోవడంలో ఇబ్బంది"
    },
    durations: {
      yesterday: "నిన్నటి నుండి",
      twoDays: "2 - 3 రోజులుగా",
      fiveDays: "5 రోజులుగా",
      oneWeek: "1 వారం రోజులుగా",
      twoWeeks: "2 వారాలుగా",
      oneMonth: "1 నెల లేదా అంతకంటే ఎక్కువ"
    }
  },

  hi: {
    titleGetToKnow: "आइए आपके बारे में जानें",
    subtitleGetToKnow: "अपना मेडिकल रिकॉर्ड बनाने के लिए कृपया अपनी बुनियादी जानकारी भरें",
    fullNameLabel: "आपका नाम क्या है?",
    fullNamePlaceholder: "उदा: राहुल कुमार",
    ageLabel: "आपकी उम्र कितनी है?",
    phoneLabel: "आपका फोन नंबर क्या है?",
    genderLabel: "अपना लिंग चुनें",
    chooseLanguageTitle: "अपनी पसंदीदा भाषा चुनें",
    chooseLanguageSubtitle: "सभी प्रश्न और बातचीत आपकी चुनी हुई भाषा में प्रदर्शित होंगे",
    whatBringsYouTitle: "आपको क्या स्वास्थ्य समस्या है?",
    whatBringsYouSubtitle: "अपनी परेशानी आवाज, लिखकर या टच करके बताएं",
    durationQuestion: "यह समस्या कब से है?",
    reviewTitle: "अपनी जानकारी की समीक्षा करें",
    reviewSubtitle: "डॉक्टर को भेजने से पहले अपनी जानकारी जांच लें",
    confirmSubmit: "पुष्टि करें और डॉक्टर को भेजें",
    editInfo: "जानकारी बदलें",
    savedAuto: "स्वतः सहेजा गया",
    tapToSpeak: "माइक दबाकर बोलें",
    typeSymptom: "अपनी बीमारी या लक्षण यहाँ लिखें...",
    commonSymptoms: "सामान्य लक्षण (चुनने के लिए टैप करें)",
    genders: {
      male: "पुरुष",
      female: "महिला",
      other: "अन्य",
      preferNot: "बताना नहीं चाहते"
    },
    symptoms: {
      fever: "बुखार / तेज ताप",
      cough: "खांसी और जुकाम",
      headache: "सिरदर्द",
      stomachPain: "पेट में दर्द / मरोड़",
      chestPain: "सीने में दर्द या जकड़न",
      kneePain: "घुटनों में दर्द",
      backPain: "कमर या पीठ दर्द",
      skinProblem: "त्वचा में खुजली या दाने",
      vomiting: "उल्टी या जी मिचलाना",
      diarrhea: "दस्त",
      dizziness: "चक्कर आना",
      breathingDiff: "सांस लेने में तकलीफ"
    },
    durations: {
      yesterday: "कल से",
      twoDays: "2 - 3 दिनों से",
      fiveDays: "5 दिनों से",
      oneWeek: "1 हफ्ते से",
      twoWeeks: "2 हफ्तों से",
      oneMonth: "1 महीने या अधिक से"
    }
  },

  ta: {
    titleGetToKnow: "உங்களை பற்றி அறிந்து கொள்வோம்",
    subtitleGetToKnow: "உங்கள் மருத்துவ சுயவிவரத்தை உருவாக்க விவரங்களை உள்ளிடவும்",
    fullNameLabel: "உங்கள் பெயர் என்ன?",
    fullNamePlaceholder: "எ.கா: ராகுல் குமார்",
    ageLabel: "உங்கள் வயது என்ன?",
    phoneLabel: "உங்கள் தொலைபேசி எண் என்ன?",
    genderLabel: "உங்கள் பாலினத்தைத் தேர்வுசெய்க",
    chooseLanguageTitle: "உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்",
    chooseLanguageSubtitle: "அனைத்து மருத்துவ கேள்விகளும் உங்கள் மொழியில் இருக்கும்",
    whatBringsYouTitle: "உங்களுக்கு என்ன உடல்நலப் பிரச்சினை?",
    whatBringsYouSubtitle: "உங்கள் அறிகுறிகளை குரல், தட்டச்சு அல்லது தொடுதல் மூலம் பகிரவும்",
    durationQuestion: "இது எத்தனை நாட்களாக உள்ளது?",
    reviewTitle: "உங்கள் தகவலை சரிபார்க்கவும்",
    reviewSubtitle: "மருத்துவரிடம் சமர்ப்பிக்கும் முன் சரிபார்க்கவும்",
    confirmSubmit: "உறுதிசெய்து மருத்துவருக்கு அனுப்பவும்",
    editInfo: "தகவலைத் திருத்து",
    savedAuto: "தானாக சேமிக்கப்பட்டது",
    tapToSpeak: "மைக் தொட்டு பேசவும்",
    typeSymptom: "உங்கள் அறிகுறிகளை இங்கே தட்டச்சு செய்க...",
    commonSymptoms: "பொதுவான அறிகுறிகள் (தேர்வு செய்யவும்)",
    genders: {
      male: "ஆண்",
      female: "பெண்",
      other: "மற்றவை",
      preferNot: "கூற விரும்பவில்லை"
    },
    symptoms: {
      fever: "காய்ச்சல்",
      cough: "இருமல் & சளி",
      headache: "தலைவலி",
      stomachPain: "வயிற்று வலி",
      chestPain: "மார்பு வலி",
      kneePain: "முழங்கால் வலி",
      backPain: "முதுகு வலி",
      skinProblem: "தோல் அரிப்பு / தடிப்பு",
      vomiting: "வாந்தி / குமட்டல்",
      diarrhea: "வயிற்றுப்போக்கு",
      dizziness: "மயக்கம் / தலைச்சுற்றல்",
      breathingDiff: "சுவாசிப்பதில் சிரமம்"
    },
    durations: {
      yesterday: "நேற்றிலிருந்து",
      twoDays: "2 - 3 நாட்கள்",
      fiveDays: "5 நாட்கள்",
      oneWeek: "1 வாரம்",
      twoWeeks: "2 வாரங்கள்",
      oneMonth: "1 மாதத்திற்கும் மேலாக"
    }
  },

  kn: {
    titleGetToKnow: "ನಿಮ್ಮ ವಿವರಗಳನ್ನು ತಿಳಿಯೋಣ",
    subtitleGetToKnow: "ನಿಮ್ಮ ವೈದ್ಯಕೀಯ ದಾಖಲೆ ಸೃಷ್ಟಿಸಲು ವಿವರಗಳನ್ನು ನಮೂದಿಸಿ",
    fullNameLabel: "ನಿಮ್ಮ ಹೆಸರೇನು?",
    fullNamePlaceholder: "ಉದಾ: ರಾಹುಲ್ ಕುಮಾರ್",
    ageLabel: "ನಿಮ್ಮ ವಯಸ್ಸು ಎಷ್ಟು?",
    phoneLabel: "ನಿಮ್ಮ ದೂರವಾಣಿ ಸಂಖ್ಯೆ ಯಾವುದು?",
    genderLabel: "ನಿಮ್ಮ ಲಿಂಗವನ್ನು ಆಯ್ಕೆಮಾಡಿ",
    chooseLanguageTitle: "ನಿಮ್ಮ ಆದ್ಯತೆಯ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ",
    chooseLanguageSubtitle: "ವೈದ್ಯಕೀಯ ಪ್ರಶ್ನೆಗಳು ನಿಮ್ಮ ಭಾಷೆಯಲ್ಲಿ ಗೋಚರಿಸುತ್ತವೆ",
    whatBringsYouTitle: "ನಿಮಗೆ ಯಾವ ಆರೋಗ್ಯ ಸಮಸ್ಯೆ ಇದೆ?",
    whatBringsYouSubtitle: "ನಿಮ್ಮ ಸಮಸ್ಯೆಯನ್ನು ಧ್ವನಿ, ಟೈಪಿಂಗ್ ಅಥವಾ ಸ್ಪರ್ಶದ ಮೂಲಕ ತಿಳಿಸಿ",
    durationQuestion: "ಈ ಸಮಸ್ಯೆ ಎಷ್ಟು ದಿನಗಳಿಂದ ಇದೆ?",
    reviewTitle: "ನಿಮ್ಮ ಮಾಹಿತಿಯನ್ನು ಪರಿಶೀಲಿಸಿ",
    reviewSubtitle: "ವೈದ್ಯರಿಗೆ ಕಳುಹಿಸುವ ಮೊದಲು ವಿವರಗಳನ್ನು ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ",
    confirmSubmit: "ದೃಢೀಕರಿಸಿ ವೈದ್ಯರಿಗೆ ಕಳುಹಿಸಿ",
    editInfo: "ಮಾಹಿತಿ ತಿದ್ದುಪಡಿ",
    savedAuto: "ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಉಳಿಸಲಾಗಿದೆ",
    tapToSpeak: "ಮೈಕ್ ಒತ್ತಿ ಮಾತನಾಡಿ",
    typeSymptom: "ನಿಮ್ಮ ಸಮಸ್ಯೆಯನ್ನು ಇಲ್ಲಿ ಟೈಪ್ ಮಾಡಿ...",
    commonSymptoms: "ಸಾಮಾನ್ಯ ಲಕ್ಷಣಗಳು (ಆಯ್ಕೆ ಮಾಡಿ)",
    genders: {
      male: "ಪುರುಷ",
      female: "ಮಹಿಳೆ",
      other: "ಇತರ",
      preferNot: "ಹೇಳಲು ಇಷ್ಟವಿಲ್ಲ"
    },
    symptoms: {
      fever: "ಜ್ವರ / ತಾಪಮಾನ",
      cough: "ಕೆಮ್ಮು ಮತ್ತು ನೆಗಡಿ",
      headache: "ತಲೆನೋವು",
      stomachPain: "ಹೊಟ್ಟೆ ನೋವು",
      chestPain: "ಎದೆ ನೋವು",
      kneePain: "ಮೊಣಕಾಲು ನೋವು",
      backPain: "ಬೆನ್ನು ನೋವು",
      skinProblem: "ಚರ್ಮದ ತುರಿಕೆ",
      vomiting: "ವಾಂತಿ / ವಾಕರಿಕೆ",
      diarrhea: "ಭೇದಿ",
      dizziness: "ತಲೆಸುತ್ತು",
      breathingDiff: "ಉಸಿರಾಟದ ತೊಂದರೆ"
    },
    durations: {
      yesterday: "ನಿನ್ನೆಯಿಂದ",
      twoDays: "2 - 3 ದಿನಗಳು",
      fiveDays: "5 ದಿನಗಳು",
      oneWeek: "1 ವಾರ",
      twoWeeks: "2 ವಾರಗಳು",
      oneMonth: "1 ತಿಂಗಳು ಅಥವಾ ಹೆಚ್ಚು"
    }
  },

  ml: {
    titleGetToKnow: "നമുക്ക് നിങ്ങളെ അറിയാം",
    subtitleGetToKnow: "നിങ്ങളുടെ മെഡിക്കൽ റെക്കോർഡ് തയ്യാറാക്കാൻ വിവരങ്ങൾ നൽകുക",
    fullNameLabel: "നിങ്ങളുടെ പേര് എന്താണ്?",
    fullNamePlaceholder: "ഉദാ: രാഹുൽ കുമാർ",
    ageLabel: "നിങ്ങൾക്ക് എത്ര വയസ്സുണ്ട്?",
    phoneLabel: "നിങ്ങളുടെ ഫോൺ നമ്പർ എത്രയാണ്?",
    genderLabel: "ലിംഗം തിരഞ്ഞെടുക്കുക",
    chooseLanguageTitle: "നിങ്ങൾക്ക് അനുയോജ്യമായ ഭാഷ തിരഞ്ഞെടുക്കുക",
    chooseLanguageSubtitle: "ചോദ്യങ്ങൾ നിങ്ങളുടെ ഭാഷയിൽ ലഭ്യമാകും",
    whatBringsYouTitle: "നിങ്ങൾക്ക് എന്ത് ആരോഗ്യ പ്രശ്നമാണ് ഉള്ളത്?",
    whatBringsYouSubtitle: "വോയ്‌സ്, ടൈപ്പിംഗ് അല്ലെങ്കിൽ ടച്ച് വഴി പ്രശ്നം വ്യക്തമാക്കുക",
    durationQuestion: "ഇത് എത്ര ദിവസമായി ഉണ്ട്?",
    reviewTitle: "വിവരങ്ങൾ പരിശോധിക്കുക",
    reviewSubtitle: "ഡോക്ടർക്ക് സമർപ്പിക്കുന്നതിന് മുൻപ് പരിശോധിക്കുക",
    confirmSubmit: "സ്ഥിരീകരിച്ച് ഡോക്ടർക്ക് അയക്കുക",
    editInfo: "വിവരങ്ങൾ മാറ്റുക",
    savedAuto: "ഓട്ടോമാറ്റിക്കായി സേവ് ചെയ്തു",
    tapToSpeak: "മൈക്ക് അമർത്തി സംസാരിക്കുക",
    typeSymptom: "നിങ്ങളുടെ ലക്ഷണങ്ങൾ ഇവിടെ ടൈപ്പ് ചെയ്യുക...",
    commonSymptoms: "സാധാരണ ലക്ഷണങ്ങൾ",
    genders: {
      male: "പുരുഷൻ",
      female: "സ്ത്രീ",
      other: "മറ്റുള്ളവ",
      preferNot: "പറയാൻ താല്പര്യമില്ല"
    },
    symptoms: {
      fever: "പനി",
      cough: "ചുമയും ജലദോഷവും",
      headache: "തലവേദന",
      stomachPain: "വയറുവേദന",
      chestPain: "നെഞ്ചുവേദന",
      kneePain: "കാൽമുട്ട് വേദന",
      backPain: "നടുവേദന",
      skinProblem: "ചൊറിച്ചിൽ / തടിപ്പ്",
      vomiting: "ഛർദ്ദി / ഓക്കാനം",
      diarrhea: "വയറിളക്കം",
      dizziness: "തലകറക്കം",
      breathingDiff: "ശ്വാസതടസ്സം"
    },
    durations: {
      yesterday: "ഇന്നലെ മുതൽ",
      twoDays: "2 - 3 ദിവസമായി",
      fiveDays: "5 ദിവസമായി",
      oneWeek: "1 ആഴ്ചയായി",
      twoWeeks: "2 ആഴ്ചയായി",
      oneMonth: "1 മാസത്തിലധികമായി"
    }
  },

  mr: {
    titleGetToKnow: "आपली माहिती जाणून घेऊया",
    subtitleGetToKnow: "आपले वैद्यकीय रेकॉर्ड तयार करण्यासाठी कृपया माहिती भरा",
    fullNameLabel: "तुमचे नाव काय आहे?",
    fullNamePlaceholder: "उदा: राहुल कुमार",
    ageLabel: "तुमचे वय किती आहे?",
    phoneLabel: "तुमचा फोन नंबर काय आहे?",
    genderLabel: "आपले लिंग निवडा",
    chooseLanguageTitle: "आपली आवडती भाषा निवडा",
    chooseLanguageSubtitle: "वैद्यकीय प्रश्न आपल्या भाषेत उपलब्ध असतील",
    whatBringsYouTitle: "तुम्हाला काय आरोग्य समस्या आहे?",
    whatBringsYouSubtitle: "आपला त्रास आवाज, टायपिंग किंवा स्पर्शाने सांगा",
    durationQuestion: "ही समस्या किती दिवसांपासून आहे?",
    reviewTitle: "आपल्या माहितीचे पुनरावलोकन करा",
    reviewSubtitle: "डॉक्टरांकडे पाठवण्यापूर्वी माहिती तपासा",
    confirmSubmit: "पुष्टी करा आणि डॉक्टरांना पाठवा",
    editInfo: "माहिती बदला",
    savedAuto: "आपोआप सेव्ह झाले",
    tapToSpeak: "माईक दाबून बोला",
    typeSymptom: "आपला त्रास येथे टाईप करा...",
    commonSymptoms: "सामान्य लक्षणे (निवडा)",
    genders: {
      male: "पुरुष",
      female: "स्त्री",
      other: "इतर",
      preferNot: "सांगू इच्छित नाही"
    },
    symptoms: {
      fever: "ताप",
      cough: "खोकला आणि सर्दी",
      headache: "डोकेदुखी",
      stomachPain: "पोटदुखी",
      chestPain: "छातीत दुखणे",
      kneePain: "गुडघेदुखी",
      backPain: "पाठदुखी / कंबरदुखी",
      skinProblem: "त्वचेला खाज सुटणे",
      vomiting: "उलटी / मळमळ",
      diarrhea: "अतिसार",
      dizziness: "चक्कर येणे",
      breathingDiff: "श्वास घेण्यास त्रास"
    },
    durations: {
      yesterday: "कालपासून",
      twoDays: "2 - 3 दिवसांपासून",
      fiveDays: "5 दिवसांपासून",
      oneWeek: "1 आठवड्यापासून",
      twoWeeks: "2 आठवड्यांपासून",
      oneMonth: "1 महिना किंवा अधिक"
    }
  },

  bn: {
    titleGetToKnow: "আসুন আপনার সম্পর্কে জানি",
    subtitleGetToKnow: "আপনার মেডিকেল রেকর্ড তৈরি করতে বিবরণ লিখুন",
    fullNameLabel: "আপনার নাম কি?",
    fullNamePlaceholder: "যেমন: রাহুল কুমার",
    ageLabel: "আপনার বয়স কত?",
    phoneLabel: "আপনার ফোন নম্বর কত?",
    genderLabel: "আপনার লিঙ্গ নির্বাচন করুন",
    chooseLanguageTitle: "আপনার পছন্দের ভাষা নির্বাচন করুন",
    chooseLanguageSubtitle: "চিকিৎসা সংক্রান্ত সমস্ত প্রশ্ন আপনার ভাষায় হবে",
    whatBringsYouTitle: "আপনার কি স্বাস্থ্য সমস্যা আছে?",
    whatBringsYouSubtitle: "ভয়েস, টাইপ বা স্পর্শের মাধ্যমে আপনার সমস্যা জানান",
    durationQuestion: "এই সমস্যা কতদিন ধরে হচ্ছে?",
    reviewTitle: "আপনার তথ্য পর্যালোচনা করুন",
    reviewSubtitle: "ডাক্তারের কাছে পাঠানোর আগে তথ্য যাচাই করুন",
    confirmSubmit: "নিশ্চিত করুন এবং ডাক্তারকে পাঠান",
    editInfo: "তথ্য সম্পাদনা করুন",
    savedAuto: "স্বয়ংক্রিয়ভাবে সংরক্ষিত",
    tapToSpeak: "মাইক টিপে কথা বলুন",
    typeSymptom: "আপনার সমস্যা এখানে লিখুন...",
    commonSymptoms: "সাধারণ উপসর্গ (নির্বাচন করুন)",
    genders: {
      male: "পুরুষ",
      female: "মহিলা",
      other: "অন্যান্য",
      preferNot: "বলতে অনিচ্ছুক"
    },
    symptoms: {
      fever: "জ্বর",
      cough: "কাশি ও সর্দি",
      headache: "মাথাব্যথা",
      stomachPain: "পেটে ব্যথা",
      chestPain: "বুকে ব্যথা",
      kneePain: "হাঁটুতে ব্যথা",
      backPain: "পিঠে ব্যথা",
      skinProblem: "ত্বকে চুলকানি বা ফুসকুড়ি",
      vomiting: "বমি / বমি বমি ভাব",
      diarrhea: "পাতলা পায়খানা",
      dizziness: "মাথা ঘোরা",
      breathingDiff: "শ্বাসকষ্ট"
    },
    durations: {
      yesterday: "গতকাল থেকে",
      twoDays: "২ - ৩ দিন ধরে",
      fiveDays: "৫ দিন ধরে",
      oneWeek: "১ সপ্তাহ ধরে",
      twoWeeks: "২ সপ্তাহ ধরে",
      oneMonth: "১ মাস বা তার বেশি"
    }
  },

  ur: {
    titleGetToKnow: "آئیے آپ کے بارے میں جانیں",
    subtitleGetToKnow: "اپنا میڈیکل ریکارڈ بنانے کے لیے برائے مہربانی معلومات درج کریں",
    fullNameLabel: "آپ کا نام کیا ہے؟",
    fullNamePlaceholder: "مثلاً: راہول کمار",
    ageLabel: "آپ کی عمر کتنی ہے؟",
    phoneLabel: "آپ کا فون نمبر کیا ہے؟",
    genderLabel: "اپنی جنس منتخب کریں",
    chooseLanguageTitle: "اپنی پسندیدہ زبان منتخب کریں",
    chooseLanguageSubtitle: "تمام طبی سوالات آپ کی منتخب کردہ زبان میں ہوں گے",
    whatBringsYouTitle: "آپ کو کیا صحت کا مسئلہ ہے؟",
    whatBringsYouSubtitle: "اپنی تکلیف آواز، ٹائپنگ یا ٹچ کے ذریعے بتائیں",
    durationQuestion: "یہ مسئلہ کتنے دنوں سے ہے؟",
    reviewTitle: "اپنی معلومات کی تصدیق کریں",
    reviewSubtitle: "ڈاکٹر کو بھیجنے سے پہلے تفصیلات چیک کریں",
    confirmSubmit: "تصدیق کریں اور ڈاکٹر کو بھیجیں",
    editInfo: "معلومات درست کریں",
    savedAuto: "خودکار طور پر محفوظ",
    tapToSpeak: "مائیک دبا کر بولیں",
    typeSymptom: "اپنی تکلیف یہاں ٹائپ کریں...",
    commonSymptoms: "عام علامات (منتخب کریں)",
    genders: {
      male: "مرد",
      female: "عورت",
      other: "دیگر",
      preferNot: "بتانا پسند نہیں"
    },
    symptoms: {
      fever: "بخار / تیز درجہ حرارت",
      cough: "کھانسی اور زکام",
      headache: "سر درد",
      stomachPain: "پیٹ میں درد",
      chestPain: "سینے میں درد یا کھچاؤ",
      kneePain: "گھٹنوں میں درد",
      backPain: "کمر میں درد",
      skinProblem: "جلد پر خارش",
      vomiting: "الٹی یا متلی",
      diarrhea: "دست",
      dizziness: "چکر آنا",
      breathingDiff: "سانس لینے میں دشواری"
    },
    durations: {
      yesterday: "کل سے",
      twoDays: "2 - 3 دنوں سے",
      fiveDays: "5 دنوں سے",
      oneWeek: "1 ہفتے سے",
      twoWeeks: "2 ہفتوں سے",
      oneMonth: "1 ماہ یا اس سے زیادہ"
    }
  },

  gu: {
    titleGetToKnow: "ચાલો તમારા વિશે જાણીએ",
    subtitleGetToKnow: "તમારો તબીબી રેકોર્ડ બનાવવા માટે તમારી માહિતી દાખલ કરો",
    fullNameLabel: "તમારું પૂરું નામ શું છે?",
    fullNamePlaceholder: "ઉદાહરણ: રાહુલ કુમાર",
    ageLabel: "તમારી ઉંમર કેટલી છે?",
    phoneLabel: "તમારો ફોન નંબર શું છે?",
    genderLabel: "તમારું લિંગ પસંદ કરો",
    chooseLanguageTitle: "તમારી પસંદગીની ભાષા પસંદ કરો",
    chooseLanguageSubtitle: "બધા પ્રશ્નો તમારી પસંદ કરેલી ભાષામાં દેખાશે",
    whatBringsYouTitle: "આજે તમને કઈ તકલીફ છે?",
    whatBringsYouSubtitle: "તમારી તકલીફ અવાજ, લખાણ અથવા સ્પર્શથી જણાવો",
    durationQuestion: "આ તકલીફ કેટલા સમયથી છે?",
    reviewTitle: "તમારી માહિતી તપાસો",
    reviewSubtitle: "ડૉક્ટરને મોકલતા પહેલાં તમારી વિગતો ચકાસો",
    confirmSubmit: "ચકાસી ડૉક્ટરને મોકલો",
    editInfo: "માહિતી બદલો",
    savedAuto: "આપમેળે સાચવાયું",
    tapToSpeak: "માઇક દબાવીને બોલો",
    typeSymptom: "તમારી તકલીફ અહીં લખો...",
    commonSymptoms: "સામાન્ય લક્ષણો (પસંદ કરવા માટે દબાવો)",
    genders: {
      male: "પુરુષ",
      female: "સ્ત્રી",
      other: "અન્ય",
      preferNot: "કહેવું નથી"
    },
    symptoms: {
      fever: "તાવ / ગરમી",
      cough: "ઉધરસ અને શરદી",
      headache: "માથાનો દુખાવો",
      stomachPain: "પેટમાં દુખાવો",
      chestPain: "છાતીમાં દુખાવો",
      kneePain: "ઘૂંટણમાં દુખાવો",
      backPain: "કમર અથવા પીઠનો દુખાવો",
      skinProblem: "ચામડીમાં ખંજવાળ અથવા ફોલ્લીઓ",
      vomiting: "ઊલટી અથવા ઉબકા",
      diarrhea: "ઝાડા",
      dizziness: "ચક્કર",
      breathingDiff: "શ્વાસ લેવામાં તકલીફ"
    },
    durations: {
      yesterday: "ગઈકાલથી",
      twoDays: "2 - 3 દિવસથી",
      fiveDays: "5 દિવસથી",
      oneWeek: "1 અઠવાડિયાથી",
      twoWeeks: "2 અઠવાડિયાથી",
      oneMonth: "1 મહિનો અથવા વધુ"
    }
  }
};
