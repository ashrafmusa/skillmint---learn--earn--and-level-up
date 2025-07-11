import React, { useState } from 'react';
import Header from './components/Header';
import SkillSelector from './components/SkillSelector';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Redeem from './components/Redeem';
import Profile from './components/Profile';
import Home from './components/Home';
import CareerPaths from './components/CareerPaths'; // New CareerPaths component
import { useI18n } from './i18n/context';
import { useAppContext } from './state/AppContext';
import { useAuth } from './state/AuthContext';
import { LockClosedIcon } from './components/Icons';

export type AppRoute = 'home' | 'skills' | 'redeem' | 'profile' | 'career';

const LockedFeature: React.FC<{ requiredLevel: number }> = ({ requiredLevel }) => {
    const { t } = useI18n();
    return (
        <div className="container mx-auto px-4 py-16 text-center animate-fade-in">
            <div className="max-w-md mx-auto bg-base-200 p-8 rounded-lg">
                <LockClosedIcon className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-white mb-2">{t('locked.title')}</h2>
                <p className="text-base-content">{t('locked.subtitle', { level: requiredLevel })}</p>
            </div>
        </div>
    );
};


const App: React.FC = () => {
  const { t } = useI18n();
  const { state, dispatch } = useAppContext();
  const { isAuthenticated } = useAuth();
  const { selectedSkill, allSkillTracks, level } = state;
  const [route, setRoute] = useState<AppRoute>('home');

  if (!isAuthenticated) {
    return <Login />;
  }
  
  const renderContent = () => {
      if (selectedSkill) {
          return <Dashboard />;
      }
      switch (route) {
          case 'home':
              return <Home setRoute={setRoute} />;
          case 'skills':
              return <SkillSelector skillTracks={allSkillTracks} />;
          case 'career':
              return <CareerPaths skillTracks={allSkillTracks} onSelectSkill={(skill) => dispatch({ type: 'SET_SELECTED_SKILL', payload: { skill } })} />;
          case 'redeem':
               return level >= 2 ? <Redeem /> : <LockedFeature requiredLevel={2} />;
          case 'profile':
              return level >= 2 ? <Profile /> : <LockedFeature requiredLevel={2} />;
          default:
              return <Home setRoute={setRoute} />;
      }
  };

  return (
    <div className="min-h-screen bg-base-100 font-sans">
      <Header currentRoute={route} setRoute={setRoute} />
      <main>
        {renderContent()}
      </main>
      <footer className="text-center py-6 text-base-300">
        <p>{t('footer.copyright', { year: new Date().getFullYear() })}</p>
      </footer>
    </div>
  );
};

export default App;
