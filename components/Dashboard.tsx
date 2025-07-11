import React, { useState } from 'react';
import { Challenge, ActionType, SkillTrack } from '../types';
import ChallengeCard from './ChallengeCard';
import ChallengeModal from './ChallengeModal';
import AiCoach from './AiCoach';
import Leaderboard from './Leaderboard';
import Certificate from './Certificate';
import { ArrowLeftIcon, CheckCircleIcon, CertificateIcon, BrainIcon } from './Icons';
import { useI18n } from '../i18n/context';
import { useAppContext } from '../state/AppContext';
import { useAuth } from '../state/AuthContext';

const AllChallengesCompleted: React.FC = () => {
    const { t } = useI18n();
    const { dispatch } = useAppContext();

    return (
        <div className="bg-brand-primary/10 border-2 border-dashed border-brand-primary/50 text-center p-8 rounded-lg animate-fade-in">
            <CheckCircleIcon className="w-16 h-16 text-brand-primary mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">{t('dashboard.allCompletedTitle')}</h3>
            <p className="text-brand-light mb-6">{t('dashboard.allCompletedSubtitle')}</p>
            <button
                onClick={() => dispatch({ type: ActionType.GO_BACK_TO_SKILLS })}
                className="bg-brand-primary text-white font-bold py-2 px-6 rounded-md hover:bg-brand-secondary transition-colors"
            >
                {t('dashboard.exploreSkills')}
            </button>
        </div>
    );
};

type Tab = 'challenges' | 'leaderboard' | 'certificate' | 'coach';

const TabButton: React.FC<{ isActive: boolean, onClick: () => void, children: React.ReactNode, isDisabled?: boolean }> = 
({ isActive, onClick, children, isDisabled }) => (
    <button 
        onClick={onClick}
        disabled={isDisabled}
        className={`px-4 py-2 font-semibold rounded-t-lg border-b-2 transition-colors ${
            isActive 
                ? 'text-brand-primary border-brand-primary' 
                : 'text-base-content border-transparent hover:text-white hover:border-base-300'
        } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
        {children}
    </button>
);


const Dashboard: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { user } = useAuth();
  const { selectedSkill, completedChallenges } = state;
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('challenges');
  const { t } = useI18n();

  if (!selectedSkill) return null; 

  const handleAttemptChallenge = (challenge: Challenge) => {
    setActiveChallenge(challenge);
  };

  const handleCloseModal = () => setActiveChallenge(null);
  
  const handleBack = () => dispatch({ type: ActionType.GO_BACK_TO_SKILLS });

  const allChallengesDone = selectedSkill.challenges.every(c => completedChallenges.has(c.id));

  const renderTabContent = () => {
      switch(activeTab) {
          case 'challenges':
              return allChallengesDone ? (
                <AllChallengesCompleted />
              ) : (
                <div className="space-y-4">
                  {selectedSkill.challenges.map(challenge => (
                    <ChallengeCard
                      key={challenge.id}
                      challenge={challenge}
                      onAttempt={() => handleAttemptChallenge(challenge)}
                      isCompleted={completedChallenges.has(challenge.id)}
                    />
                  ))}
                </div>
              );
          case 'leaderboard':
              return <Leaderboard />;
          case 'coach':
              return <AiCoach skillTitle={selectedSkill.title} />;
          case 'certificate':
              return allChallengesDone && user ? <Certificate skill={selectedSkill} user={user} /> : null;
          default:
              return null;
      }
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
       <button onClick={handleBack} className="flex items-center gap-2 mb-6 text-brand-light hover:text-white transition">
        <ArrowLeftIcon className="w-5 h-5" />
        {t('dashboard.backToLibrary')}
      </button>

      <div className="text-left mb-10">
        <div className="flex items-start gap-4">
            <img src={selectedSkill.icon} alt={selectedSkill.title} className="w-20 h-20 rounded-lg flex-shrink-0" />
            <div>
                <h2 className="text-4xl font-extrabold text-white">{selectedSkill.title}</h2>
                <p className="mt-2 text-lg text-base-content">{selectedSkill.description}</p>
            </div>
        </div>
      </div>
      
      <div className="border-b border-base-300 mb-8">
        <nav className="-mb-px flex space-x-6">
            <TabButton isActive={activeTab === 'challenges'} onClick={() => setActiveTab('challenges')}>
                {t('dashboard.tabs.challenges')}
            </TabButton>
             <TabButton isActive={activeTab === 'leaderboard'} onClick={() => setActiveTab('leaderboard')}>
                {t('dashboard.tabs.leaderboard')}
            </TabButton>
             <TabButton isActive={activeTab === 'coach'} onClick={() => setActiveTab('coach')}>
                <BrainIcon className="w-5 h-5 inline-block mr-2" />
                {t('dashboard.tabs.coach')}
            </TabButton>
            <TabButton 
                isActive={activeTab === 'certificate'} 
                onClick={() => setActiveTab('certificate')}
                isDisabled={!allChallengesDone}
            >
                <CertificateIcon className="w-5 h-5 inline-block mr-2" />
                {t('dashboard.tabs.certificate')}
            </TabButton>
        </nav>
      </div>

      <div className="animate-fade-in">
          {renderTabContent()}
      </div>

      {activeChallenge && (
        <ChallengeModal
          challenge={activeChallenge}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default Dashboard;