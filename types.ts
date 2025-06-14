

import { Chat } from '@google/genai'; // Updated import
import React from 'react'; // Added for React.DetailedHTMLProps

export enum Model {
  GEMINI = 'Gemini (gemini-2.5-flash-preview-05-20)', // Updated model identifier
  DEEPSEEK = 'Deepseek (deepseek-chat)', 
  GPT4O = 'ChatGPT (gpt-4.1)', // Changed display name and underlying model
  GPT4O_MINI = 'ChatGPT (gpt-4.1-mini)', // Updated to gpt-4.1-mini
  CLAUDE = 'Claude (Mock)',
  GEMINI_ADVANCED = 'Gemini Advanced (gemini-1.5-pro-latest)',
  IMAGEN3 = 'Imagen3 (imagen-3.0-generate-002)',
  OPENAI_TTS = 'OpenAI (TTS)', // New TTS Model
  REAL_TIME_TRANSLATION = 'Real-Time Translation (Gemini)', // New Real-Time Translation Model
  AI_AGENT = 'AI Agent (gemini-2.5-flash-preview-04-17)', // Renamed from AI_TASK_ORCHESTRATOR and updated model ID
  PRIVATE = 'Private (Local Data Storage)', // New Private Mode
  FLUX_KONTEX = 'Flux Kontext Image Edit (fal-ai/flux-pro/kontext)', 
  FLUX_KONTEX_MAX_MULTI = 'Flux Kontext Max Multi-Image (fal-ai/flux-pro/kontext/max/multi)',
  FLUX_ULTRA = 'Flux1.1 [Ultra] (fal-ai/flux-pro/v1.1-ultra)', // Renamed from FLUX_DEV_IMAGE_GEN
  KLING_VIDEO = 'Kling AI Video Gen (fal-ai/kling-video/v2.1/standard/image-to-video)', // New Kling AI Video Model - Updated path
}

export interface ChatMessage {
  id: string;
  text: string; // For user prompts or AI text responses
  sender: 'user' | 'ai';
  timestamp: number; // Added to store the time of message creation
  model?: Model;
  imagePreview?: string; // For user messages with a single image (upload) - (e.g. Gemini, GPT-4, Kling)
  imagePreviews?: string[]; // For AI generated/edited images OR for multi-image user uploads (Flux Max)
  imageMimeType?: 'image/jpeg' | 'image/png'; // For AI generated images (single)
  imageMimeTypes?: string[]; // For multi-image user uploads (Flux Max), corresponds to imagePreviews
  originalPrompt?: string; // For AI generated/edited images/videos, to store the original user prompt
  fileName?: string; // For user messages with files
  fileContent?: string; // For storing text file content
  groundingSources?: GroundingSource[];
  isImageQuery?: boolean; // To flag user messages that are image generation/editing prompts
  isRegenerating?: boolean; // Flag for AI messages that are being regenerated
  // Stores the ID of the user message that led to this AI response, crucial for regeneration
  promptedByMessageId?: string; 
  audioUrl?: string; // For AI messages with synthesized audio
  // Fields for AI Agent (previously Task Orchestrator)
  isTaskGoal?: boolean; // Flags if this user message defines a main task goal for the AI Agent
  isTaskPlan?: boolean; // Flags if this AI message contains a task plan/response from the AI Agent
  // Fields for Private Mode
  videoFile?: File; // Transient: actual File object for current session for video
  videoFileName?: string; // Persisted: name of the video
  videoMimeType?: string; // Persisted: mime type of the video
  isNote?: boolean; // For private mode text-only entries
  // Field for Fal.ai polling (Flux Kontex, Flux Ultra, Kling)
  fluxRequestId?: string; // Stores the request ID for polling Fal.ai results (generic name for Fal)
  klingVideoRequestId?: string; // Stores the request ID for Kling video generation polling
  fluxModelId?: string; // Stores the Fal model ID used for this request
  isVideoQuery?: boolean; // To flag user messages that are video generation prompts (e.g., Kling)
  videoUrl?: string; // For AI messages with generated video URL
  // videoMimeType for ChatMessage is already defined above for private mode, can be reused for Kling.
}

export interface GroundingSource {
  uri: string;
  title: string;
}

export interface ModelSettings {
  temperature: number;
  topK: number; 
  topP: number;
  systemInstruction: string;
}

export interface ImagenSettings {
  numberOfImages: number; // 1 to 4
  outputMimeType: 'image/jpeg' | 'image/png';
  aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4' | string; // Allow common presets or custom strings
}

export type OpenAiTtsVoice = 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';

export interface OpenAITtsSettings {
  voice: OpenAiTtsVoice;
  speed: number; // 0.25 to 4.0
  modelIdentifier: 'tts-1' | 'tts-1-hd'; // Model for TTS
}

export interface RealTimeTranslationSettings {
  targetLanguage: string; // language code e.g. 'vi', 'en'
}

// Settings for AI Agent (previously Task Orchestrator)
export interface AiAgentSettings extends ModelSettings {}

// Placeholder for Private mode settings, likely none needed.
export interface PrivateModeSettings extends Pick<ModelSettings, 'systemInstruction'> { // Only systemInstruction is relevant from ModelSettings for display
    // Private mode doesn't use temperature, topK, topP for generation
}

// Updated FluxKontexAspectRatio to match Fal.ai permitted values and include 'default'
export type FluxKontexAspectRatio = 'default' | '1:1' | '16:9' | '9:16' | '4:3' | '3:2' | '2:3' | '3:4' | '9:21' | '21:9';


export interface FluxKontexSettings {
  guidance_scale: number; 
  safety_tolerance?: number; 
  num_inference_steps?: number; 
  seed?: number | null; 
  num_images?: number; 
  aspect_ratio?: FluxKontexAspectRatio; // Type updated
  output_format?: 'jpeg' | 'png'; 
  // image_urls field is handled by the proxy when using Fal.ai JS client; client sends base64
}

// Aspect ratio options for Flux Ultra Image Gen (replaces FluxUltraImageSize)
// Adding 'default' here for type compatibility with FluxKontexAspectRatio in shared settings structures,
// but the actual API call for Flux Ultra will handle 'default' by mapping it to its real default (e.g., '16:9') or omitting it.
export type FluxUltraAspectRatio = 'default' | '21:9' | '16:9' | '4:3' | '3:2' | '1:1' | '2:3' | '3:4' | '9:16' | '9:21';

export interface FluxUltraSettings { // Renamed from FluxDevSettings
  aspect_ratio?: FluxUltraAspectRatio; // Replaced image_size
  num_inference_steps?: number;
  seed?: number | null;
  guidance_scale?: number;
  num_images?: number; // 1 to 4
  enable_safety_checker?: boolean;
  // Note: output_format is not explicitly listed as input for fal-ai/flux-pro/v1.1-ultra, but Fal.ai SDK defaults to jpeg
  output_format?: 'jpeg' | 'png'; // Added output_format for consistency, proxy might use this
}

// Kling AI Video Generation Settings
export type KlingAiDuration = "5" | "10";
export type KlingAiAspectRatio = "16:9" | "9:16" | "1:1";

export interface KlingAiSettings {
  // prompt and image_url are main inputs, not part of these configurable settings for the UI panel
  duration: KlingAiDuration;
  aspect_ratio: KlingAiAspectRatio;
  negative_prompt?: string; // Default: "blur, distort, and low quality"
  cfg_scale?: number; // Default: 0.5
}

export type ModelSpecificSettingsMap = {
  [Model.GEMINI]: ModelSettings;
  [Model.GEMINI_ADVANCED]: ModelSettings;
  [Model.GPT4O]: ModelSettings;
  [Model.GPT4O_MINI]: ModelSettings;
  [Model.DEEPSEEK]: ModelSettings;
  [Model.CLAUDE]: ModelSettings;
  [Model.IMAGEN3]: ImagenSettings;
  [Model.OPENAI_TTS]: OpenAITtsSettings;
  [Model.REAL_TIME_TRANSLATION]: RealTimeTranslationSettings;
  [Model.AI_AGENT]: AiAgentSettings;
  [Model.PRIVATE]: PrivateModeSettings;
  [Model.FLUX_KONTEX]: FluxKontexSettings;
  [Model.FLUX_KONTEX_MAX_MULTI]: FluxKontexSettings;
  [Model.FLUX_ULTRA]: FluxUltraSettings;
  [Model.KLING_VIDEO]: KlingAiSettings;
};

// Explicit union of all possible model-specific settings objects
export type AnyModelSettings = 
  | ModelSettings
  | ImagenSettings
  | OpenAITtsSettings
  | RealTimeTranslationSettings
  | AiAgentSettings
  | PrivateModeSettings
  | FluxKontexSettings
  | FluxUltraSettings
  | KlingAiSettings;


export type AllModelSettings = {
  [K in Model]?: ModelSpecificSettingsMap[K];
};


export interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export interface Part {
  text?: string;
  inlineData?: {
    mimeType:string;
    data: string;
  };
}

export interface GeminiChatState {
  chat?: Chat; 
  currentModel: string; 
  currentSystemInstruction?: string;
  currentTemperature?: number;
  currentTopK?: number;
  currentTopP?: number;
  currentEnableWebSearch?: boolean; // Added to track web search state for chat re-initialization
}

export interface ApiKeyStatus {
  isSet: boolean;
  envVarName: string; 
  modelName: string; 
  isMock: boolean;
  isGeminiPlatform: boolean; // True if the model runs on Google's Gemini platform (AI Studio API Key)
  isImageGeneration?: boolean; // Flag for image generation models (like Imagen3)
  isTextToSpeech?: boolean; // Flag for TTS models
  isRealTimeTranslation?: boolean; // Flag for real-time translation model
  isAiAgent?: boolean; // Flag for AI Agent model (renamed from isTaskOrchestrator)
  isPrivateMode?: boolean; // Flag for Private (Local Data Storage) mode
  isImageEditing?: boolean; // Flag for image editing models like Flux Kontex (single image)
  isMultiImageEditing?: boolean; // Flag for multi-image editing models like Flux Kontext Max
  isFluxUltraImageGeneration?: boolean; // Renamed from isFluxDevImageGeneration
  isKlingVideoGeneration?: boolean; // Flag for Kling AI video generation
}

export interface Persona {
  id: string;
  name: string;
  instruction: string;
}

export interface SettingsPanelProps {
  selectedModel: Model;
  onModelChange: (model: Model) => void;
  modelSettings: AnyModelSettings; // Changed from ModelSpecificSettingsMap[Model]
  onModelSettingsChange: (settings: Partial<AnyModelSettings>) => void; // Changed from Partial<ModelSpecificSettingsMap[Model]>
  isWebSearchEnabled: boolean;
  onWebSearchToggle: (enabled: boolean) => void;
  disabled: boolean;
  apiKeyStatuses: Record<Model, ApiKeyStatus>;
  personas: Persona[];
  activePersonaId: string | null;
  onPersonaChange: (personaId: string | null) => void;
  onPersonaSave: (persona: Persona) => void;
  onPersonaDelete: (personaId: string) => void;
  userSession: UserSessionState;
}


export interface HistoryPanelProps {
  savedSessions: ChatSession[];
  activeSessionId: string | null;
  onLoadSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onRenameSession: (sessionId: string, newName: string) => void;
  onSaveCurrentChat: () => void;
  onStartNewChat: () => void;
  isLoading: boolean;
  onTogglePinSession: (sessionId: string) => void;
  onSaveChatToDevice: () => void;
  onLoadChatFromDevice: (file: File) => void;
  onExportChatWithMediaData: () => void;
}

export interface ChatSession {
  id: string;
  name: string;
  timestamp: number;
  model: Model;
  messages: ChatMessage[];
  // Store a snapshot of the specific settings for the model used in this session
  modelSettingsSnapshot: AnyModelSettings; // Changed from ModelSpecificSettingsMap[Model]
  isPinned: boolean;
  activePersonaIdSnapshot: string | null; // Save active persona with the session
}

export interface ApiChatMessage {
  role: 'user' | 'assistant' | 'system' | 'function' | 'tool';
  content: string | Array<{ type: 'text'; text: string } | { type: 'image_url'; image_url: { url: string; detail?: "auto" | "low" | "high" } }>;
  name?: string; // Optional: For function/tool calls
  tool_calls?: any[]; // For tool usage
  tool_call_id?: string; // For tool responses
}

export interface ApiStreamChunk {
  textDelta?: string;
  isFinished?: boolean;
  error?: string;
  // Potentially add other fields if the API stream sends more structured data
}

export interface GeneralApiSendMessageParams {
  modelIdentifier: string; 
  history: ApiChatMessage[];
  modelSettings: ModelSettings;
  userSession: UserSessionState; // Added userSession
  // apiKey?: string; // API Key will be handled by the proxy
}

export interface NotificationMessage {
  id: string;
  message: string;
  type: NotificationType;
  timestamp: number;
  read: boolean;
  details?: string; 
}

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface NotificationContextType {
  notifications: NotificationMessage[];
  unreadCount: number;
  addNotification: (message: string, type: NotificationType, details?: string) => void;
  markAllAsRead: () => void;
  clearAllNotifications: () => void;
}

export interface AccountSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChatBackgroundChange: (newUrl: string | null) => void;
  currentChatBackground: string | null;
  userProfile: UserGlobalProfile | null; 
  onUpdateUserProfile: (updatedProfile: UserGlobalProfile) => void;
  currentUserCredits: number;
  onPurchaseCredits: (packageId: string, paymentMethod: 'paypal' | 'stripe' | 'vietqr') => void;
  paypalEmail: string | undefined;
  onSavePayPalEmail: (email: string) => void;
}

export type AccountTabType = 'profile' | 'credits' | 'devices' | 'background' | 'avatar' | 'payment';


// Language Learning Types
export type LanguageOption = 'en' | 'ja' | 'ko' | 'zh' | 'vi'; // Add more as needed
export type LanguageLearningActivityType = 'listening' | 'speaking' | 'vocabulary' | 'quiz' | 'sentence-scramble' | 'handwriting';


export interface LanguageOptionConfig {
  code: LanguageOption;
  name: string;
  flag: string;
}

export interface TranslationLanguageOptionConfig {
  code: string; 
  name: string;
  flag: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string; 
  expThreshold: number;
}

export interface UserLanguageProfile {
  exp: number;
  earnedBadgeIds: string[];
}

export interface UserGlobalProfile {
  languageProfiles: {
    [key in LanguageOption]?: UserLanguageProfile;
  };
  aboutMe?: string;
  credits: number; 
  paypalEmail?: string; 
  favoriteLanguage?: LanguageOption | "";
}

export interface LanguageLearningModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserGlobalProfile | null;
  userSession: UserSessionState; // Added userSession
  onUpdateProfile: (profile: UserGlobalProfile) => void;
  onAddExp: (language: LanguageOption, expPoints: number) => void;
}

export interface LearningContent {
    id: string;
    activityType: LanguageLearningActivityType;
    language: LanguageOption;
    script?: string; // For listening
    question?: string; // For listening, quiz
    options?: string[]; // For listening, quiz
    correctAnswerIndex?: number; // For listening, quiz
    phraseToSpeak?: string; // For speaking
    vocabularySet?: VocabularyItem[]; // For vocabulary
    originalSentence?: string; // For sentence scramble
    scrambledWords?: { word: string, id: number }[]; // For sentence scramble
    targetText?: string; // For handwriting
    instruction?: string; // General instruction if needed
}

export interface VocabularyItem {
    word: string;
    meaning: string;
    exampleSentence: string;
}

export interface LearningActivityState {
    isLoadingContent: boolean;
    content: LearningContent | null;
    error: string | null;
    userAnswer: string | number | null; // string for speaking/scramble, number for quiz/listening index
    userSelectedWordIds?: number[]; // For sentence scramble, stores IDs of selected words
    isAnswerSubmitted: boolean;
    isAnswerCorrect: boolean | null;
    audioUrl?: string; // For listening/speaking feedback
    isAudioPlaying?: boolean; // For listening/speaking feedback
    translatedUserSpeech?: string; // For speaking practice with translation
    isLoadingTranslation?: boolean; // For speaking practice with translation
    userHandwritingImage?: string; // base64 data URL for handwriting
    accuracyScore?: number; // For handwriting
    aiFeedback?: string; // For handwriting or speaking
    handwritingInputMethod?: 'draw' | 'upload'; // For handwriting
}

// Games Modal Types
export interface GamesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayWebGame: (gameType: WebGameType, gameTitle: string) => void;
}

export type WebGameType = 'tic-tac-toe' | 'sliding-puzzle' | 'flappy-bird' | 'tien-len' | '8-ball-pool' | null;

export interface WebGamePlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameType: WebGameType;
  gameTitle: string;
}

// Tien Len Game Types
export enum CardSuit {
  SPADES = '♠',   // Bích
  CLUBS = '♣',    // Chuồn (Tép)
  DIAMONDS = '♦', // Rô
  HEARTS = '♥'    // Cơ
}

export enum CardRank { // Using English for ranks internally
  THREE = '3', FOUR = '4', FIVE = '5', SIX = '6', SEVEN = '7',
  EIGHT = '8', NINE = '9', TEN = '10', JACK = 'J', QUEEN = 'Q',
  KING = 'K', ACE = 'A', TWO = '2'
}

export interface TienLenCard {
  id: string; // e.g., "HEARTSA" or "SPADES2"
  rank: CardRank;
  suit: CardSuit;
  value: number; // Numerical value for comparison (3=0, 2=12)
  isSelected: boolean;
}

export type PlayerHand = TienLenCard[];

export interface TienLenGameState {
  playerHand: PlayerHand;
  aiHand: PlayerHand;
  table: TienLenCard[]; // Cards currently visible on the table from the last play
  lastPlayedHand: ValidatedHand | null; // Structured info of the hand to beat
  currentPlayer: 'player' | 'ai';
  turnHistory: TurnHistoryEntry[];
  winner: 'player' | 'ai' | null;
  isDealing: boolean;
  statusMessage: string;
  playerScore: number;
  aiScore: number;
  turnTimer: number;
  isPaused: boolean;
  firstPlayerOfTheGame: 'player' | 'ai' | null; // Who has the 3 of Spades
  isFirstTurnOfGame: boolean;
}

export interface TurnHistoryEntry {
  player: 'player' | 'ai';
  playedCards: ValidatedHand | null; // The combination played
  passed: boolean;
}

export enum TienLenHandType {
  SINGLE = 'Single',
  PAIR = 'Pair',
  TRIPLE = 'Triple',
  STRAIGHT = 'Straight', // Sảnh
  FOUR_OF_A_KIND = 'Four of a Kind', // Tứ Quý
  THREE_PAIR_STRAIGHT = 'Three Pair Straight', // Ba Đôi Thông
  // FOUR_PAIR_STRAIGHT = 'Four Pair Straight', // Tứ Đôi Thông (optional, powerful)
  INVALID = 'Invalid',
}

export interface ValidatedHand {
  type: TienLenHandType;
  cards: TienLenCard[];
  rankValue: number; // Highest rank value (e.g., for pair of K, value of K) or lowest for Ba Đôi Thông
  suitValue?: number; // For singles, to break ties
  length?: number; // For straights
}

export interface TienLenGameModalProps {
  isOpen: boolean;
  onClose: () => void;
}


export interface LoginDeviceLog {
  id: string;
  device: string;
  timestamp: number;
}

export interface CreditPackage {
  id: string;
  name: string;
  description: string;
  price: number; // e.g., 5.00
  currency: 'USD' | 'VND'; // Example currencies
  creditsAwarded: number;
}

// --- User Session State ---
export interface DemoUserLimits {
  // These will represent MONTHLY limits for named DEMO users
  fluxKontextMaxMonthlyUsesLeft: number;
  fluxKontextMaxMonthlyMaxUses: number;
  fluxKontextProMonthlyUsesLeft: number;
  fluxKontextProMonthlyMaxUses: number;
  imagen3MonthlyImagesLeft: number;
  imagen3MonthlyMaxImages: number;
  openaiTtsMonthlyCharsLeft: number;
  openaiTtsMonthlyMaxChars: number;
  fluxUltraMonthlyImagesLeft: number; 
  fluxUltraMonthlyMaxImages: number;
  klingVideoMonthlyUsed?: number; // Used videos this month
  klingVideoMonthlyMaxUses?: number; // Max videos allowed this month (likely 0 for demo)
}

export interface PaidUserLimits {
  imagen3ImagesLeft: number; 
  imagen3MaxImages: number;
  openaiTtsCharsLeft: number; 
  openaiTtsMaxChars: number;
  fluxKontextMaxMonthlyUsesLeft: number;
  fluxKontextMaxMonthlyMaxUses: number; // Updated from 40 to 25
  fluxKontextProMonthlyUsesLeft: number;
  fluxKontextProMonthlyMaxUses: number; // Updated from 50 to 35
  fluxUltraMonthlyImagesLeft: number; 
  fluxUltraMonthlyMaxImages: number;  // Updated from 100 to 30
  klingVideoMonthlyUsed?: number; // Videos used this month by paid user
  klingVideoMonthlyMaxGenerations?: number; // Max videos allowed this month for paid user
}

export interface UserSessionState {
  isDemoUser: boolean;
  demoUsername?: string; // Username for the specific DEMO account
  demoUserToken: string | null; // Token issued by the server for this DEMO user
  demoLimits: DemoUserLimits | null; // Specific limits for this DEMO user

  isPaidUser: boolean;
  paidUsername?: string;
  paidUserToken?: string | null; 
  paidSubscriptionEndDate?: string | null; 
  paidLimits: PaidUserLimits | null;
}

// This response type will likely be from /api/auth/verify-code when a DEMO user logs in
export interface DemoUserLoginResponse {
    success: boolean;
    message?: string;
    isDemoUser: true; // Key identifier
    username: string; // The specific DEMO username
    demoUserToken: string; // Token for this session
    limits: DemoUserLimits; // Their specific, potentially monthly, limits
}

export interface AdminLoginResponse {
    success: boolean;
    message?: string;
    isAdmin: true;
}

export interface PaidLoginResponse {
    success: boolean;
    message?: string;
    isPaidUser: true;
    username: string;
    paidUserToken?: string; 
    subscriptionEndDate?: string; 
    limits: PaidUserLimits;
}

// UserType on the server will determine which of these responses (or similar) is sent from /api/auth/verify-code
export type LoginResponseType = DemoUserLoginResponse | AdminLoginResponse | PaidLoginResponse;


// For Flux Kontext Proxy Service
export interface SingleImageData {
  image_base_64: string;
  image_mime_type: 'image/jpeg' | 'image/png';
}

export interface MultiImageData {
  images_data: Array<{ base64: string; mimeType: string }>;
}

export interface EditImageWithFluxKontexParams {
  modelIdentifier: string; // e.g., 'fal-ai/flux-pro/kontext' or 'fal-ai/flux-pro/kontext/max/multi'
  prompt: string;
  settings: FluxKontexSettings;
  imageData: SingleImageData | MultiImageData; 
  userSession: UserSessionState;
  requestHeaders?: HeadersInit; // Added for ChatPage to pass auth headers
}

// For Flux Ultra Image Generation Proxy Service
export interface GenerateImageWithFluxUltraParams {
  modelIdentifier: string; // Should be 'fal-ai/flux-pro/v1.1-ultra'
  prompt: string;
  settings: FluxUltraSettings;
  userSession: UserSessionState;
  requestHeaders?: HeadersInit; // Added for ChatPage to pass auth headers
}

// For Kling AI Video Generation Proxy Service
export interface GenerateVideoWithKlingParams {
  modelIdentifier: string; // e.g., 'fal-ai/kling-video/v2.1/standard/image-to-video'
  prompt: string;
  settings: KlingAiSettings;
  imageData: SingleImageData; // Kling takes one image_url (base64)
  userSession: UserSessionState;
  requestHeaders?: HeadersInit;
}


export interface HandwritingCanvasProps {
  width: number;
  height: number;
  penColor?: string;
  penThickness?: number;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  disabled?: boolean;
}

export interface BackgroundOption {
  id: string;
  name: string;
  imageUrl: string;
  thumbnailUrl: string;
}

export interface MockUser {
  name: string;
  email?: string;
}

export interface HeaderProps {
  currentUser: MockUser | null;
  onLogin: (code: string) => void;
  onLogout: () => void;
  openLoginModalInitially?: boolean;
  onLoginModalOpened?: () => void;
  onToggleLanguageLearningModal: () => void;
  onToggleGamesModal: () => void;
  onToggleVoiceAgentWidget: () => void;
  chatBackgroundUrl: string | null;
  onChatBackgroundChange: (newUrl: string | null) => void;
  userProfile: UserGlobalProfile | null;
  onUpdateUserProfile: (updatedProfile: UserGlobalProfile) => void;
  currentUserCredits: number;
  onPurchaseCredits: (packageId: string, paymentMethod: 'paypal' | 'stripe' | 'vietqr') => void;
  paypalEmail: string | undefined;
  onSavePayPalEmail: (email: string) => void;
  onToggleNewsModal: () => void; // Added new prop
}


// Function to get actual model ID (especially for models with display names)
export const getActualModelIdentifier = (model: Model): string => {
  const match = model.match(/\(([^)]+)\)$/);
  return match ? match[1] : model;
};

// Fal.ai Proxy Service Response Types
export interface FalSubmitProxyResponse {
  requestId?: string;
  message?: string;
  error?: string;
}

export interface FalStatusProxyResponse {
  status?: 'COMPLETED' | 'IN_PROGRESS' | 'IN_QUEUE' | 'ERROR' | 'COMPLETED_NO_IMAGE' | 'NOT_FOUND' | 'PROXY_REQUEST_ERROR' | 'NETWORK_ERROR' | string;
  imageUrl?: string; 
  imageUrls?: string[];
  videoUrl?: string; 
  error?: string;
  message?: string; 
  rawResult?: any; 
}
