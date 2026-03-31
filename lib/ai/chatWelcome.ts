// Server + shared default copy for Cosmic Chat empty state (admin can override via SystemConfig).

export const CHAT_INTRO_CONFIG_KEY = "CHAT_INTRO_MESSAGE" as const;

export const CHAT_INTRO_MAX_LENGTH = 800;

export const DEFAULT_CHAT_INTRO_MESSAGE =
  "Ask me anything about your chart — dashas, placements, timing, or what a transit means for you specifically.";

export const COSMIC_CHAT_STARTER_PROMPTS = [
  "What does my current Dasha period mean for me?",
  "What should I know about my Human Design type?",
  "What areas of life are highlighted for me right now?",
] as const;
