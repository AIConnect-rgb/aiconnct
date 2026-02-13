import { Injectable, signal, computed } from '@angular/core';

export type SupportedLanguage = 'en' | 'te';

const translations: Record<SupportedLanguage, Record<string, string>> = {
  en: {
    // Main Component
    home: 'Home',
    settings: 'Settings',
    logout: 'Logout',
    whatsHappening: "What's Happening",
    errorFailedToPost: 'Failed to post:',
    newToAIConnect: 'New to AI Connect?',
    signupToJoin: 'Sign up to join the conversation and share your ideas.',
    welcomeBack: 'Welcome Back',
    // Post Form
    postPlaceholder: "What's on your mind?",
    postButton: 'Post',
    postingButton: 'Posting...',
    continuousDialogueTooltip: 'Continuous AI Dialogue',
    spellCheckTooltip: 'Check spelling and grammar',
    signInToPost: 'Sign in to post',
    // Post Component
    aiAnalysis: 'AI Analysis',
    innovation: 'Innovation',
    sentiment: 'Sentiment',
    potentialIP: 'Potential IP',
    aiChat: 'AI Chat',
    toggleChat: 'Toggle AI Chat',
    replyToAI: 'Reply to AI...',
    signInToReply: 'Sign in to reply',
    sharePostTooltip: 'Share Post',
    copiedTooltip: 'Copied!',
    replyToMessageTooltip: 'Reply to this message',
    replyingToAI: 'Replying to AI',
    chatError: 'Sorry, I encountered an error. Please try again.',
    // Auth
    tagline: 'Your Ideas, Amplified.',
    signupGoogle: 'Sign up with Google',
    signinGoogle: 'Sign in with Google',
    createAccount: 'Create account',
    or: 'OR',
    signInToYourAccount: 'Sign in to your account',
    createYourAccount: 'Create your account',
    emailPlaceholder: 'Email address',
    passwordPlaceholder: 'Password',
    signinButton: 'Sign In',
    signupButton: 'Sign Up',
    haveAnAccount: 'Have an account already?',
    dontHaveAccount: "Don't have an account?",
    invalidCredentialsError: 'Invalid credentials. Please try again.',
     // Settings Page
    profileSettings: 'Profile Settings',
    displayName: 'Display Name',
    handle: 'Handle',
    accessibility: 'Accessibility',
    fontSize: 'Font Size',
    saveChanges: 'Save Changes',
    savedStatus: 'Saved!',
    // Error Messages
    dismissError: 'Dismiss',
    apiErrorTitle: 'API Configuration Issue',
    apiErrorMessage: 'There seems to be a problem with the AI service configuration. Our team has been notified. Please try again in a few moments.',
    safetyErrorTitle: 'Content Moderation',
    safetyErrorMessage: 'Your post could not be processed due to safety filters. Please review your text and try submitting again with different wording.',
    connectionErrorTitle: 'Connection Error',
    connectionErrorMessage: "We couldn't reach the AI service. Please check your internet connection and try again.",
    emptyResponseErrorTitle: 'Empty AI Response',
    emptyResponseErrorMessage: 'The AI returned an empty response, which can sometimes happen. Please try rephrasing your post or try again later.',
    formatErrorTitle: 'Invalid AI Response',
    formatErrorMessage: 'The AI response was not in the expected format. This is usually a temporary issue. Please try posting again.',
    unexpectedErrorTitle: 'An Unexpected Error Occurred',
    unexpectedErrorMessage: 'Something went wrong while processing your request. Please try again later.',
    // New keys for full i18n
    you: 'You',
    userHandle: '@user',
    aiEnthusiast: 'AI Enthusiast',
    aiDevHandle: '@ai_dev',
    samplePostText: 'I think your new electric vehicle lineup is a game-changer, but the charging infrastructure in rural areas is a major bottleneck. Why not partner with local businesses to install solar-powered charging stations? This would create a green energy ecosystem and make EVs viable for everyone, everywhere.',
    samplePostSummary: 'Suggests partnering with local businesses to create a solar-powered charging network in rural areas to address infrastructure gaps for EVs.',
    samplePostResponse: "Thank you for this insightful suggestion. It's a powerful idea. To help us explore this further, could you share your thoughts on what the primary incentive might be for local businesses to participate in such a partnership?",
    trendingTopic1: '#AIRevolution',
    trendingTopic2: '#AngularSignals',
    trendingTopic3: '#Gemini',
  },
  te: {
    // Main Component
    home: 'హోమ్',
    settings: 'సెట్టింగ్‌లు',
    logout: 'లాగ్ అవుట్',
    whatsHappening: 'ఏమి జరుగుతోంది',
    errorFailedToPost: 'పోస్ట్ చేయడంలో విఫలమైంది:',
    newToAIConnect: 'AI కనెక్ట్‌కు కొత్తా?',
    signupToJoin: 'సంభాషణలో చేరడానికి మరియు మీ ఆలోచనలను పంచుకోవడానికి సైన్ అప్ చేయండి.',
    welcomeBack: ' తిరిగి స్వాగతం',
    // Post Form
    postPlaceholder: 'మీ മനസ്സில் ఏముంది?',
    postButton: 'పోస్ట్ చేయండి',
    postingButton: 'పోస్ట్ చేస్తోంది...',
    continuousDialogueTooltip: 'నిరంతర AI సంభాషణ',
    spellCheckTooltip: 'స్పెల్లింగ్ మరియు వ్యాకరణాన్ని తనిఖీ చేయండి',
    signInToPost: 'పోస్ట్ చేయడానికి సైన్ ఇన్ చేయండి',
    // Post Component
    aiAnalysis: 'AI విశ్లేషణ',
    innovation: 'ఆవిష్కరణ',
    sentiment: 'సెంటిమెంట్',
    potentialIP: 'సంభావ్య IP',
    aiChat: 'AI చాట్',
    toggleChat: 'AI చాట్‌ను టోగుల్ చేయండి',
    replyToAI: 'AIకి ప్రత్యుత్తరం ఇవ్వండి...',
    signInToReply: 'ప్రత్యుత్తరం ఇవ్వడానికి సైన్ ఇన్ చేయండి',
    sharePostTooltip: 'పోస్ట్‌ను షేర్ చేయండి',
    copiedTooltip: 'కాపీ చేయబడింది!',
    replyToMessageTooltip: 'ఈ సందేశానికి ప్రత్యుత్తరం ఇవ్వండి',
    replyingToAI: 'AIకి ప్రత్యుత్తరం ఇస్తున్నారు',
    chatError: 'క్షమించండి, నేను ఒక లోపాన్ని ఎదుర్కొన్నాను. దయచేసి మళ్లీ ప్రయత్నించండి.',
    // Auth
    tagline: 'మీ ఆలోచనలు, విస్తరించబడినవి.',
    signupGoogle: 'Googleతో సైన్ అప్ చేయండి',
    signinGoogle: 'Googleతో సైన్ ఇన్ చేయండి',
    createAccount: 'ఖాతాను సృష్టించండి',
    or: 'లేదా',
    signInToYourAccount: 'మీ ఖాతాలోకి సైన్ ఇన్ చేయండి',
    createYourAccount: 'మీ ఖాతాను సృష్టించండి',
    emailPlaceholder: 'ఈమెయిలు చిరునామా',
    passwordPlaceholder: 'పాస్వర్డ్',
    signinButton: 'సైన్ ఇన్ చేయండి',
    signupButton: 'నమోదు చేసుకోండి',
    haveAnAccount: 'ఇప్పటికే ఖాతా ఉందా?',
    dontHaveAccount: 'ఖాతా లేదా?',
    invalidCredentialsError: 'చెల్లని ఆధారాలు. దయచేసి మళ్లీ ప్రయత్నించండి.',
    // Settings Page
    profileSettings: 'ప్రొఫైల్ సెట్టింగ్‌లు',
    displayName: 'ప్రదర్శన పేరు',
    handle: 'హ్యాండిల్',
    accessibility: 'యాక్సెసిబిలిటీ',
    fontSize: 'ఫాంట్ పరిమాణం',
    saveChanges: 'మార్పులను భద్రపరచు',
    savedStatus: 'సేవ్ చేయబడింది!',
    // Error Messages
    dismissError: 'తొలగించు',
    apiErrorTitle: 'API కాన్ఫిగరేషన్ సమస్య',
    apiErrorMessage: 'AI సేవా కాన్ఫిగరేషన్‌లో సమస్య ఉన్నట్లుంది. మా బృందానికి తెలియజేయబడింది. దయచేసి కొద్దిసేపటి తర్వాత మళ్లీ ప్రయత్నించండి.',
    safetyErrorTitle: 'కంటెంట్ మోడరేషన్',
    safetyErrorMessage: 'భద్రతా ఫిల్టర్‌ల కారణంగా మీ పోస్ట్ ప్రాసెస్ చేయబడలేదు. దయచేసి మీ వచనాన్ని సమీక్షించి, వేరే పదజాలంతో మళ్లీ సమర్పించడానికి ప్రయత్నించండి.',
    connectionErrorTitle: 'కనెక్షన్ లోపం',
    connectionErrorMessage: 'మేము AI సేవను చేరుకోలేకపోయాము. దయచేసి మీ ఇంటర్నెట్ కనెక్షన్‌ని తనిఖీ చేసి, మళ్లీ ప్రయత్నించండి.',
    emptyResponseErrorTitle: 'ఖాళీ AI ప్రతిస్పందన',
    emptyResponseErrorMessage: 'AI ఖాళీ ప్రతిస్పందనను తిరిగి ఇచ్చింది, ఇది కొన్నిసార్లు జరగవచ్చు. దయచేసి మీ పోస్ట్‌ను తిరిగి వ్రాయడానికి ప్రయత్నించండి లేదా తర్వాత మళ్లీ ప్రయత్నించండి.',
    formatErrorTitle: 'చెల్లని AI ప్రతిస్పందన',
    formatErrorMessage: 'AI ప్రతిస్పందన ఆశించిన ఫార్మాట్‌లో లేదు. ఇది సాధారణంగా తాత్కాలిక సమస్య. దయచేసి మళ్లీ పోస్ట్ చేయడానికి ప్రయత్నించండి.',
    unexpectedErrorTitle: 'ఒక ఊహించని లోపం సంభవించింది',
    unexpectedErrorMessage: 'మీ అభ్యర్థనను ప్రాసెస్ చేస్తున్నప్పుడు ఏదో తప్పు జరిగింది. దయచేసి తర్వాత మళ్లీ ప్రయత్నించండి.',
    // New keys for full i18n
    you: 'మీరు',
    userHandle: '@వాడుకరి',
    aiEnthusiast: 'AI ఉత్సాహి',
    aiDevHandle: '@ai_dev',
    samplePostText: 'మీ కొత్త ఎలక్ట్రిక్ వాహనాల శ్రేణి ఒక గేమ్-ఛేంజర్ అని నేను భావిస్తున్నాను, కానీ గ్రామీణ ప్రాంతాల్లో ఛార్జింగ్ మౌలిక సదుపాయాలు ఒక పెద్ద అడ్డంకిగా ఉన్నాయి. సౌరశక్తితో నడిచే ఛార్జింగ్ స్టేషన్లను ఏర్పాటు చేయడానికి స్థానిక వ్యాపారాలతో ఎందుకు భాగస్వామ్యం చేసుకోకూడదు? ఇది ఒక హరిత శక్తి పర్యావరణ వ్యవస్థను సృష్టిస్తుంది మరియు EVలను అందరికీ, ప్రతిచోటా అందుబాటులోకి తెస్తుంది.',
    samplePostSummary: 'EVల కోసం మౌలిక సదుపాయాల అంతరాలను పరిష్కరించడానికి గ్రామీణ ప్రాంతాల్లో సౌరశక్తితో నడిచే ఛార్జింగ్ నెట్‌వర్క్‌ను సృష్టించడానికి స్థానిక వ్యాపారాలతో భాగస్వామ్యం చేసుకోవాలని సూచిస్తుంది.',
    // FIX: Removed trailing single quotes from the following keys which caused syntax errors.
    samplePostResponse: 'ఈ లోతైన సూచనకు ధన్యవాదాలు. ఇది ఒక శక్తివంతమైన ఆలోచన. దీన్ని మరింత అన్వేషించడంలో మాకు సహాయపడటానికి, అటువంటి భాగస్వామ్యంలో పాల్గొనడానికి స్థానిక వ్యాపారాలకు ప్రాథమిక ప్రోత్సాహం ఏమిటో మీ ఆలోచనలను పంచుకోగలరా?',
    trendingTopic1: '#AIవిప్లవం',
    trendingTopic2: '#యాంగ్యులర్సిగ్నల్స్',
    trendingTopic3: '#జెమిని',
  }
};

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  currentLang = signal<SupportedLanguage>('en');

  private currentTranslations = computed(() => translations[this.currentLang()]);

  setLanguage(lang: SupportedLanguage) {
    this.currentLang.set(lang);
  }

  translate(key: string): string {
    return this.currentTranslations()[key] || key;
  }
}