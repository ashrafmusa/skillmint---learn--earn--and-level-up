# 🌱 SkillMint – Learn, Earn, and Level Up

**SkillMint** is an AI-powered platform that helps users **learn real-world skills**, apply them through **micro-gigs**, and **earn income** while they learn.

> "From learning to earning – Empowering growth through knowledge."

---

## 🎯 Objective

To bridge the gap between **informal learners** and **economic opportunities**, by guiding users to:
- Learn practical skills in their own language.
- Apply knowledge via guided AI-assisted micro-tasks.
- Earn income from gig work – no CVs or degrees required.

---

## 💡 Key Features

| Feature              | Description                                                                 |
|----------------------|-----------------------------------------------------------------------------|
| 🧠 AI-Powered Learning | Gemini AI generates personalized content and task suggestions              |
| 📱 Mobile-First UI     | Tailored for low-bandwidth users in MENA, Africa, and Asia                 |
| 🔁 Learn → Apply Loop | Each skill module ends in micro-tasks you can apply and earn from          |
| 🧾 Voice Onboarding    | Speak instead of typing – for low-literacy users                           |
| 🌍 Multilingual        | Arabic, English, Hausa, Swahili (coming soon...)                           |
| 💰 Income Generation   | Gig-matching layer powered by skill data and task performance              |

---

## 🛠️ Built With

- ⚛️ **React** + **TailwindCSS** – Sleek, mobile-first frontend
- 🌐 **Google AI Studio** – Core AI integration with Gemini Pro API
- 🧠 **Gemini API** – Used to generate:
  - Learning plans
  - Assessments
  - Micro-gig suggestions
- 📦 **Node.js** – Runtime for development
- ☁️ (Future) Firebase / Supabase – For user auth and real-time data

---

## 🚀 Getting Started Locally

### 🔧 Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- Gemini API key ([Google AI Studio](https://makersuite.google.com/))

### 🧪 Run the App Locally

```bash
# 1. Clone the repo
git clone https://github.com/ashrafmusa/skillmint---learn--earn--and-level-up.git

# 2. Go into the project directory
cd skillmint---learn--earn--and-level-up

# 3. Install dependencies
npm install

# 4. Add your Gemini API key to `.env.local`
echo "GEMINI_API_KEY=your_api_key_here" > .env.local

# 5. Run the dev server
npm run dev
