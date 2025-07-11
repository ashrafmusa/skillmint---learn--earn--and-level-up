
import React, { useState } from 'react';
import { useAuth } from '../state/AuthContext';
import { useI18n } from '../i18n/context';
import { ShieldCheckIcon } from './Icons';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const { t } = useI18n();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim().length < 3) {
      setError(t('login.error'));
      return;
    }
    setError('');
    login(username.trim());
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-100 p-4">
      <div className="w-full max-w-md mx-auto animate-fade-in">
        <div className="bg-base-200 rounded-lg shadow-xl p-8">
            <div className="text-center mb-8">
                <div className="flex justify-center items-center gap-4 mb-4">
                    <img src="https://picsum.photos/seed/skillmintlogo/60/60" alt="SkillMint Logo" className="w-16 h-16 rounded-full border-4 border-brand-primary" />
                    <h1 className="text-4xl font-bold text-white tracking-tight">
                        Skill<span className="text-brand-primary">Mint</span>
                    </h1>
                </div>
                <h2 className="text-2xl font-bold text-white">{t('login.title')}</h2>
                <p className="text-base-content mt-2">{t('login.subtitle')}</p>
            </div>
          
            <form onSubmit={handleLogin} className="space-y-6">
                <div>
                    <label htmlFor="username" className="sr-only">{t('login.placeholder')}</label>
                    <input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder={t('login.placeholder')}
                        className="w-full bg-base-100 border border-base-300 rounded-md p-4 text-lg text-base-content focus:ring-2 focus:ring-brand-primary focus:outline-none transition"
                    />
                    {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
                </div>
                <button
                    type="submit"
                    className="w-full bg-brand-primary text-white font-bold py-3 px-4 rounded-md hover:bg-brand-secondary transition-colors text-lg"
                >
                    {t('login.button')}
                </button>
            </form>

            <div className="mt-8 text-center text-sm text-base-300 flex items-center justify-center gap-2">
                <ShieldCheckIcon className="w-5 h-5"/>
                <span>Progress is saved locally to your browser.</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Login;