import { SkillCategory, ChallengeType } from './types';

// This file now exports configuration/data, not translated content.
// The text for skills and challenges will be managed by the i18n system.

// Icons are now URLs. We use picsum.photos for placeholder images.
const getIconUrl = (seed: string) => `https://picsum.photos/seed/${seed}/100/100`;

export const REWARD_OPTIONS_CONFIG = [
  { id: 'voucher-10', title: "10% Discount Voucher", cost: 1000, icon: getIconUrl('gifticon') },
  { id: 'voucher-25', title: "25% Discount Voucher", cost: 2200, icon: getIconUrl('gifticon2') },
  { id: 'crypto-5', title: "$5 Crypto Payout", cost: 5000, icon: getIconUrl('coinicon') },
  { id: 'crypto-10', title: "$10 Crypto Payout", cost: 9500, icon: getIconUrl('coinicon2') },
];

// Simplified skill track configuration with icon URLs
export const SKILL_TRACKS_CONFIG = [
  {
    id: 'frontend',
    category: SkillCategory.CODING,
    icon: getIconUrl('codeicon'),
    isPro: true,
    unlockCost: 250,
    challenges: [
      {
        id: 'fe-1',
        reward: 50,
        type: ChallengeType.SUBMISSION,
        evaluationPrompt: 'User needs to provide HTML and Tailwind CSS for a button. It must use Tailwind classes. The button should have a background color, text color, padding, and a hover effect that changes the background color. The code should be clean and valid.',
      },
      {
        id: 'fe-2',
        reward: 100,
        type: ChallengeType.SUBMISSION,
        evaluationPrompt: 'User needs to provide a React functional component. It must use the useState hook to manage the count. There must be two buttons that correctly call functions to increment and decrement the state. The current count must be displayed.',
      },
      {
        id: 'fe-3',
        reward: 150,
        type: ChallengeType.SUBMISSION,
        evaluationPrompt: 'User needs to provide a React component. It must use the useEffect hook to fetch data when the component mounts. It should use fetch() or a similar library. It must handle a loading state and display the names of users in an unordered list `<ul>`.',
      },
    ],
  },
  {
    id: 'marketing',
    category: SkillCategory.MARKETING,
    icon: getIconUrl('megaphoneicon'),
    challenges: [
      {
        id: 'dm-1',
        reward: 50,
        type: ChallengeType.SUBMISSION,
        evaluationPrompt: 'User needs to provide a tweet under 280 characters. It should be engaging, clearly state the app name "ZenFlow", and highlight a key benefit (e.g., focus, organization). Use of relevant hashtags is a plus.',
      },
      {
        id: 'dm-2',
        reward: 100,
        type: ChallengeType.SUBMISSION,
        evaluationPrompt: 'User needs to provide a blog post outline. The structure should include an introduction, five distinct points related to time management, and a conclusion. The points should be logical and well-defined.',
      },
    ],
  },
   {
    id: 'design',
    category: SkillCategory.DESIGN,
    icon: getIconUrl('sparklesicon'),
    challenges: [
      {
        id: 'gd-1',
        reward: 50,
        type: ChallengeType.SUBMISSION,
        evaluationPrompt: 'User needs to identify a brand and describe its primary colors. The evaluation should focus on whether the user correctly identifies the colors and provides a reasonable interpretation of the emotions or feelings associated with that palette (e.g., green for growth/music, black for modern/sleek).',
      },
       {
        id: 'gd-2',
        type: ChallengeType.QUIZ,
        reward: 25,
        quizOptions: [
            "To create visual balance",
            "To make text harder to read",
            "To use as many colors as possible",
            "To fill empty areas"
        ],
        evaluationPrompt: "This is a quiz. The first option is the correct one. The user's answer should be compared to the first option.",
      },
    ],
  },
  {
    id: 'language',
    category: SkillCategory.LANGUAGE,
    icon: getIconUrl('languageicon'),
    challenges: [
      {
        id: 'es-1',
        reward: 50,
        type: ChallengeType.SUBMISSION,
        evaluationPrompt: 'User needs to provide a sentence in Spanish. It must start with a greeting, correctly use "me llamo" for name and "soy de" for origin. Minor grammatical errors are acceptable but the structure must be correct.',
      },
    ],
  },
];

export const CAREER_PATHS_CONFIG = [
    {
        id: 'fullstack-dev',
        skillTrackIds: ['frontend', 'design'] // Example path
    }
];