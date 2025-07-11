import React from 'react';
import { CareerPath, SkillTrack } from '../types';
import { useI18n } from '../i18n/context';
import { useAppContext } from '../state/AppContext';
import { CheckCircleIcon, BriefcaseIcon } from './Icons';

interface CareerPathsProps {
    skillTracks: SkillTrack[];
    onSelectSkill: (skill: SkillTrack) => void;
}

const CareerPathCard: React.FC<{
    careerPath: CareerPath;
    skills: SkillTrack[];
    completedChallenges: Set<string>;
    onSelectSkill: (skill: SkillTrack) => void;
}> = ({ careerPath, skills, completedChallenges, onSelectSkill }) => {
    const { t } = useI18n();
    const skillsInPath = skills.filter(skill => careerPath.skillTrackIds.includes(skill.id));
    
    return (
        <div className="bg-base-200 rounded-lg shadow-lg overflow-hidden animate-slide-in-up">
            <div className="p-6 bg-base-300/50">
                <div className="flex items-center gap-4">
                    <BriefcaseIcon className="w-10 h-10 text-brand-primary flex-shrink-0" />
                    <div>
                        <h3 className="text-2xl font-bold text-white">{careerPath.title}</h3>
                        <p className="text-base-content mt-1">{careerPath.description}</p>
                    </div>
                </div>
            </div>
            <div className="p-6 space-y-4">
                {skillsInPath.map(skill => {
                    const isCompleted = skill.challenges.every(c => completedChallenges.has(c.id));
                    return (
                        <div 
                            key={skill.id}
                            onClick={() => onSelectSkill(skill)}
                            className={`p-4 rounded-lg flex items-center gap-4 transition-colors cursor-pointer ${isCompleted ? 'bg-green-500/10' : 'bg-base-300 hover:bg-base-300/70'}`}
                        >
                            <img src={skill.icon} alt={skill.title} className="w-12 h-12 rounded-lg flex-shrink-0" />
                            <div className="flex-grow">
                                <h4 className="font-bold text-white">{skill.title}</h4>
                                <p className="text-sm text-base-content">{skill.category}</p>
                            </div>
                            {isCompleted && <CheckCircleIcon className="w-8 h-8 text-green-400 flex-shrink-0" />}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

const CareerPaths: React.FC<CareerPathsProps> = ({ skillTracks, onSelectSkill }) => {
    const { t } = useI18n();
    const { careerPaths, state } = useAppContext();
    const { completedChallenges } = state;

    return (
        <div className="container mx-auto px-4 py-8 animate-fade-in">
            <div className="text-center mb-12">
                <h2 className="text-4xl font-extrabold text-white">{t('careerPaths.title')}</h2>
                <p className="mt-4 text-lg text-base-content max-w-2xl mx-auto">
                    {t('careerPaths.subtitle')}
                </p>
            </div>
            <div className="max-w-4xl mx-auto space-y-8">
                {careerPaths.map(path => (
                    <CareerPathCard
                        key={path.id}
                        careerPath={path}
                        skills={skillTracks}
                        completedChallenges={completedChallenges}
                        onSelectSkill={onSelectSkill}
                    />
                ))}
            </div>
        </div>
    );
};

export default CareerPaths;