
import React, { createContext, useState, useContext, useEffect, useMemo, useCallback } from 'react';
import { supportedLanguages, defaultLang, LanguageCode } from './config';

// A simple recursive key accessor
const getNestedTranslation = (language: any, key: string): string | undefined => {
    if (!language) return undefined;
    return key.split('.').reduce((obj, k) => (obj && obj[k] !== undefined) ? obj[k] : undefined, language);
};

interface I18nContextType {
    language: LanguageCode;
    changeLanguage: (lang: LanguageCode) => void;
    t: (key: string, replacements?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

// A self-contained loading component to prevent import issues and show a clean loading state.
const LoadingScreen: React.FC = () => (
    <div className="flex items-center justify-center min-h-screen bg-base-100">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 text-brand-primary animate-pulse-fast" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m1-9l4-4M19 5l-4 4m0 6l4 4m-4-4l-4 4" />
        </svg>
    </div>
);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<LanguageCode>(defaultLang);
    const [translations, setTranslations] = useState<Record<LanguageCode, any> | null>(null);

    useEffect(() => {
        const fetchAllTranslations = async () => {
            try {
                const responses = await Promise.all(
                    Object.keys(supportedLanguages).map(lang => fetch(`./i18n/locales/${lang}.json`))
                );
                if (responses.some(res => !res.ok)) {
                    throw new Error('Failed to fetch one or more translation files.');
                }
                const jsonData = await Promise.all(responses.map(res => res.json()));
                const allTranslationsData: Partial<Record<LanguageCode, any>> = {};
                Object.keys(supportedLanguages).forEach((lang, index) => {
                    allTranslationsData[lang as LanguageCode] = jsonData[index];
                });
                setTranslations(allTranslationsData as Record<LanguageCode, any>);
            } catch (error) {
                console.error("Error loading translations:", error);
                // In a production app, you might want to show a dedicated error screen
            }
        };
        fetchAllTranslations();
    }, []);

    useEffect(() => {
        if (translations) {
            const langConfig = supportedLanguages[language];
            document.documentElement.lang = language;
            document.documentElement.dir = langConfig.dir;
        }
    }, [language, translations]);

    const changeLanguage = (lang: LanguageCode) => {
        if (supportedLanguages[lang]) {
            setLanguage(lang);
        }
    };

    const t = useCallback((key: string, replacements?: Record<string, string | number>): string => {
        if (!translations) {
            return ''; // Return empty string while loading to prevent rendering broken keys
        }

        let translation = getNestedTranslation(translations[language], key);

        if (translation === undefined) {
             // Fallback to the default language (English) if a key is not found
            translation = getNestedTranslation(translations[defaultLang], key);
            if (translation === undefined) {
                console.warn(`Translation not found for key: ${key} in language '${language}' or default '${defaultLang}'.`);
                return key;
            }
        }

        if (replacements) {
            Object.keys(replacements).forEach(placeholder => {
                translation = translation!.replace(`{${placeholder}}`, String(replacements[placeholder]));
            });
        }
        
        return translation as string;
    }, [language, translations]);

    const value = useMemo(() => ({
        language,
        changeLanguage,
        t,
    }), [language, t, changeLanguage]);

    if (!translations) {
        return <LoadingScreen />;
    }

    return (
        <I18nContext.Provider value={value}>
            {children}
        </I18nContext.Provider>
    );
};

export const useI18n = (): I18nContextType => {
    const context = useContext(I18nContext);
    if (context === undefined) {
        throw new Error('useI18n must be used within an I18nProvider');
    }
    return context;
};
