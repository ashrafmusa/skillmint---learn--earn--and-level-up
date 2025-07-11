import { GoogleGenAI, Type, Chat, GenerateContentResponse, Content, SendMessageParameters } from "@google/genai";
import { Challenge, EvaluationResult, SkillCategory, SkillTrack, DailyQuest, ChallengeType, CareerPath } from '../types';
import { LanguageCode, supportedLanguages } from "../i18n/config";

let ai: GoogleGenAI;

if (process.env.API_KEY) {
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
} else {
    console.error("CRITICAL SECURITY WARNING: API_KEY is not set. This app is a prototype and is not connected to a live backend. Gemini API calls will be mocked.");
}

const evaluationSchema = {
  type: Type.OBJECT,
  properties: {
    passed: { type: Type.BOOLEAN, description: "Whether the user's submission meets the challenge criteria." },
    feedback: { type: Type.STRING, description: "Constructive feedback for the user, explaining why they passed or failed. This should be encouraging." }
  },
  required: ['passed', 'feedback']
};

export const secureEvaluateChallenge = async (challenge: Challenge, submission: string): Promise<EvaluationResult> => {
    if (!ai) return { passed: false, feedback: "The AI evaluator is not configured correctly. This is a prototype limitation." };
    if (challenge.type === ChallengeType.QUIZ) {
        // This should be handled client-side, but as a safeguard:
        const isCorrect = submission === challenge.quizOptions?.[0];
        return { passed: isCorrect, feedback: isCorrect ? "Correct!" : "That's not the right answer." };
    }

    const prompt = `You are an expert evaluator for the SkillMint learning platform. Your task is to assess a user's submission for a specific challenge.\n\n**Challenge Title:** ${challenge.title}\n**Challenge Description:** ${challenge.description}\n**Evaluation Criteria:** ${challenge.evaluationPrompt}\n\n**User's Submission:**\n---\n${submission}\n---\n\nBased on the criteria, evaluate the user's submission. Be fair but encouraging. Provide clear feedback.`;
    try {
        const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt, config: { responseMimeType: "application/json", responseSchema: evaluationSchema }});
        return JSON.parse(response.text.trim()) as EvaluationResult;
    } catch (error) {
        console.error("Error evaluating challenge:", error);
        return { passed: false, feedback: "Sorry, there was an error evaluating your submission. Please try again." };
    }
};

export const secureCreateCoachChat = (skillTitle: string, language: LanguageCode): Chat => {
    if (!ai) {
        const mockChat: Partial<Chat> = {
            sendMessageStream: async function* (params: SendMessageParameters) {
                yield { text: "AI Coach is not available in this prototype. API key is missing." } as GenerateContentResponse;
            } as any
        };
        return mockChat as Chat;
    }
    
    const languageName = supportedLanguages[language]?.name || 'English';
    return ai.chats.create({ model: 'gemini-2.5-flash', config: { systemInstruction: `You are a friendly and encouraging AI Skill Coach on the SkillMint platform. The user is currently learning about "${skillTitle}". Your goal is to help them understand concepts, give them tips, and answer their questions. Keep your answers concise, positive, and focused on learning. Do not reveal solutions to challenges directly, but guide them towards the answer. IMPORTANT: You must respond in ${languageName}.` }});
};

const skillTrackSchema = {
    type: Type.OBJECT, properties: {
        id: { type: Type.STRING, description: "A unique, URL-friendly slug for this skill (e.g., 'python-for-data-science')." },
        title: { type: Type.STRING, description: "A concise, engaging title for the skill track." },
        description: { type: Type.STRING, description: "A one-sentence summary of what the user will learn." },
        challenges: { type: Type.ARRAY, description: "A list of 2-3 challenges for this skill track, increasing in difficulty.", items: {
            type: Type.OBJECT, properties: {
                id: { type: Type.STRING, description: "A unique slug for this challenge (e.g., 'python-ds-1')." },
                title: { type: Type.STRING, description: "A short title for the challenge." },
                description: { type: Type.STRING, description: "A clear, one-sentence description of the task." },
                reward: { type: Type.INTEGER, description: "The token/XP reward (e.g., 50, 100, 150)." },
                type: { type: Type.STRING, enum: [ChallengeType.SUBMISSION, ChallengeType.QUIZ], description: "The type of challenge."},
                evaluationPrompt: { type: Type.STRING, description: "For SUBMISSION type: Detailed criteria for evaluation. For QUIZ type: A simple statement that this is a quiz." },
                quizOptions: { type: Type.ARRAY, description: "For QUIZ type: An array of 4 strings. The FIRST string is ALWAYS the correct answer.", items: { type: Type.STRING } },
            }, required: ["id", "title", "description", "reward", "type", "evaluationPrompt"],
        }},
    }, required: ["id", "title", "description", "challenges"],
};

export const secureGenerateSkillTrack = async (topic: string, existingTrackTitles: string[]): Promise<SkillTrack | null> => {
    if (!ai) {
        const mockId = `mock-${Date.now()}`;
        return {
            id: mockId, title: `Mock: ${topic}`, category: SkillCategory.OTHER, description: `A mock skill track for ${topic}, as API key is missing.`, icon: 'https://picsum.photos/seed/mockicon/100/100', isGenerated: true,
            challenges: [ { id: `${mockId}-1`, title: "Mock Challenge", description: "A sample task.", reward: 50, type: ChallengeType.SUBMISSION, evaluationPrompt: "Check for completion." } ]
        };
    }
    
    const generationPrompt = `You are a curriculum designer for SkillMint. Generate a new, unique skill track based on the topic: "${topic}". It should not be one of the following: ${existingTrackTitles.join(', ')}. Generate 2-3 progressive challenges. One challenge should be a multiple-choice QUIZ. For quizzes, the first option in quizOptions must be the correct answer.`;
    try {
        const [skillResponse, imageResponse] = await Promise.all([
            ai.models.generateContent({ model: "gemini-2.5-flash", contents: generationPrompt, config: { responseMimeType: "application/json", responseSchema: skillTrackSchema }}),
            ai.models.generateImages({ model: 'imagen-3.0-generate-002', prompt: `A minimalist, abstract, modern icon for a skill about "${topic}". Vector style, clean background, app icon.`, config: { numberOfImages: 1, outputMimeType: 'image/png' }})
        ]);
        const generatedData = JSON.parse(skillResponse.text.trim()) as Omit<SkillTrack, 'category' | 'icon' | 'isGenerated'>;
        const base64Image = imageResponse.generatedImages[0].image.imageBytes;
        return { ...generatedData, category: SkillCategory.OTHER, icon: `data:image/png;base64,${base64Image}`, isGenerated: true };
    } catch (error) {
        console.error("Error generating skill track:", error); return null;
    }
};

const homeDashboardSchema = {
    type: Type.OBJECT, properties: {
        dailyQuestChallengeId: { type: Type.STRING, description: "The ID of the challenge selected for the daily quest." },
        recommendedSkillId: { type: Type.STRING, description: "The ID of the skill track recommended to the user." },
        recommendedCareerPathId: { type: Type.STRING, description: "The ID of the career path recommended to the user." },
    }, required: ["dailyQuestChallengeId", "recommendedSkillId", "recommendedCareerPathId"]
};

export const secureGetHomeDashboardData = async (allSkills: SkillTrack[], completedChallenges: Set<string>, allCareerPaths: CareerPath[]): Promise<{ dailyQuest: DailyQuest | null, recommendedSkill: SkillTrack | null, recommendedCareerPath: CareerPath | null }> => {
    const incompleteChallenges = allSkills.flatMap(skill => skill.challenges.filter(c => !completedChallenges.has(c.id)).map(c => ({...c, skillTrackId: skill.id, skillTrackTitle: skill.title })));
    const incompleteSkills = allSkills.filter(skill => !skill.challenges.every(c => completedChallenges.has(c.id)));

    if (incompleteChallenges.length === 0 || incompleteSkills.length === 0) {
        return { dailyQuest: null, recommendedSkill: null, recommendedCareerPath: null };
    }
    
    if (!ai) { // Mock for prototype mode
        const questChallenge = incompleteChallenges[0];
        const recommended = incompleteSkills.find(s => s.id !== questChallenge.skillTrackId) || incompleteSkills[0];
        const careerPath = allCareerPaths[0] || null;
        return {
            dailyQuest: { challenge: questChallenge, skillTrackId: questChallenge.skillTrackId, skillTrackTitle: questChallenge.skillTrackTitle },
            recommendedSkill: recommended,
            recommendedCareerPath: careerPath,
        };
    }
    
    const prompt = `You are a personalized learning guide. Based on user progress, select a "Daily Quest", a "Recommended Skill", and a "Recommended Career Path".
    Available Incomplete Challenges (challengeId, skillTrackId): ${incompleteChallenges.map(c => `(${c.id}, ${c.skillTrackId})`).join(' ')}
    Available Incomplete Skill Tracks (skillId): ${incompleteSkills.map(s => `(${s.id})`).join(' ')}
    Available Career Paths (careerPathId): ${allCareerPaths.map(p => `(${p.id})`).join(' ')}
    Choose one of each. Prioritize variety. Don't recommend a skill if the daily quest is from that skill.`;
    
    try {
        const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt, config: { responseMimeType: "application/json", responseSchema: homeDashboardSchema }});
        const { dailyQuestChallengeId, recommendedSkillId, recommendedCareerPathId } = JSON.parse(response.text.trim());

        const dailyQuestChallenge = incompleteChallenges.find(c => c.id === dailyQuestChallengeId);
        const recommendedSkill = allSkills.find(s => s.id === recommendedSkillId);
        const recommendedCareerPath = allCareerPaths.find(p => p.id === recommendedCareerPathId);

        return {
            dailyQuest: dailyQuestChallenge ? { challenge: dailyQuestChallenge, skillTrackId: dailyQuestChallenge.skillTrackId, skillTrackTitle: dailyQuestChallenge.skillTrackTitle } : null,
            recommendedSkill: recommendedSkill || null,
            recommendedCareerPath: recommendedCareerPath || null,
        };
    } catch (error) {
        console.error("Error getting home dashboard data:", error);
        // Fallback to simple selection on error
        const questChallenge = incompleteChallenges[0];
        const recommended = incompleteSkills[0];
        const careerPath = allCareerPaths[0] || null;
        return { dailyQuest: { challenge: questChallenge, skillTrackId: questChallenge.skillTrackId, skillTrackTitle: questChallenge.skillTrackTitle }, recommendedSkill: recommended, recommendedCareerPath: careerPath };
    }
};