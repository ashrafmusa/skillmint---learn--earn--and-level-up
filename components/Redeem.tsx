import React from 'react';
import { useAppContext } from '../state/AppContext';
import { useI18n } from '../i18n/context';
import { CoinIcon } from './Icons';
import { ActionType, Reward } from '../types';

const Redeem: React.FC = () => {
    const { state, dispatch, rewardOptions } = useAppContext();
    const { userTokens } = state;
    const { t } = useI18n();

    const handleRedeem = (reward: Reward) => {
        if (userTokens >= reward.cost) {
            dispatch({ type: ActionType.REDEEM_REWARD, payload: { cost: reward.cost, title: reward.title } });
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 animate-fade-in">
            <div className="text-center mb-12">
                <h2 className="text-4xl font-extrabold text-white">{t('redeem.title')}</h2>
                <p className="mt-4 text-lg text-base-content max-w-2xl mx-auto">
                    {t('redeem.subtitle')}
                </p>
                <div className="mt-6 inline-flex items-center gap-3 px-6 py-3 rounded-full bg-base-200">
                    <span className="text-lg font-medium text-base-content">{t('redeem.your_tokens')}:</span>
                    <div className="flex items-center gap-2 text-yellow-400">
                        <CoinIcon className="w-8 h-8" />
                        <span className="text-2xl font-bold text-white">{userTokens.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {rewardOptions.map((reward) => {
                    const canAfford = userTokens >= reward.cost;
                    return (
                        <div key={reward.id} className="bg-base-200 rounded-lg p-6 flex flex-col items-start gap-4 animate-slide-in-up">
                            <div className="p-2 bg-brand-primary/20 rounded-lg">
                                <img src={reward.icon} alt={`${reward.title} icon`} className="w-10 h-10 rounded" />
                            </div>
                            <h3 className="text-xl font-bold text-white flex-grow">{reward.title}</h3>
                            <div className="flex items-center gap-2 text-yellow-400">
                                <CoinIcon className="w-5 h-5" />
                                <span className="font-semibold text-lg">{reward.cost.toLocaleString()}</span>
                            </div>
                            <button
                                onClick={() => handleRedeem(reward)}
                                disabled={!canAfford}
                                className="w-full mt-2 bg-brand-primary text-white font-bold py-2 px-4 rounded-md hover:bg-brand-secondary transition-colors disabled:bg-base-300 disabled:cursor-not-allowed disabled:text-base-content"
                            >
                                {canAfford ? t('redeem.redeem_button') : t('redeem.insufficient')}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Redeem;