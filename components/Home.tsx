import React, { useState, useEffect } from 'react';
import { useAppContext } from '../state/AppContext';
import { useAuth } from '../state/AuthContext';
import { useI18n } from '../i18n/context';
import { getHomeDashboardData, generateSkillTrack } from '../services/geminiService';
import { ActionType, DailyQuest, SkillTrack, CareerPath } from '../types';
import { AppRoute } from '../App';
import { CoinIcon, SparklesIcon, WandIcon, BriefcaseIcon } from './Icons';
import Leaderboard from './Leaderboard';

interface HomeProps {
    setRoute: (route: AppRoute) => void;
}

const DailyQuestCard: React.FC<{ quest: DailyQuest, allSkillTracks: SkillTrack[] }> = ({ quest, allSkillTracks }) => {
    const { t } = useI18n();
    const { dispatch } = useAppContext();

    const handleAttempt = () => {
        const skill = allSkillTracks.find((s: SkillTrack) => s.id === quest.skillTrackId);
        if (skill) {
            dispatch({ type: ActionType.SET_SELECTED_SKILL, payload: { skill } });
        }
    };

    return (
        <div className="bg-brand-primary/10 border-2 border-dashed border-brand-primary/50 p-6 rounded-lg animate-fade-in">
            <h3 className="text-xl font-bold text-brand-light mb-2">{quest.challenge.title}</h3>
            <p className="text-base-content mb-4">{t('home.fromSkill', { skill: quest.skillTrackTitle })}</p>
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-yellow-400">
                    <CoinIcon className="w-5 h-5" />
                    <span className="font-semibold">{t('challengeCard.tokens', { reward: quest.challenge.reward })}</span>
                </div>
                <button onClick={handleAttempt} className="bg-brand-primary text-white font-bold py-2 px-4 rounded-md hover:bg-brand-secondary transition-colors">
                    {t('challengeCard.attempt')}
                </button>
            </div>
        </div>
    );
};

const RecommendedSkillCard: React.FC<{ skill: SkillTrack, onSelect: () => void }> = ({ skill, onSelect }) => (
    <div onClick={onSelect} className="bg-base-200 p-4 rounded-lg flex items-center gap-4 hover:bg-base-300 transition-colors cursor-pointer">
        <img src={skill.icon} alt={skill.title} className="w-16 h-16 rounded-lg flex-shrink-0" />
        <div className="flex-grow">
            <h3 className="text-lg font-bold text-white">{skill.title}</h3>
            <p className="text-sm text-base-content line-clamp-2">{skill.description}</p>
        </div>
    </div>
);

const RecommendedCareerPathCard: React.FC<{ careerPath: CareerPath, setRoute: (route: AppRoute) => void }> = ({ careerPath, setRoute }) => {
    const { t } = useI18n();
    return (
        <div className="bg-base-300/50 p-6 rounded-lg animate-fade-in border-l-4 border-brand-secondary">
             <div className="flex items-start gap-4">
                <BriefcaseIcon className="w-8 h-8 text-brand-light flex-shrink-0 mt-1"/>
                <div>
                    <h3 className="text-xl font-bold text-white mb-2">{careerPath.title}</h3>
                    <p className="text-base-content mb-4">{careerPath.description}</p>
                </div>
            </div>
             <div className="text-right">
                <button onClick={() => setRoute('career')} className="bg-brand-secondary text-white font-bold py-2 px-4 rounded-md hover:bg-brand-primary transition-colors">
                    {t('home.startPath')}
                </button>
            </div>
        </div>
    );
};


const Home: React.FC<HomeProps> = ({ setRoute }) => {
    const { t } = useI18n();
    const { user } = useAuth();
    const { state, dispatch, careerPaths } = useAppContext();
    const { dailyQuest, recommendedSkill, recommendedCareerPath, allSkillTracks, completedChallenges } = state;
    const [topic, setTopic] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        const fetchDashboard = async () => {
            if (allSkillTracks.length > 0) {
                const data = await getHomeDashboardData(allSkillTracks, completedChallenges, careerPaths);
                dispatch({ type: ActionType.SET_HOME_DATA, payload: data });
            }
        };
        fetchDashboard();
    }, [allSkillTracks.length, completedChallenges, dispatch, careerPaths]);


    const handleGenerateSkill = async () => {
        if (!topic.trim()) return;
        setIsGenerating(true);
        const existingTitles = allSkillTracks.map(st => st.title);
        try {
            const newSkill = await generateSkillTrack(topic, existingTitles);
            if (newSkill) dispatch({ type: ActionType.ADD_SKILL_TRACK, payload: { skillTrack: newSkill } });
            setTopic('');
        } catch (error) {
            console.error("Failed to generate skill:", error);
        } finally {
            setIsGenerating(false);
        }
    };
    
    const handleSelectSkill = (skill: SkillTrack) => {
        dispatch({ type: ActionType.SET_SELECTED_SKILL, payload: { skill } });
    };

    return (
        <div className="container mx-auto px-4 py-8 animate-fade-in">
            <div className="text-left mb-12">
                <h2 className="text-4xl font-extrabold text-white">{t('home.title', { name: user?.name || 'Learner' })}</h2>
                <p className="mt-2 text-lg text-base-content">{t('home.subtitle')}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {dailyQuest && (
                        <div>
                            <h3 className="text-2xl font-bold text-white mb-4">{t('home.dailyQuest')}</h3>
                            <DailyQuestCard quest={dailyQuest} allSkillTracks={allSkillTracks} />
                        </div>
                    )}
                     {recommendedSkill && (
                        <div>
                            <h3 className="text-2xl font-bold text-white mb-4">{t('home.recommended')}</h3>
                            <RecommendedSkillCard skill={recommendedSkill} onSelect={() => handleSelectSkill(recommendedSkill)} />
                        </div>
                    )}
                    {recommendedCareerPath && (
                        <div>
                            <h3 className="text-2xl font-bold text-white mb-4">{t('home.recommendedCareer')}</h3>
                            <RecommendedCareerPathCard careerPath={recommendedCareerPath} setRoute={setRoute} />
                        </div>
                    )}
                </div>
                
                <div className="space-y-8">
                    <div className="bg-base-200 p-6 rounded-lg">
                        <h3 className="text-2xl font-bold text-white mb-2">{t('home.generateTitle')}</h3>
                        <p className="text-base-content mb-4">{t('home.generateSubtitle')}</p>
                        <div className="space-y-4">
                             <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} className="w-full bg-base-100 border border-base-300 rounded-md p-3 text-base-content focus:ring-2 focus:ring-brand-primary focus:outline-none transition" placeholder={t('home.generatePlaceholder')} disabled={isGenerating}/>
                            <button onClick={handleGenerateSkill} disabled={isGenerating || !topic.trim()} className="w-full bg-brand-primary text-white font-bold py-3 px-4 rounded-md hover:bg-brand-secondary transition-colors flex items-center justify-center gap-2 disabled:bg-base-300 disabled:cursor-not-allowed">
                                {isGenerating ? (<><SparklesIcon className="w-5 h-5 animate-pulse-fast" /> {t('home.generating')}</>) : (<><WandIcon className="w-5 h-5" /> {t('home.generateButton')}</>)}
                            </button>
                        </div>
                    </div>
                    <Leaderboard />
                </div>
            </div>
        </div>
    );
};

export default Home;