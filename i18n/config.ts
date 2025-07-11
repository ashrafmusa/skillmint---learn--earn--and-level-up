
export const supportedLanguages = {
  en: { name: 'English', dir: 'ltr' },
  ar: { name: 'العربية', dir: 'rtl' },
  hi: { name: 'हिन्दी', dir: 'ltr' },
  ru: { name: 'Русский', dir: 'ltr' },
  ur: { name: 'اردو', dir: 'rtl' },
};

export type LanguageCode = keyof typeof supportedLanguages;

export const defaultLang: LanguageCode = 'en';
