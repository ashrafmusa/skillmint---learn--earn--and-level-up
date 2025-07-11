import { Chat } from "@google/genai";
import { Challenge, EvaluationResult, SkillTrack, DailyQuest, CareerPath } from '../types';
import { LanguageCode } from "../i18n/config";
import { secureEvaluateChallenge, secureCreateCoachChat, secureGenerateSkillTrack, secureGetHomeDashboardData } from "../functions/gemini-proxy";

/**
 * NOTE: In a real-world application, the functions in this file would make `fetch` requests
 * to a secure backend API. The backend would then use the Gemini API key.
 * This file acts as the "client-side SDK" for our backend services.
 */

export const evaluateChallenge = async (challenge: Challenge, submission: string): Promise<EvaluationResult> => {
    return await secureEvaluateChallenge(challenge, submission);
};


export const createCoachChat = (skillTitle: string, language: LanguageCode): Chat => {
    return secureCreateCoachChat(skillTitle, language);
};

export const generateSkillTrack = async (topic: string, existingTrackTitles: string[]): Promise<SkillTrack | null> => {
    return await secureGenerateSkillTrack(topic, existingTrackTitles);
};

export const getHomeDashboardData = async (
    allSkills: SkillTrack[],
    completedChallenges: Set<string>,
    allCareerPaths: CareerPath[]
): Promise<{ dailyQuest: DailyQuest | null, recommendedSkill: SkillTrack | null, recommendedCareerPath: CareerPath | null }> => {
    return await secureGetHomeDashboardData(allSkills, completedChallenges, allCareerPaths);
};