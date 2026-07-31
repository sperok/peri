export interface Phrase {
  id: string
  text: string
}

export function toId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

const RAW_PHRASES: string[] = [
  // Greetings / social
  'hello',
  'hi there',
  "how are you",
  "i'm doing well, thanks",
  "nice to meet you",
  'see you later',
  'good morning',
  'good night',
  'goodbye',

  // Needs
  "i need a break",
  "i'm hungry",
  "i'm thirsty",
  "i'm tired",
  "i need help",
  "can you help me with something",
  "i need to use the bathroom",
  "i'm cold",
  "i'm hot",
  "i'm in pain",

  // Responses
  'yes',
  'no',
  'maybe',
  'thank you',
  "you're welcome",
  "i agree",
  "i disagree",
  "that sounds great",
  "i don't understand",
  "can you repeat that",
  "i'm not sure",
  'sorry, what was that',

  // Questions
  'what time is it',
  'where are we going',
  'can we go home',
  'what are we doing today',
  'can i have some water',
  'is everything okay',

  // Feelings
  "i'm happy",
  "i'm sad",
  "i'm frustrated",
  "i'm excited",
  "i love you",
  "i'm proud of you",

  // Conversation flow
  "let's go",
  "one moment please",
  "hold on",
  "i changed my mind",
  "never mind",
  "that's funny",
  "i'm sorry",
  'excuse me',
]

export const PHRASE_BANK: Phrase[] = RAW_PHRASES.map((text) => ({
  id: toId(text),
  text,
}))
