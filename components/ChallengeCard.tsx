
import React from 'react';
import { Challenge } from '../types';
import { CheckCircleIcon, CoinIcon } from './Icons';
import { useI18n } from '../i18n/context';

interface ChallengeCardProps {
  challenge: Challenge;
  onAttempt: () => void;
  isCompleted: boolean;
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({ challenge, onAttempt, isCompleted }) => {
  const { t } = useI18n();
  return (
    <div className={`bg-base-200 rounded-lg p-5 transition-all duration-300 flex justify-between items-center ${isCompleted ? 'opacity-50' : 'hover:bg-base-300'}`}>
      <div className="flex-grow pe-4">
        <h3 className="text-lg font-bold text-white">{challenge.title}</h3>
        <div className="flex items-center gap-2 mt-2 text-yellow-400">
          <CoinIcon className="w-5 h-5" />
          <span className="font-semibold">{t('challengeCard.tokens', { reward: challenge.reward })}</span>
        </div>
      </div>
      {isCompleted ? (
        <div className="flex items-center gap-2 text-brand-primary flex-shrink-0">
          <CheckCircleIcon className="w-6 h-6" />
          <span className="font-semibold">{t('challengeCard.completed')}</span>
        </div>
      ) : (
        <button
          onClick={onAttempt}
          className="bg-brand-primary text-white font-bold py-2 px-4 rounded-md hover:bg-brand-secondary transition-colors flex-shrink-0"
        >
          {t('challengeCard.attempt')}
        </button>
      )}
    </div>
  );
};

export default ChallengeCard;
