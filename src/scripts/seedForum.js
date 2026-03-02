
// src/scripts/seedForum.js
import { db } from '../firebase/firebaseConfig';
// checking imports in firebaseService.js: import { auth, db } from '../firebase/firebaseConfig';
// So ../firebase/firebaseConfig is correct if file structure matches prompt, but I should use what works.
// in ForumScreen imports: '../services/firebaseService'.
// The prompt code: import { db } from '../firebase/firebaseConfig'
// I'll stick to prompt but fix path if needed. 
// Update: src/firebase/firebaseConfig.js exists (from reading main.jsx -> App.jsx -> ...).
// So path is correct relative to src/scripts/seedForum.js? 
// No, src/scripts/../firebase/firebaseConfig is src/firebase/firebaseConfig. Correct.

import { collection, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';

const mockPosts = [

   // ─── ENGLISH POSTS ───────────────────────────────────────

   {
      language: 'en',
      topic: 'PCOS',
      type: 'text',
      title: 'Finally got diagnosed with PCOS after 3 years',
      content: 'I want to share my journey because I wish someone had told me earlier what to look for. The fatigue and irregular cycles felt so isolating. If you have similar symptoms please push for a scan.',
      anonName: 'Anon#4821',
      upvotes: 47,
      commentCount: 12,
      approved: true,
      isPinned: true,
      isExpertAnswered: true,
      moderation: { sentiment: 'positive', safetyScore: 95, flags: ['safe'] }
   },
   {
      language: 'en',
      topic: 'Anemia',
      type: 'question',
      title: 'Does anyone feel dizzy even after taking iron tablets?',
      content: 'My doctor prescribed iron supplements but I still feel lightheaded every morning. Has this happened to you? How long did it take to feel better?',
      anonName: 'Anon#2934',
      upvotes: 23,
      commentCount: 8,
      approved: true,
      isPinned: false,
      isExpertAnswered: false,
      moderation: { sentiment: 'neutral', safetyScore: 88, flags: ['safe'] }
   },
   {
      language: 'en',
      topic: 'Home Remedies',
      type: 'text',
      title: 'Tried jeera water for 30 days — honest results',
      content: 'I know there is a lot of debate about this remedy. Here is what I actually experienced after a month. Bloating reduced noticeably in week 3. Energy levels felt slightly better. But it did not fix my cycle irregularity.',
      anonName: 'Anon#7612',
      upvotes: 31,
      commentCount: 15,
      approved: true,
      isPinned: false,
      isExpertAnswered: true,
      moderation: { sentiment: 'positive', safetyScore: 91, flags: ['safe'] }
   },
   {
      language: 'en',
      topic: 'Menstrual Health',
      type: 'text',
      title: 'Tracking my cycle changed how I talk to my doctor',
      content: 'Started journaling 6 months ago and the patterns I noticed completely changed my appointments. I could finally describe what was happening instead of guessing.',
      anonName: 'Anon#3301',
      upvotes: 19,
      commentCount: 6,
      approved: true,
      isPinned: false,
      isExpertAnswered: false,
      moderation: { sentiment: 'positive', safetyScore: 93, flags: ['safe'] }
   },
   {
      language: 'en',
      topic: 'General Wellness',
      type: 'question',
      title: 'What local foods have genuinely helped your energy?',
      content: 'Looking for practical suggestions available in local markets, not just generic advice. I am in Chennai. Ragi and drumstick leaves have worked for me — what about you?',
      anonName: 'Anon#5509',
      upvotes: 38,
      commentCount: 21,
      approved: true,
      isPinned: false,
      isExpertAnswered: true,
      moderation: { sentiment: 'positive', safetyScore: 96, flags: ['safe'] }
   },

   // ─── TAMIL POSTS ─────────────────────────────────────────

   {
      language: 'ta',
      topic: 'PCOS',
      type: 'text',
      title: 'PCOS பற்றி யாரும் எனக்கு சொல்லவே இல்லை',
      content: 'மூன்று வருடமாக ஏன் இப்படி இருக்கிறேன் என்று தெரியவில்லை. சோர்வு, முடி உதிர்வு, ஒழுங்கற்ற மாதவிடாய் — எல்லாமே PCOS அறிகுறிகள் என்று இப்போது தான் தெரிகிறது. உங்கள் அனுபவம் பகிருங்கள்.',
      anonName: 'Anon#8821',
      upvotes: 52,
      commentCount: 18,
      approved: true,
      isPinned: true,
      isExpertAnswered: true,
      moderation: { sentiment: 'positive', safetyScore: 93, flags: ['safe'] }
   },
   {
      language: 'ta',
      topic: 'Anemia',
      type: 'question',
      title: 'இரும்புச்சத்து மாத்திரை சாப்பிட்டாலும் தலைசுற்றல் நிற்கவில்லை',
      content: 'டாக்டர் இரும்புச்சத்து மாத்திரை கொடுத்தார். ஆனாலும் காலையில் தலைசுற்றல் வருகிறது. இது உங்களுக்கும் நடந்ததா? எத்தனை நாளில் சரியாயிற்று?',
      anonName: 'Anon#1134',
      upvotes: 29,
      commentCount: 11,
      approved: true,
      isPinned: false,
      isExpertAnswered: false,
      moderation: { sentiment: 'neutral', safetyScore: 85, flags: ['safe'] }
   },
   {
      language: 'ta',
      topic: 'Home Remedies',
      type: 'text',
      title: 'வெந்தயம் தண்ணீர் குடித்தேன் — உண்மையான அனுபவம்',
      content: 'ஒரு மாதம் தினமும் காலையில் வெந்தயம் ஊறவைத்த தண்ணீர் குடித்தேன். வயிறு உப்புசம் கொஞ்சம் குறைந்தது. ஆனால் மாதவிடாய் ஒழுங்கு சரியாகவில்லை. உங்கள் அனுபவம் என்ன?',
      anonName: 'Anon#6612',
      upvotes: 34,
      commentCount: 9,
      approved: true,
      isPinned: false,
      isExpertAnswered: false,
      moderation: { sentiment: 'positive', safetyScore: 90, flags: ['safe'] }
   },
   {
      language: 'ta',
      topic: 'Menstrual Health',
      type: 'text',
      title: 'மாதவிடாய் வலி தாங்க முடியவில்லை — என்ன செய்வது?',
      content: 'ஒவ்வொரு மாதமும் முதல் இரண்டு நாட்கள் படுக்கையிலேயே இருக்க வேண்டியிருக்கிறது. வலி மிகவும் அதிகமாக இருக்கிறது. யாரிடமாவது சொல்வதற்கு வெட்கமாக இருக்கிறது. இங்கே பகிர்கிறேன்.',
      anonName: 'Anon#4409',
      upvotes: 61,
      commentCount: 24,
      approved: true,
      isPinned: false,
      isExpertAnswered: true,
      moderation: { sentiment: 'neutral', safetyScore: 87, flags: ['safe'] }
   },
   {
      language: 'ta',
      topic: 'General Wellness',
      type: 'question',
      title: 'ராகி சாப்பிடுவது உண்மையிலேயே உதவுமா?',
      content: 'அம்மா தினமும் ராகி கஞ்சி குடிக்கச் சொல்கிறார். இரும்புச்சத்துக்கு நல்லது என்கிறார். நீங்கள் சாப்பிட்டீர்களா? எப்படிப்பட்ட மாற்றம் தெரிந்தது?',
      anonName: 'Anon#7723',
      upvotes: 27,
      commentCount: 13,
      approved: true,
      isPinned: false,
      isExpertAnswered: false,
      moderation: { sentiment: 'positive', safetyScore: 94, flags: ['safe'] }
   },

   // ─── HINDI POSTS ─────────────────────────────────────────

   {
      language: 'hi',
      topic: 'PCOS',
      type: 'text',
      title: 'PCOS के साथ जीना — मेरा अनुभव',
      content: 'दो साल पहले पता चला कि मुझे PCOS है। शुरुआत में बहुत डर लगा। लेकिन खानपान बदलने से और थोड़ी वॉक करने से काफी फर्क पड़ा। आप भी हिम्मत रखें।',
      anonName: 'Anon#3341',
      upvotes: 44,
      commentCount: 16,
      approved: true,
      isPinned: true,
      isExpertAnswered: true,
      moderation: { sentiment: 'positive', safetyScore: 95, flags: ['safe'] }
   },
   {
      language: 'hi',
      topic: 'Anemia',
      type: 'question',
      title: 'खून की कमी के लिए घर पर क्या खाएं?',
      content: 'डॉक्टर ने बताया हीमोग्लोबिन कम है। दवाई के साथ-साथ घर का खाना भी सुधारना है। चुकंदर, पालक के अलावा और क्या खाएं? आपके घर में क्या काम आया?',
      anonName: 'Anon#9921',
      upvotes: 33,
      commentCount: 19,
      approved: true,
      isPinned: false,
      isExpertAnswered: false,
      moderation: { sentiment: 'neutral', safetyScore: 89, flags: ['safe'] }
   },
   {
      language: 'hi',
      topic: 'Menstrual Health',
      type: 'text',
      title: 'पीरियड्स के बारे में घर में बात करना मुश्किल है',
      content: 'हमारे घर में इस विषय पर बात नहीं होती। मुझे पता ही नहीं था कि बहुत ज्यादा दर्द होना सामान्य नहीं है। यहाँ आकर समझ आया। आप भी खुलकर पूछें।',
      anonName: 'Anon#5512',
      upvotes: 58,
      commentCount: 22,
      approved: true,
      isPinned: false,
      isExpertAnswered: true,
      moderation: { sentiment: 'positive', safetyScore: 91, flags: ['safe'] }
   },
   {
      language: 'hi',
      topic: 'Home Remedies',
      type: 'text',
      title: 'हल्दी दूध सच में काम करता है?',
      content: 'दादी हमेशा कहती हैं रात को हल्दी दूध पियो। मैंने एक महीने पिया। नींद बेहतर हुई, सूजन कम लगी। लेकिन PCOS पर कोई खास असर नहीं दिखा।',
      anonName: 'Anon#2278',
      upvotes: 26,
      commentCount: 8,
      approved: true,
      isPinned: false,
      isExpertAnswered: false,
      moderation: { sentiment: 'positive', safetyScore: 92, flags: ['safe'] }
   },

   // ─── MALAYALAM POSTS ─────────────────────────────────────

   {
      language: 'ml',
      topic: 'PCOS',
      type: 'text',
      title: 'PCOS ഉള്ളവർ ഇവിടെ ഉണ്ടോ?',
      content: 'കഴിഞ്ഞ വർഷം PCOS ആണെന്ന് അറിഞ്ഞു. തലമുടി കൊഴിയൽ, ക്ഷീണം, ഒഴുക്കില്ലാത്ത ആർത്തവം — ഇതെല്ലാം ഒരുമിച്ച് വന്നു. ആരെങ്കിലും ഇത് അനുഭവിച്ചിട്ടുണ്ടോ?',
      anonName: 'Anon#6634',
      upvotes: 39,
      commentCount: 14,
      approved: true,
      isPinned: true,
      isExpertAnswered: false,
      moderation: { sentiment: 'neutral', safetyScore: 88, flags: ['safe'] }
   },
   {
      language: 'ml',
      topic: 'Menstrual Health',
      type: 'question',
      title: 'ആർത്തവ വേദന കുറയ്ക്കാൻ എന്ത് ചെയ്യാം?',
      content: 'ഓരോ മാസവും ആദ്യ രണ്ട് ദിവസം വളരെ വേദനയുണ്ട്. ഡോക്ടറോട് പറയാൻ മടിയാണ്. വീട്ടിൽ എന്ത് ചെയ്യാം? ആരെങ്കിലും ഒരു മാർഗം പറയുമോ?',
      anonName: 'Anon#1198',
      upvotes: 45,
      commentCount: 17,
      approved: true,
      isPinned: false,
      isExpertAnswered: true,
      moderation: { sentiment: 'neutral', safetyScore: 86, flags: ['safe'] }
   },
   {
      language: 'ml',
      topic: 'General Wellness',
      type: 'text',
      title: 'കേരളത്തിൽ കിട്ടുന്ന ഭക്ഷണം — ഊർജ്ജത്തിന് ഉതകുന്നത്',
      content: 'മുരിങ്ങയില, കുമ്പളങ്ങ, ചേന — ഇവ ദിവസവും കഴിക്കാൻ തുടങ്ങിയതിൽ പിന്നെ ക്ഷീണം കുറഞ്ഞു. ആർത്തവ ക്രമം ഒരു പരിധി വരെ നന്നായി. ഇവ ഉപകരിക്കുമെന്ന് തോന്നുന്നില്ലേ?',
      anonName: 'Anon#8823',
      upvotes: 31,
      commentCount: 10,
      approved: true,
      isPinned: false,
      isExpertAnswered: false,
      moderation: { sentiment: 'positive', safetyScore: 94, flags: ['safe'] }
   },

   // ─── TELUGU POSTS ────────────────────────────────────────

   {
      language: 'te',
      topic: 'PCOS',
      type: 'text',
      title: 'PCOS నిర్ధారణ తర్వాత నా జీవితం మారింది',
      content: 'రెండు సంవత్సరాలు ఏమి జరుగుతుందో అర్థం కాలేదు. చివరకు PCOS అని తెలిసింది. ఆహారం మార్చుకున్నాను, నడక మొదలుపెట్టాను. మెల్లగా మెరుగుపడుతుంది. మీకు ఇలాంటి అనుభవం ఉందా?',
      anonName: 'Anon#7743',
      upvotes: 41,
      commentCount: 15,
      approved: true,
      isPinned: true,
      isExpertAnswered: true,
      moderation: { sentiment: 'positive', safetyScore: 94, flags: ['safe'] }
   },
   {
      language: 'te',
      topic: 'Anemia',
      type: 'question',
      title: 'రక్తహీనతకు ఇంట్లో ఏమి తినాలి?',
      content: 'డాక్టర్ హిమోగ్లోబిన్ తక్కువగా ఉందన్నారు. మందులతో పాటు ఇంట్లో ఏమి తినాలో చెప్పండి. మీకు ఏ ఆహారం పని చేసింది?',
      anonName: 'Anon#3356',
      upvotes: 28,
      commentCount: 11,
      approved: true,
      isPinned: false,
      isExpertAnswered: false,
      moderation: { sentiment: 'neutral', safetyScore: 87, flags: ['safe'] }
   },
   {
      language: 'te',
      topic: 'Menstrual Health',
      type: 'text',
      title: 'నెలసరి నొప్పి గురించి ఇంట్లో మాట్లాడలేను',
      content: 'మా ఇంట్లో ఈ విషయాలు మాట్లాడే వాతావరణం లేదు. నొప్పి చాలా ఎక్కువగా ఉంటుంది కానీ ఎవరికీ చెప్పలేను. ఇక్కడ చెప్పుకోవడం కొంచెం తేలికగా అనిపిస్తుంది.',
      anonName: 'Anon#9901',
      upvotes: 55,
      commentCount: 20,
      approved: true,
      isPinned: false,
      isExpertAnswered: true,
      moderation: { sentiment: 'neutral', safetyScore: 89, flags: ['safe'] }
   },
   {
      language: 'te',
      topic: 'Home Remedies',
      type: 'text',
      title: 'మెంతి నీళ్ళు తాగాను — నా అనుభవం',
      content: 'ఒక నెల పాటు ప్రతి రోజు ఉదయం మెంతి నానబెట్టిన నీళ్ళు తాగాను. కడుపు ఉబ్బరం తగ్గింది. కానీ నెలసరి క్రమం సరిపోలేదు. మీరు ప్రయత్నించారా?',
      anonName: 'Anon#4467',
      upvotes: 22,
      commentCount: 7,
      approved: true,
      isPinned: false,
      isExpertAnswered: false,
      moderation: { sentiment: 'positive', safetyScore: 91, flags: ['safe'] }
   }
];

export const seedAllPosts = async () => {
   const logs = [];
   console.log('Seeding forum posts...');
   logs.push('Seeding multilingual forum posts...');

   for (const post of mockPosts) {
      await addDoc(collection(db, 'forum_posts'), {
         ...post,
         createdAt: Timestamp.fromDate(
            new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
         )  // random time within last 7 days
      });
   }
   console.log('Done! Seeded', mockPosts.length, 'posts');
   logs.push(`✅ Seeded ${mockPosts.length} multilingual posts.`);
   return logs;
};
