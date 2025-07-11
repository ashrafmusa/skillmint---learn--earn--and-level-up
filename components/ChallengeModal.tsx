import React, { useState } from 'react';
import { Challenge, EvaluationResult, ActionType, ChallengeType } from '../types';
import { evaluateChallenge } from '../services/geminiService';
import { CheckCircleIcon, XCircleIcon, SparklesIcon } from './Icons';
import { useI18n } from '../i18n/context';
import { useAppContext } from '../state/AppContext';

interface ChallengeModalProps {
  challenge: Challenge;
  onClose: () => void;
}

const SubmissionView: React.FC<{
    challenge: Challenge;
    onSubmit: (result: EvaluationResult) => void;
}> = ({ challenge, onSubmit }) => {
    const [submission, setSubmission] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { t } = useI18n();

    const handleSubmit = async () => {
        if (!submission.trim()) return;
        setIsLoading(true);
        const evaluationResult = await evaluateChallenge(challenge, submission);
        onSubmit(evaluationResult);
        setIsLoading(false);
    };

    return (
        <div className="space-y-4">
             <label htmlFor="submission" className="block text-sm font-medium text-brand-light mb-2">{t('challengeModal.solutionLabel')}</label>
              <textarea
                id="submission"
                rows={10}
                className="w-full bg-base-100 border border-base-300 rounded-md p-3 text-base-content focus:ring-2 focus:ring-brand-primary focus:outline-none transition"
                placeholder={t('challengeModal.solutionPlaceholder')}
                value={submission}
                onChange={(e) => setSubmission(e.target.value)}
                disabled={isLoading}
              />
              <div className="flex justify-end">
                 <button
                    onClick={handleSubmit}
                    className="px-6 py-2 bg-brand-primary text-white font-semibold rounded-md hover:bg-brand-secondary transition flex items-center gap-2 disabled:bg-base-300 disabled:cursor-not-allowed"
                    disabled={isLoading || !submission.trim()}
                    >
                    {isLoading ? (
                        <>
                        <SparklesIcon className="w-5 h-5 animate-pulse-fast" />
                        {t('challengeModal.submitting')}
                        </>
                    ) : t('challengeModal.submit')}
                </button>
              </div>
        </div>
    );
};

const QuizView: React.FC<{
    challenge: Challenge;
    onSubmit: (result: EvaluationResult) => void;
}> = ({ challenge, onSubmit }) => {
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const { t } = useI18n();
    const shuffledOptions = React.useMemo(() => challenge.quizOptions?.sort(() => Math.random() - 0.5), [challenge.quizOptions]);

    const handleSubmit = () => {
        if (!selectedOption || !challenge.quizOptions) return;
        const passed = selectedOption === challenge.quizOptions[0]; // First option is always correct
        const feedback = passed ? t('challengeModal.quiz.correct') : t('challengeModal.quiz.incorrect');
        onSubmit({ passed, feedback });
    };

    return (
        <div className="space-y-4">
            <div className="space-y-3">
                {shuffledOptions?.map((option, index) => (
                    <button
                        key={index}
                        onClick={() => setSelectedOption(option)}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${selectedOption === option ? 'bg-brand-primary/20 border-brand-primary' : 'bg-base-100 border-base-300 hover:border-brand-secondary'}`}
                    >
                        {option}
                    </button>
                ))}
            </div>
            <div className="flex justify-end">
                 <button
                    onClick={handleSubmit}
                    className="px-6 py-2 bg-brand-primary text-white font-semibold rounded-md hover:bg-brand-secondary transition disabled:bg-base-300 disabled:cursor-not-allowed"
                    disabled={!selectedOption}
                    >
                    {t('challengeModal.submitAnswer')}
                </button>
            </div>
        </div>
    );
};

const ChallengeModal: React.FC<ChallengeModalProps> = ({ challenge, onClose }) => {
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const { t } = useI18n();
  const { dispatch } = useAppContext();

  const handleSubmissionResult = (evaluationResult: EvaluationResult) => {
    setResult(evaluationResult);
    if (evaluationResult.passed) {
      dispatch({ 
        type: ActionType.COMPLETE_CHALLENGE, 
        payload: { challengeId: challenge.id, reward: challenge.reward } 
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-base-200 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-base-300">
          <h2 className="text-2xl font-bold text-white">{challenge.title}</h2>
          <p className="text-base-content mt-2">{challenge.description}</p>
        </div>

        <div className="p-6 flex-grow overflow-y-auto">
          {!result ? (
            challenge.type === ChallengeType.QUIZ 
                ? <QuizView challenge={challenge} onSubmit={handleSubmissionResult} />
                : <SubmissionView challenge={challenge} onSubmit={handleSubmissionResult} />
          ) : (
            <div className="animate-fade-in">
              <div className={`p-4 rounded-md flex items-start gap-4 ${result.passed ? 'bg-green-500/10 text-green-300' : 'bg-red-500/10 text-red-300'}`}>
                {result.passed ? <CheckCircleIcon className="w-8 h-8 text-green-400 mt-1 flex-shrink-0" /> : <XCircleIcon className="w-8 h-8 text-red-400 mt-1 flex-shrink-0" />}
                <div>
                  <h3 className="text-xl font-bold text-white">{result.passed ? t('challengeModal.passedTitle', { reward: challenge.reward }) : t('challengeModal.failedTitle')}</h3>
                  <p className="mt-2 text-base-content">{result.feedback}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-base-300 bg-base-200/50 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-base-300 text-white rounded-md hover:bg-base-300/80 transition"
          >
            {result ? t('challengeModal.close') : t('challengeModal.cancel')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChallengeModal;