import React from 'react';
import { SkillTrack, ActionType } from '../types';
import { useI18n } from '../i18n/context';
import { useAppContext } from '../state/AppContext';
import { CoinIcon, LockClosedIcon } from './Icons';

interface SkillSelectorProps {
  skillTracks: SkillTrack[];
}

const SkillCard: React.FC<{ 
    skill: SkillTrack; 
    onSelect: (skill: SkillTrack) => void;
    isLocked: boolean;
}> = ({ skill, onSelect, isLocked }) => {
  const { t } = useI18n();
  const { state, dispatch } = useAppContext();
  const canAfford = skill.unlockCost ? state.userTokens >= skill.unlockCost : true;

  const handleUnlock = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (skill.isPro && isLocked && canAfford && skill.unlockCost) {
        dispatch({
            type: ActionType.UNLOCK_PRO_TRACK,
            payload: { trackId: skill.id, cost: skill.unlockCost }
        });
    }
  };
  
  const handleCardClick = () => {
      if (!isLocked) {
          onSelect(skill);
      }
  };

  return (
    <div 
      className={`bg-base-200 rounded-lg p-6 flex flex-col items-start gap-4 transition-all duration-300 relative overflow-hidden ${isLocked ? '' : 'hover:bg-base-300 hover:scale-105 transform cursor-pointer'}`}
      onClick={handleCardClick}
      role="button"
      tabIndex={isLocked ? -1 : 0}
      onKeyDown={(e) => e.key === 'Enter' && !isLocked && handleCardClick()}
    >
      {skill.isPro && (
          <div className="absolute top-0 right-0 bg-yellow-400 text-black px-3 py-1 text-xs font-bold rounded-bl-lg">
              {t('skillCard.pro')}
          </div>
      )}
      <div className="p-2 bg-brand-primary/20 rounded-lg">
        <img src={skill.icon} alt={`${skill.title} icon`} className="w-10 h-10 rounded" />
      </div>
      <h3 className="text-xl font-bold text-white">{skill.title}</h3>
      <p className="text-base-content flex-grow">{skill.description}</p>
      <span className="text-sm font-semibold text-brand-light">{t('skillSelector.challenges', { count: skill.challenges.length })}</span>
      {isLocked && skill.isPro && skill.unlockCost && (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center animate-fade-in p-4">
              <LockClosedIcon className="w-10 h-10 text-yellow-400 mb-2" />
              <button
                onClick={handleUnlock}
                disabled={!canAfford}
                className="w-full mt-2 bg-yellow-400 text-black font-bold py-2 px-4 rounded-md hover:bg-yellow-500 transition-colors flex items-center justify-center gap-2 disabled:bg-base-300 disabled:cursor-not-allowed"
              >
                  <CoinIcon className="w-5 h-5"/>
                  {t('skillCard.unlock', { cost: skill.unlockCost })}
              </button>
              {!canAfford && <p className="text-xs text-red-400 mt-2">{t('skillCard.insufficient')}</p>}
          </div>
      )}
    </div>
  );
};

const SkillSelector: React.FC<SkillSelectorProps> = ({ skillTracks }) => {
  const { t } = useI18n();
  const { state, dispatch } = useAppContext();
  const { unlockedProTracks } = state;

  const handleSelectSkill = (skill: SkillTrack) => {
    dispatch({ type: ActionType.SET_SELECTED_SKILL, payload: { skill } });
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-extrabold text-white">{t('skillLibrary.title')}</h2>
        <p className="mt-4 text-lg text-base-content max-w-2xl mx-auto">
          {t('skillLibrary.subtitle')}
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {skillTracks.map(skill => (
          <SkillCard 
            key={skill.id} 
            skill={skill} 
            onSelect={handleSelectSkill}
            isLocked={!!skill.isPro && !unlockedProTracks.has(skill.id)}
            />
        ))}
      </div>
    </div>
  );
};

export default SkillSelector;