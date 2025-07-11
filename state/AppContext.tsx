import React, { createContext, useReducer, useContext, useEffect, ReactNode, useCallback, useState, useMemo } from 'react';
import { AppState, Actions, ActionType, SkillTrack, Reward, CareerPath } from '../types';
import { CheckCircleIcon, GiftIcon, XCircleIcon, SparklesIcon } from '../components/Icons';
import { useAuth } from './AuthContext';
import { useI18n } from '../i18n/context';
import { SKILL_TRACKS_CONFIG, REWARD_OPTIONS_CONFIG, CAREER_PATHS_CONFIG } from '../constants';

const LOCAL_STORAGE_KEY_PREFIX = 'skillmint_progress_';

const simpleHash = (s: string) => {
    let h = 0;
    for (let i = 0; i < s.length; i++) {
        h = Math.imul(31, h) + s.charCodeAt(i) | 0;
    }
    return h.toString();
};

const getXpForNextLevel = (level: number) => 100 + (level - 1) * 50;

const getTodayDateString = () => new Date().toISOString().split('T')[0];

type ToastType = 'success' | 'info' | 'error';
interface Toast {
    id: number;
    message: string;
    type: ToastType;
    icon: React.FC<{className?: string}>;
}

interface AppContextProps {
    state: AppState;
    dispatch: React.Dispatch<Actions>;
    isLoaded: boolean;
    rewardOptions: Reward[];
    careerPaths: CareerPath[];
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

const defaultInitialState: AppState = {
    userTokens: 100,
    selectedSkill: null,
    completedChallenges: new Set(),
    level: 1,
    xp: 0,
    xpToNextLevel: getXpForNextLevel(1),
    allSkillTracks: [],
    generatedSkillTracks: [],
    dailyQuest: null,
    recommendedSkill: null,
    recommendedCareerPath: null,
    xpStreak: 0,
    lastActivityDate: null,
    unlockedProTracks: new Set(),
};

let toastIdCounter = 0;

const getTranslatedData = (t: (key: string, replacements?: Record<string, string | number>) => string) => {
    const staticSkillTracks = SKILL_TRACKS_CONFIG.map(config => ({
      ...config,
      title: t(`skills.${config.id}.title`),
      description: t(`skills.${config.id}.description`),
      challenges: config.challenges.map(challengeConfig => ({
        ...challengeConfig,
        title: t(`challenges.${challengeConfig.id}.title`),
        description: t(`challenges.${challengeConfig.id}.description`)
      }))
    }));

    const careerPaths = CAREER_PATHS_CONFIG.map(config => ({
        ...config,
        title: t(`careers.${config.id}.title`),
        description: t(`careers.${config.id}.description`),
    }));
    
    return { staticSkillTracks, careerPaths };
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { t } = useI18n();
    const [toasts, setToasts] = useState<Toast[]>([]);
    
    const addToast = useCallback((message: string, type: ToastType) => {
        const id = toastIdCounter++;
        const iconMapping = { success: CheckCircleIcon, info: SparklesIcon, error: XCircleIcon };
        const icon = iconMapping[type] || SparklesIcon;
        setToasts(prev => [...prev, { id, message, type, icon }]);
        setTimeout(() => {
            setToasts(currentToasts => currentToasts.filter(toast => toast.id !== id));
        }, 5000);
    }, []);

    const appReducer = (state: AppState, action: Actions): AppState => {
        switch (action.type) {
            case ActionType.SET_SELECTED_SKILL:
                return { ...state, selectedSkill: action.payload.skill };
            case ActionType.GO_BACK_TO_SKILLS:
                return { ...state, selectedSkill: null };
            case ActionType.RESET_STATE:
                return { ...defaultInitialState, allSkillTracks: action.payload.staticSkillTracks };
            case ActionType.ADD_SKILL_TRACK: {
                const newTrack = action.payload.skillTrack;
                addToast(t('toasts.skill_generated', { title: newTrack.title }), 'success');
                return { 
                    ...state, 
                    allSkillTracks: [...state.allSkillTracks, newTrack],
                    generatedSkillTracks: [...state.generatedSkillTracks, newTrack] 
                };
            }
            case ActionType.SET_HOME_DATA: {
                return {
                    ...state,
                    dailyQuest: action.payload.dailyQuest,
                    recommendedSkill: action.payload.recommendedSkill,
                    recommendedCareerPath: action.payload.recommendedCareerPath,
                };
            }
             case ActionType.UNLOCK_PRO_TRACK: {
                const { trackId, cost } = action.payload;
                if (state.userTokens < cost || state.unlockedProTracks.has(trackId)) {
                    return state;
                }
                const track = state.allSkillTracks.find(t => t.id === trackId);
                if (track) {
                   addToast(t('toasts.pro_unlocked', {title: track.title}), 'success');
                }
                return {
                    ...state,
                    userTokens: state.userTokens - cost,
                    unlockedProTracks: new Set(state.unlockedProTracks).add(trackId)
                };
            }
            case ActionType.COMPLETE_CHALLENGE: {
                if (state.completedChallenges.has(action.payload.challengeId)) return state;
                addToast(t('toasts.challenge_complete', {reward: action.payload.reward}), 'success');
                const today = getTodayDateString();
                const yesterday = new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0];
                
                let newStreak = state.xpStreak;
                if (state.lastActivityDate === yesterday) {
                    newStreak++;
                    addToast(t('toasts.streak_increment', {count: newStreak}), 'info');
                } else if (state.lastActivityDate !== today) {
                    newStreak = 1;
                    if(state.lastActivityDate !== null) addToast(t('toasts.streak_reset'), 'info');
                }

                const newCompletedChallenges = new Set(state.completedChallenges).add(action.payload.challengeId);
                const newTokens = state.userTokens + action.payload.reward;
                let newXp = state.xp + action.payload.reward; // 1 token = 1 XP
                let newLevel = state.level;
                let newXpToNextLevel = state.xpToNextLevel;

                while (newXp >= newXpToNextLevel) {
                    newLevel++;
                    newXp -= newXpToNextLevel;
                    newXpToNextLevel = getXpForNextLevel(newLevel);
                    addToast(t('toasts.level_up', {level: newLevel}), 'info');
                }

                return {
                    ...state,
                    userTokens: newTokens,
                    completedChallenges: newCompletedChallenges,
                    level: newLevel,
                    xp: newXp,
                    xpToNextLevel: newXpToNextLevel,
                    xpStreak: newStreak,
                    lastActivityDate: today,
                };
            }
            case ActionType.REDEEM_REWARD: {
                 if(state.userTokens < action.payload.cost) return state;
                 addToast(t('toasts.reward_redeemed', {rewardName: action.payload.title}), 'success');
                 return { ...state, userTokens: state.userTokens - action.payload.cost };
            }
            case ActionType.LOAD_STATE:
                return {
                    ...defaultInitialState,
                    ...action.payload.state,
                    allSkillTracks: action.payload.allSkillTracks,
                    selectedSkill: null, // Always reset on load
                };
            default:
                return state;
        }
    };
    
    const [state, dispatch] = useReducer(appReducer, defaultInitialState);
    const [isLoaded, setIsLoaded] = useState(false);
    const { user: currentUser } = useAuth();
    
    const { staticSkillTracks, careerPaths } = useMemo(() => getTranslatedData(t), [t]);
    
    const rewardOptions = useMemo(() => REWARD_OPTIONS_CONFIG.map(r => ({ ...r, title: t(`rewards.${r.id}`) || r.title })), [t]);

    const loadState = useCallback(() => {
        if (!currentUser) {
            dispatch({ type: ActionType.RESET_STATE, payload: { staticSkillTracks } });
            setIsLoaded(true);
            return;
        }
        try {
            const serializedState = localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + currentUser.id);
            if (serializedState === null) {
                dispatch({ type: ActionType.RESET_STATE, payload: { staticSkillTracks } });
                return;
            }
            const { data, hash } = JSON.parse(serializedState);
            if (hash !== simpleHash(JSON.stringify(data))) {
                console.warn("State integrity check failed. Resetting state.");
                dispatch({ type: ActionType.RESET_STATE, payload: { staticSkillTracks } });
                return;
            }
            
            const savedGeneratedTracks = data.generatedSkillTracks || [];

            dispatch({
                type: ActionType.LOAD_STATE,
                payload: {
                    state: {
                        ...data,
                        completedChallenges: new Set(data.completedChallenges || []),
                        unlockedProTracks: new Set(data.unlockedProTracks || []),
                        generatedSkillTracks: savedGeneratedTracks,
                    },
                    allSkillTracks: [...staticSkillTracks, ...savedGeneratedTracks]
                }
            });
        } catch (error) {
            console.error("Could not load state from localStorage", error);
            dispatch({ type: ActionType.RESET_STATE, payload: { staticSkillTracks } });
        } finally {
            setIsLoaded(true);
        }
    }, [currentUser, staticSkillTracks]);

    useEffect(() => {
        loadState();
    }, [loadState]);

    useEffect(() => {
        if (!isLoaded || !currentUser) return;
        try {
            const dataToSave = {
                userTokens: state.userTokens,
                completedChallenges: Array.from(state.completedChallenges),
                level: state.level,
                xp: state.xp,
                xpToNextLevel: state.xpToNextLevel,
                generatedSkillTracks: state.generatedSkillTracks,
                xpStreak: state.xpStreak,
                lastActivityDate: state.lastActivityDate,
                unlockedProTracks: Array.from(state.unlockedProTracks),
            };
            const hash = simpleHash(JSON.stringify(dataToSave));
            const serializedState = JSON.stringify({ data: dataToSave, hash });
            localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + currentUser.id, serializedState);
        } catch (error) {
            console.error("Could not save state to localStorage", error);
        }
    }, [state, isLoaded, currentUser]);
    
    const contextValue = useMemo(() => ({ state, dispatch, isLoaded, rewardOptions, careerPaths }), [state, dispatch, isLoaded, rewardOptions, careerPaths]);

    return (
        <AppContext.Provider value={contextValue}>
            {isLoaded ? (
                <>
                    {children}
                     <div className="fixed bottom-4 right-4 z-50 w-full max-w-xs space-y-3">
                        {toasts.map((toast) => (
                           <div key={toast.id} className={`bg-base-300 shadow-lg rounded-lg p-4 flex items-center gap-4 animate-slide-in-up border-l-4 ${toast.type === 'success' ? 'border-brand-primary' : 'border-yellow-400'}`}>
                                <toast.icon className={`w-8 h-8 flex-shrink-0 ${toast.type === 'success' ? 'text-brand-primary' : 'text-yellow-400'}`} />
                                <p className="text-white font-semibold flex-grow">{toast.message}</p>
                                <button onClick={() => setToasts(current => current.filter(t => t.id !== toast.id))} className="p-1 rounded-full hover:bg-base-100">
                                    <XCircleIcon className="w-5 h-5 text-base-content"/>
                                </button>
                           </div>
                        ))}
                    </div>
                </>
            ) : <div className="flex items-center justify-center min-h-screen bg-base-100"><SparklesIcon className="w-16 h-16 text-brand-primary animate-pulse-fast" /></div>}
        </AppContext.Provider>
    );
};

export const useAppContext = (): AppContextProps => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};