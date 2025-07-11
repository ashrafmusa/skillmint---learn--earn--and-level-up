import React from 'react';
import { useAppContext } from '../state/AppContext';
import { useAuth } from '../state/AuthContext';
import { useI18n } from '../i18n/context';
import { CoinIcon, CheckCircleIcon, UserCircleIcon, FlameIcon, ShieldCheckIcon } from './Icons';

const Profile: React.FC = () => {
    const { state } = useAppContext();
    const { user } = useAuth();
    const { t } = useI18n();
    const { userTokens, completedChallenges, level, xp, xpToNextLevel, allSkillTracks, unlockedProTracks, xpStreak } = state;

    const completedTracks = allSkillTracks.filter(track =>
        track.challenges.length > 0 && track.challenges.every(c => completedChallenges.has(c.id))
    );
    
    const xpPercentage = xpToNextLevel > 0 ? (xp / xpToNextLevel) * 100 : 0;

    return (
        <div className="container mx-auto px-4 py-8 animate-fade-in">
            <div className="max-w-4xl mx-auto">
                <div className="bg-base-200 rounded-lg shadow-xl p-8 mb-8 flex flex-col sm:flex-row items-center gap-6">
                    <UserCircleIcon className="w-24 h-24 text-brand-primary flex-shrink-0"/>
                    <div className="text-center sm:text-left flex-grow">
                        <h2 className="text-4xl font-bold text-white">{user?.name}</h2>
                        <div className="mt-4 flex flex-wrap justify-center sm:justify-start items-center gap-4">
                            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-base-300">
                               <span className="text-md font-medium text-base-content">{t('header.level')} {level}</span>
                            </div>
                            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-base-300">
                               <div className="flex items-center gap-2 text-yellow-400">
                                    <CoinIcon className="w-6 h-6" />
                                    <span className="text-xl font-bold text-white">{userTokens.toLocaleString()}</span>
                                </div>
                            </div>
                            {xpStreak > 0 && (
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-base-300 text-orange-400">
                                    <FlameIcon className="w-6 h-6" />
                                    <span className="text-xl font-bold text-white">{xpStreak}</span>
                                    <span className="text-md font-medium text-base-content">{t('profile.streak')}</span>
                                </div>
                            )}
                        </div>
                         <div className="mt-4">
                            <h4 className="text-sm font-bold text-base-content uppercase tracking-wider">{t('profile.level_progress')}</h4>
                            <div className="mt-2 w-full bg-base-300 rounded-full h-4">
                               <div className="h-full bg-brand-primary rounded-full transition-all duration-500 text-right" style={{ width: `${xpPercentage}%`}}>
                                   <span className="px-2 text-xs font-bold text-white">{xp} / {xpToNextLevel}</span>
                               </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="bg-base-200 rounded-lg shadow-xl p-8">
                        <h3 className="text-3xl font-bold text-white mb-6">{t('profile.achievements')}</h3>
                        {completedTracks.length > 0 ? (
                            <ul className="space-y-4">
                                {completedTracks.map(track => (
                                <li key={track.id} className="bg-base-300/50 rounded-lg p-4 flex items-center gap-4 animate-slide-in-up">
                                    <img src={track.icon} alt={`${track.title} icon`} className="w-12 h-12 rounded" />
                                    <p className="font-bold text-white text-lg flex-grow">{track.title}</p>
                                    <CheckCircleIcon className="w-10 h-10 text-brand-primary flex-shrink-0" />
                                </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-base-content text-center py-8 bg-base-100 rounded-lg">
                                Complete all challenges in a skill track to earn your first achievement!
                            </p>
                        )}
                    </div>
                     <div className="bg-base-200 rounded-lg shadow-xl p-8">
                        <h3 className="text-3xl font-bold text-white mb-6">{t('profile.unlocked_pro')}</h3>
                        {unlockedProTracks.size > 0 ? (
                            <ul className="space-y-4">
                                {Array.from(unlockedProTracks).map(trackId => {
                                    const track = allSkillTracks.find(t => t.id === trackId);
                                    if (!track) return null;
                                    return (
                                        <li key={track.id} className="bg-base-300/50 rounded-lg p-4 flex items-center gap-4 animate-slide-in-up">
                                            <img src={track.icon} alt={`${track.title} icon`} className="w-12 h-12 rounded" />
                                            <p className="font-bold text-white text-lg flex-grow">{track.title}</p>
                                            <ShieldCheckIcon className="w-10 h-10 text-yellow-400 flex-shrink-0" />
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : (
                            <p className="text-base-content text-center py-8 bg-base-100 rounded-lg">
                                Unlock Pro skill tracks by spending your tokens in the Skill Library.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;