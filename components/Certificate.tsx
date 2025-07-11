import React from 'react';
import { SkillTrack, User } from '../types';
import { useI18n } from '../i18n/context';

interface CertificateProps {
    skill: SkillTrack;
    user: User;
}

const Certificate: React.FC<CertificateProps> = ({ skill, user }) => {
    const { t } = useI18n();
    const issueDate = new Date().toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <div className="bg-base-200 p-8 rounded-lg max-w-4xl mx-auto animate-fade-in">
            <div className="border-4 border-brand-primary p-8 rounded-lg bg-base-100 text-center relative">
                <div className="absolute top-4 left-4">
                     <img src="https://picsum.photos/seed/skillmintlogo/60/60" alt="SkillMint Logo" className="w-16 h-16 rounded-full border-2 border-brand-primary" />
                </div>
                
                <h2 className="text-3xl font-bold text-yellow-300 uppercase tracking-widest">{t('certificate.title')}</h2>
                
                <p className="mt-8 text-lg text-base-content">{t('certificate.presented_to')}</p>
                <h1 className="text-5xl font-extrabold text-white my-4">{user.name}</h1>
                
                <p className="text-lg text-base-content">{t('certificate.completion_text')}</p>
                <h3 className="text-3xl font-bold text-brand-light my-4">{skill.title}</h3>

                <div className="mt-12 flex justify-between items-end">
                    <div className="text-left">
                        <p className="text-sm uppercase tracking-wider text-base-content">{t('certificate.issued_on')}</p>
                        <p className="font-bold text-white border-t-2 border-base-300 pt-1 mt-1">{issueDate}</p>
                    </div>
                    <div className="text-right">
                         <p className="text-sm uppercase tracking-wider text-base-content">{t('certificate.by')}</p>
                         <p className="font-bold text-white text-xl border-t-2 border-base-300 pt-1 mt-1">Skill<span className="text-brand-primary">Mint</span></p>
                    </div>
                </div>

                 <div className="absolute -bottom-6 -right-6 w-24 h-24">
                    <svg viewBox="0 0 100 100" className="text-yellow-400">
                        <path fill="currentColor" d="M50,0,61.22,38.78,100,38.78,69.39,61.22,80.61,100,50,77.56,19.39,100,30.61,61.22,0,38.78,38.78,38.78Z"/>
                    </svg>
                </div>
            </div>
        </div>
    );
};

export default Certificate;