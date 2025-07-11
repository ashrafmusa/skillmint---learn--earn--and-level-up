
import React from 'react';
import { CoinIcon } from './Icons';
import { useI18n } from '../i18n/context';

const MOCK_LEADERS = [
  { rank: 1, name: 'Alex_CodeMaster', tokens: 12550, avatar: 'https://picsum.photos/seed/leader1/40/40' },
  { rank: 2, name: 'DesignDiva', tokens: 11800, avatar: 'https://picsum.photos/seed/leader2/40/40' },
  { rank: 3, name: 'MarketingMogul', tokens: 10500, avatar: 'https://picsum.photos/seed/leader3/40/40' },
  { rank: 4, name: 'LangLion', tokens: 9850, avatar: 'https://picsum.photos/seed/leader4/40/40' },
  { rank: 5, name: 'ReactRanger', tokens: 9200, avatar: 'https://picsum.photos/seed/leader5/40/40' },
];

const Leaderboard: React.FC = () => {
  const { t } = useI18n();
  return (
    <div className="bg-base-200 rounded-lg shadow-lg">
      <h3 className="text-xl font-bold text-white p-4 border-b border-base-300">{t('leaderboard.title')}</h3>
      <ul className="p-2">
        {MOCK_LEADERS.map((leader, index) => (
          <li key={leader.rank} className={`flex items-center p-3 rounded-md my-1 ${index === 0 ? 'bg-brand-primary/20' : ''}`}>
            <span className={`font-bold text-lg w-8 ${index < 3 ? 'text-brand-light' : 'text-base-content'}`}>{leader.rank}</span>
            <img src={leader.avatar} alt={leader.name} className="w-10 h-10 rounded-full mx-3" />
            <span className="flex-grow font-semibold text-white">{leader.name}</span>
            <div className="flex items-center gap-2 text-yellow-400">
              <CoinIcon className="w-5 h-5" />
              <span className="font-bold">{leader.tokens.toLocaleString()}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Leaderboard;
