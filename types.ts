import React from 'react';

export enum SkillCategory {
  CODING = "Coding",
  MARKETING = "Digital Marketing",
  DESIGN = "Graphic Design",
  LANGUAGE = "Language",
  OTHER = "Other",
}

export enum ChallengeType {
    SUBMISSION = "SUBMISSION",
    QUIZ = "QUIZ",
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  reward: number;
  evaluationPrompt: string; // Used for SUBMISSION type
  type: ChallengeType;
  quizOptions?: string[]; // Options for QUIZ type, with the first being the correct answer
}

export interface SkillTrack {
  id: string;
  title: string;
  category: SkillCategory;
  description: string;
  challenges: Challenge[];
  icon: string; // URL or base64 string
  isGenerated?: boolean;
  isPro?: boolean;
  unlockCost?: number;
}

export interface CareerPath {
    id: string;
    title: string;
    description: string;
    skillTrackIds: string[];
}

export type DailyQuest = {
    challenge: Challenge;
    skillTrackId: string;
    skillTrackTitle: string;
};

export enum MessageSender {
    USER = 'user',
    AI = 'ai',
}

export interface ChatMessage {
    sender: MessageSender;
    text: string;
}

export interface EvaluationResult {
  passed: boolean;
  feedback: string;
}

export interface User {
  id:string;
  name: string;
}

export interface Reward {
  id: string;
  title: string;
  cost: number;
  icon: string; // URL
}

// Types for State Management
export enum ActionType {
  SET_SELECTED_SKILL = 'SET_SELECTED_SKILL',
  GO_BACK_TO_SKILLS = 'GO_BACK_TO_SKILLS',
  COMPLETE_CHALLENGE = 'COMPLETE_CHALLENGE',
  REDEEM_REWARD = 'REDEEM_REWARD',
  LOAD_STATE = 'LOAD_STATE',
  RESET_STATE = 'RESET_STATE',
  ADD_SKILL_TRACK = 'ADD_SKILL_TRACK',
  LEVEL_UP = 'LEVEL_UP',
  SET_HOME_DATA = 'SET_HOME_DATA',
  UNLOCK_PRO_TRACK = 'UNLOCK_PRO_TRACK',
}

export interface AppState {
    userTokens: number;
    selectedSkill: SkillTrack | null;
    completedChallenges: Set<string>;
    level: number;
    xp: number;
    xpToNextLevel: number;
    allSkillTracks: SkillTrack[];
    generatedSkillTracks: SkillTrack[];
    dailyQuest: DailyQuest | null;
    recommendedSkill: SkillTrack | null;
    recommendedCareerPath: CareerPath | null;
    // Advanced Features State
    xpStreak: number;
    lastActivityDate: string | null;
    unlockedProTracks: Set<string>;
}

type ActionPayload = {
  [ActionType.SET_SELECTED_SKILL]: {
    skill: SkillTrack;
  };
  [ActionType.GO_BACK_TO_SKILLS]: undefined;
  [ActionType.COMPLETE_CHALLENGE]: {
    challengeId: string;
    reward: number;
  };
  [ActionType.REDEEM_REWARD]: {
    cost: number;
    title: string;
  };
  [ActionType.LOAD_STATE]: {
    state: Partial<Omit<AppState, 'allSkillTracks' | 'selectedSkill'>>;
    allSkillTracks: SkillTrack[];
  };
  [ActionType.RESET_STATE]: {
      staticSkillTracks: SkillTrack[];
  };
  [ActionType.ADD_SKILL_TRACK]: {
    skillTrack: SkillTrack;
  };
  [ActionType.LEVEL_UP]: {
      newLevel: number;
      newXpToNextLevel: number;
  };
  [ActionType.SET_HOME_DATA]: {
      dailyQuest: DailyQuest | null;
      recommendedSkill: SkillTrack | null;
      recommendedCareerPath: CareerPath | null;
  };
  [ActionType.UNLOCK_PRO_TRACK]: {
    trackId: string;
    cost: number;
  };
};

export type ActionMap<P extends { [key:string]: any }> = {
  [Key in keyof P]: P[Key] extends undefined
    ? {
        type: Key;
      }
    : {
        type: Key;
        payload: P[Key];
      };
};

export type Actions = ActionMap<ActionPayload>[keyof ActionMap<ActionPayload>];