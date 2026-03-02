# Sahachari / Vaazhvu (Women's Health Companion)

A privacy-first women’s health companion with a calm community circle, symptom insights, and culturally sensitive remedies.

## ✨ Features

### 🌸 Symptom Insights
- **Private Analysis:** Describe symptoms and receive AI-backed insights.
- **Localized Guidance:** Culturally sensitive tips and awareness notes.

### 🌿 Remedies Library
- **Curated Remedies:** Evidence-aware home remedies with safety notes.
- **Searchable Topics:** PCOS, Anemia, Menstrual Health, General Wellness.

### 💬 Community Forum (Support Circle)
- **Anonymous Posting:** Stable anon identity (Anon#xxxx).
- **Gentle Feed:** Not a social feed; a quiet circle for reflections and questions.
- **Threaded Replies:** Supportive comments with lightweight reactions.
- **AI Moderation:** Two-layer checks (Hugging Face sentiment + Gemini safety) before posts/comments are saved.

### 📔 Wellness Journal
- **Daily Logs:** Track symptoms, moods, and patterns over time.

## 🧱 Tech Stack

- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Firebase Auth + Firestore
- **AI Services:** Gemini 1.5 Flash, Hugging Face sentiment

## ✅ Prerequisites

- Node.js 18+  
- Firebase project with Firestore enabled (Native mode)

## 🚀 Run Locally (Step by Step)

1. **Clone**
   ```bash
   git clone https://github.com/ManvithaDungi/AI_SymptomAnalyserForWomen.git
   cd AI_SymptomAnalyserForWomen
   ```

2. **Install**
   ```bash
   npm install
   ```

3. **Create .env**
   ```env
   VITE_FIREBASE_API_KEY=your_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_GEMINI_API_KEY=your_gemini_key
   VITE_HF_TOKEN=your_hugging_face_token
   ```

4. **Run**
   ```bash
   npm run dev
   ```

5. **Seed Firestore (First Time Only)**
   - Visit `/admin-seed`
   - Click **Seed Firestore Database**

## 🧪 Tests

```bash
npm run test:run
```

## 🚢 Deploy (Firebase Hosting)

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   firebase login
   ```

2. **Initialize Firebase**
   ```bash
   firebase init
   ```
   - Select **Hosting** (and **Firestore** if you want to deploy rules)
   - Set build output directory to `dist`

3. **Build**
   ```bash
   npm run build
   ```

4. **Deploy**
   ```bash
   firebase deploy
   ```

## 🔧 Troubleshooting

- **Seeding feels stuck:** Ensure Firestore is enabled and the project ID in `.env` is correct.
- **Forum data not visible:** Confirm `/admin-seed` completed and Firestore rules allow reads.
- **Vitest ERR_REQUIRE_ESM:** Upgrade dependencies or pin `jsdom` to a compatible version if your CI image uses strict ESM resolution.

## 🤝 Contributing

Issues and PRs are welcome.
