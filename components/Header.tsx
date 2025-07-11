import React, { useState, useEffect, useRef } from 'react';
import { CoinIcon, LogoutIcon, LockClosedIcon, BriefcaseIcon, FlameIcon } from './Icons';
import { useI18n } from '../i18n/context';
import { supportedLanguages, LanguageCode } from '../i18n/config';
import { useAppContext } from '../state/AppContext';
import { useAuth } from '../state/AuthContext';
import { AppRoute } from '../App';

interface HeaderProps {
    currentRoute: AppRoute;
    setRoute: (route: AppRoute) => void;
}

const NavLink: React.FC<{
    isActive: boolean;
    isDisabled?: boolean;
    onClick: () => void;
    children: React.ReactNode;
}> = ({ isActive, isDisabled, onClick, children }) => {
    const disabledClasses = isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-base-300 hover:text-white';
    return (
        <button
            onClick={onClick}
            disabled={isDisabled}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                isActive
                    ? 'bg-brand-primary text-white'
                    : `text-base-content ${disabledClasses}`
            }`}
        >
            {children}
        </button>
    );
};


const Header: React.FC<HeaderProps> = ({ currentRoute, setRoute }) => {
  const { t, changeLanguage, language } = useI18n();
  const { state: { userTokens, level, xp, xpToNextLevel, xpStreak } } = useAppContext();
  const { logout } = useAuth();
  const [isAnimating, setIsAnimating] = useState(false);
  const isInitialMount = useRef(true);
  
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 500); // Animation duration
    
    return () => clearTimeout(timer);
  }, [userTokens]);

  const handleLangChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    changeLanguage(e.target.value as LanguageCode);
  };
  
  const tokenAnimationClasses = isAnimating 
    ? 'transform scale-125 bg-green-500/30' 
    : 'transform scale-100 bg-base-300';
    
  const xpPercentage = xpToNextLevel > 0 ? (xp / xpToNextLevel) * 100 : 0;
  const canAccessFeatures = level >= 2;

  return (
    <header className="bg-base-200/50 backdrop-blur-sm sticky top-0 z-30 p-4 border-b border-base-300">
      <div className="container mx-auto flex justify-between items-center gap-4">
        <div className="flex items-center gap-3">
           <img src="https://picsum.photos/seed/skillmintlogo/40/40" alt="SkillMint Logo" className="w-10 h-10 rounded-full border-2 border-brand-primary" />
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Skill<span className="text-brand-primary">Mint</span>
          </h1>
        </div>
        
        <div className="hidden md:flex items-center gap-2 bg-base-300/50 p-1 rounded-lg">
           <NavLink isActive={currentRoute === 'home'} onClick={() => setRoute('home')}>{t('nav.home')}</NavLink>
           <NavLink isActive={currentRoute === 'skills'} onClick={() => setRoute('skills')}>{t('nav.library')}</NavLink>
           <NavLink isActive={currentRoute === 'career'} onClick={() => setRoute('career')}>
                <BriefcaseIcon className="w-4 h-4" /> {t('nav.career')}
           </NavLink>
           <NavLink isActive={currentRoute === 'redeem'} isDisabled={!canAccessFeatures} onClick={() => setRoute('redeem')}>
                {t('nav.redeem')}
                {!canAccessFeatures && <LockClosedIcon className="w-4 h-4" />}
            </NavLink>
           <NavLink isActive={currentRoute === 'profile'} isDisabled={!canAccessFeatures} onClick={() => setRoute('profile')}>
                {t('nav.profile')}
                {!canAccessFeatures && <LockClosedIcon className="w-4 h-4" />}
            </NavLink>
        </div>

        <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-4 bg-base-300 px-4 py-1.5 rounded-full">
                {xpStreak > 0 && (
                     <div className="flex items-center gap-1 text-orange-400" title={t('header.streak_title', {count: xpStreak})}>
                        <FlameIcon className="w-5 h-5"/>
                        <span className="font-bold text-lg">{xpStreak}</span>
                    </div>
                )}
                <div className="text-center">
                    <div className="font-bold text-white leading-tight">{t('header.level')} {level}</div>
                    <div className="text-xs text-base-content leading-tight">{xp} / {xpToNextLevel} XP</div>
                </div>
                 <div className="w-24 h-2 bg-base-100 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-primary rounded-full transition-all duration-500" style={{ width: `${xpPercentage}%`}}></div>
                </div>
            </div>

            <select
              title={t('languageSwitcher.label')}
              aria-label={t('languageSwitcher.label')}
              value={language}
              onChange={handleLangChange}
              className="bg-base-300 text-white rounded-full appearance-none py-2 ps-4 pe-8 focus:outline-none focus:ring-2 focus:ring-brand-primary cursor-pointer"
            >
              {Object.entries(supportedLanguages).map(([code, { name }]) => (
                <option key={code} value={code} className="bg-base-100 text-base-content">{name}</option>
              ))}
            </select>
          
           <div className={`hidden sm:flex items-center gap-3 px-4 py-2 rounded-full transition-all duration-500 ${tokenAnimationClasses}`}>
            <CoinIcon className="w-6 h-6 text-yellow-400" />
            <span className="text-lg font-semibold text-white">{userTokens}</span>
          </div>

          <button onClick={logout} title={t('nav.logout')} className="p-2 rounded-full bg-base-300 hover:bg-red-500/50 transition-colors">
              <LogoutIcon className="w-6 h-6 text-white"/>
          </button>
        </div>
      </div>
       {/* Mobile Navigation */}
      <div className="md:hidden flex items-center justify-center gap-2 bg-base-300/50 p-1 rounded-lg mt-4">
           <NavLink isActive={currentRoute === 'home'} onClick={() => setRoute('home')}>{t('nav.home')}</NavLink>
           <NavLink isActive={currentRoute === 'skills'} onClick={() => setRoute('skills')}>{t('nav.library')}</NavLink>
            <NavLink isActive={currentRoute === 'career'} onClick={() => setRoute('career')}>{t('nav.career')}</NavLink>
            <NavLink isActive={currentRoute === 'redeem'} isDisabled={!canAccessFeatures} onClick={() => canAccessFeatures && setRoute('redeem')}>
                {t('nav.redeem')}
            </NavLink>
            <NavLink isActive={currentRoute === 'profile'} isDisabled={!canAccessFeatures} onClick={() => canAccessFeatures && setRoute('profile')}>
                {t('nav.profile')}
            </NavLink>
      </div>
    </header>
  );
};

export default Header;