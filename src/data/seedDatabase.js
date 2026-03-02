import { db } from '../firebase/firebaseConfig';
import { collection, doc, setDoc, addDoc, getDocs, serverTimestamp, Timestamp } from 'firebase/firestore';
import { remediesData } from './remediesData';

const forumTopics = [
   {
      id: "PCOS",
      title: "PCOS",
      titleTamil: "பிசிஓஎஸ்",
      description: "Gentle space for PCOS experiences",
      icon: "🌸",
      color: "rgba(109,91,208,0.12)",
      postCount: 0
   },
   {
      id: "Anemia",
      title: "Anemia",
      titleTamil: "இரத்த சோகை",
      description: "Iron support, fatigue, and nourishment",
      icon: "🥗",
      color: "rgba(184,212,190,0.2)",
      postCount: 0
   },
   {
      id: "Menstrual Health",
      title: "Menstrual Health",
      titleTamil: "மாதவிடாய் ஆரோக்கியம்",
      description: "Open, stigma-free period care",
      icon: "🌙",
      color: "rgba(155,142,196,0.15)",
      postCount: 0
   },
   {
      id: "Home Remedies",
      title: "Home Remedies",
      titleTamil: "வீட்டு வைத்தியம்",
      description: "Cultural remedies with care",
      icon: "🌿",
      color: "rgba(184,212,190,0.25)",
      postCount: 0
   },
   {
      id: "General Wellness",
      title: "General Wellness",
      titleTamil: "பொது ஆரோக்கியம்",
      description: "Everyday wellbeing and emotional balance",
      icon: "💫",
      color: "rgba(196,149,106,0.1)",
      postCount: 0
   }
];

const forumPosts = [
   {
      userId: "seed-user",
      anonName: "Anon#2847",
      topic: "PCOS",
      type: "question",
      title: "Inositol experiences?",
      content: "Has anyone tried inositol supplements for PCOS? My doctor mentioned it and I wanted to hear real experiences before starting.",
      imageUrl: null,
      upvotes: 14,
      upvotedBy: [],
      commentCount: 2,
      approved: true,
      moderation: {
         sentiment: "neutral",
         safetyScore: 78,
         flags: ["safe"],
         geminiCheck: false
      },
      isPinned: true,
      isExpertAnswered: false,
      daysAgo: 3
   },
   {
      userId: "seed-user",
      anonName: "Anon#5631",
      topic: "PCOS",
      type: "text",
      title: "Feeling less alone",
      content: "I was diagnosed with PCOS last year and felt so alone. Finding this community helped me realize how common it is. You are not alone.",
      imageUrl: null,
      upvotes: 32,
      upvotedBy: [],
      commentCount: 1,
      approved: true,
      moderation: {
         sentiment: "positive",
         safetyScore: 92,
         flags: ["safe"],
         geminiCheck: false
      },
      isPinned: false,
      isExpertAnswered: false,
      daysAgo: 5
   },
   {
      userId: "seed-user",
      anonName: "Anon#9012",
      topic: "PCOS",
      type: "text",
      title: "Gentle lifestyle changes",
      content: "Small shifts helped me: slow walks, reducing refined sugar, and calming routines. Always work with your doctor for personal care.",
      imageUrl: null,
      upvotes: 67,
      upvotedBy: [],
      commentCount: 3,
      approved: true,
      moderation: {
         sentiment: "positive",
         safetyScore: 94,
         flags: ["safe"],
         geminiCheck: false
      },
      isPinned: false,
      isExpertAnswered: true,
      daysAgo: 7
   },
   {
      userId: "seed-user",
      anonName: "Anon#9134",
      topic: "Anemia",
      type: "text",
      title: "Ragi helped me",
      content: "My hemoglobin was 8.2 and I felt exhausted constantly. Started eating ragi every morning and drumstick leaves curry 3x a week. After 2 months it went up to 10.5.",
      imageUrl: null,
      upvotes: 45,
      upvotedBy: [],
      commentCount: 0,
      approved: true,
      moderation: {
         sentiment: "positive",
         safetyScore: 90,
         flags: ["safe"],
         geminiCheck: false
      },
      isPinned: false,
      isExpertAnswered: false,
      daysAgo: 2
   },
   {
      userId: "seed-user",
      anonName: "Anon#3372",
      topic: "Anemia",
      type: "question",
      title: "Vitamin C with iron?",
      content: "Does eating iron-rich food with vitamin C help absorption? I heard you should eat amla or lemon alongside iron foods.",
      imageUrl: null,
      upvotes: 19,
      upvotedBy: [],
      commentCount: 2,
      approved: true,
      moderation: {
         sentiment: "neutral",
         safetyScore: 78,
         flags: ["safe"],
         geminiCheck: false
      },
      isPinned: false,
      isExpertAnswered: false,
      daysAgo: 1
   },
   {
      userId: "seed-user",
      anonName: "Anon#6755",
      topic: "Anemia",
      type: "text",
      title: "Absorption tips",
      content: "Vitamin C can help. Squeeze lemon on greens, eat amla chutney, and avoid tea/coffee right after meals.",
      imageUrl: null,
      upvotes: 89,
      upvotedBy: [],
      commentCount: 1,
      approved: true,
      moderation: {
         sentiment: "positive",
         safetyScore: 93,
         flags: ["safe"],
         geminiCheck: false
      },
      isPinned: false,
      isExpertAnswered: true,
      daysAgo: 1
   },
   {
      userId: "seed-user",
      anonName: "Anon#7821",
      topic: "Menstrual Health",
      type: "text",
      title: "Your pain is valid",
      content: "I used to think severe cramps were normal. Turns out I had endometriosis. Please don’t ignore very painful periods — it is okay to seek help.",
      imageUrl: null,
      upvotes: 78,
      upvotedBy: [],
      commentCount: 2,
      approved: true,
      moderation: {
         sentiment: "neutral",
         safetyScore: 86,
         flags: ["safe"],
         geminiCheck: false
      },
      isPinned: false,
      isExpertAnswered: false,
      daysAgo: 4
   },
   {
      userId: "seed-user",
      anonName: "Anon#4409",
      topic: "Menstrual Health",
      type: "question",
      title: "Mood swings before periods",
      content: "Does anyone else struggle with mood swings a week before periods? I feel like a completely different person.",
      imageUrl: null,
      upvotes: 23,
      upvotedBy: [],
      commentCount: 0,
      approved: true,
      moderation: {
         sentiment: "neutral",
         safetyScore: 78,
         flags: ["safe"],
         geminiCheck: false
      },
      isPinned: false,
      isExpertAnswered: false,
      hoursAgo: 6
   },
   {
      userId: "seed-user",
      anonName: "Anon#1156",
      topic: "Home Remedies",
      type: "text",
      title: "Methi seeds and cycles",
      content: "My grandmother swore by methi seeds soaked overnight for irregular periods. I tried it for 2 months and my cycle felt more regular.",
      imageUrl: null,
      upvotes: 31,
      upvotedBy: [],
      commentCount: 1,
      approved: true,
      moderation: {
         sentiment: "positive",
         safetyScore: 88,
         flags: ["safe"],
         geminiCheck: false
      },
      isPinned: false,
      isExpertAnswered: false,
      daysAgo: 8
   },
   {
      userId: "seed-user",
      anonName: "Anon#6683",
      topic: "Home Remedies",
      type: "text",
      title: "Pregnancy caution",
      content: "Please be careful with home remedies during pregnancy. Some herbs that are fine normally can be harmful. Always tell your doctor what you are taking.",
      imageUrl: null,
      upvotes: 54,
      upvotedBy: [],
      commentCount: 0,
      approved: true,
      moderation: {
         sentiment: "neutral",
         safetyScore: 84,
         flags: ["safe"],
         geminiCheck: false
      },
      isPinned: false,
      isExpertAnswered: false,
      daysAgo: 3
   },
   {
      userId: "seed-user",
      anonName: "Anon#8847",
      topic: "General Wellness",
      type: "text",
      title: "Tracking patterns",
      content: "Started tracking my sleep, water intake, and mood alongside my cycle. The patterns were eye-opening, especially two days before my period.",
      imageUrl: null,
      upvotes: 41,
      upvotedBy: [],
      commentCount: 0,
      approved: true,
      moderation: {
         sentiment: "positive",
         safetyScore: 90,
         flags: ["safe"],
         geminiCheck: false
      },
      isPinned: false,
      isExpertAnswered: false,
      daysAgo: 2
   },
   {
      userId: "seed-user",
      anonName: "Anon#3301",
      topic: "General Wellness",
      type: "text",
      title: "It is okay to not be okay",
      content: "Mental health is also women's health. It is okay to not be okay sometimes. You are seen here.",
      imageUrl: null,
      upvotes: 96,
      upvotedBy: [],
      commentCount: 0,
      approved: true,
      moderation: {
         sentiment: "positive",
         safetyScore: 92,
         flags: ["safe"],
         geminiCheck: false
      },
      isPinned: false,
      isExpertAnswered: false,
      daysAgo: 10
   }
];

const doctorsData = [
   {
      id: "dr_anjali",
      name: "Dr. Anjali Desai",
      specialty: "Gynecologist",
      location: { latitude: 13.0827, longitude: 80.2707 }, // Chennai
      address: "Anna Nagar, Chennai",
      phone: "+91 98765 43210",
      rating: 4.8,
      isVerified: true,
      availableForQA: true,
      image: "https://randomuser.me/api/portraits/women/68.jpg"
   },
   {
      id: "dr_priya",
      name: "Dr. Priya Sharma",
      specialty: "Reproductive Endocrinologist",
      location: { latitude: 12.9716, longitude: 77.5946 }, // Bangalore
      address: "Indiranagar, Bangalore",
      phone: "+91 91234 56789",
      rating: 4.9,
      isVerified: true,
      availableForQA: true,
      image: "https://randomuser.me/api/portraits/women/44.jpg"
   },
   {
      id: "dr_lakshmi",
      name: "Dr. Lakshmi Iyer",
      specialty: "Nutritionist",
      location: { latitude: 19.0760, longitude: 72.8777 }, // Mumbai
      address: "Bandra West, Mumbai",
      phone: "+91 99887 76655",
      rating: 4.7,
      isVerified: true,
      availableForQA: false,
      image: "https://randomuser.me/api/portraits/women/33.jpg"
   }
];

const sampleJournalEntries = [
   {
      userId: "seed-user",
      date: new Date().toISOString().split('T')[0], // Today
      mood: "Neutral",
      symptoms: ["Mild Cramps", "Fatigue"],
      energyLevel: 5,
      waterIntake: 4,
      sleepHours: 7,
      notes: "Felt a bit tired today, maybe due to upcoming cycle.",
      createdAt: new Date()
   },
   {
      userId: "seed-user",
      date: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Yesterday
      mood: "Happy",
      symptoms: [],
      energyLevel: 8,
      waterIntake: 8,
      sleepHours: 8,
      notes: "Great yoga session in the morning!",
      createdAt: new Date(Date.now() - 86400000)
   }
];

const sampleQA = [
   {
      userId: "seed-user",
      doctorId: "dr_anjali",
      question: "Is it normal to have irregular periods in my 20s?",
      answer: "While some variation is normal, consistent irregularity (cycles < 21 or > 35 days) should be checked. It could be stress, or conditions like PCOS.",
      status: "answered",
      isPublic: true,
      createdAt: new Date(Date.now() - 172800000), // 2 days ago
      answeredAt: new Date(Date.now() - 86400000)
   },
   {
      userId: "seed-user",
      doctorId: "dr_priya",
      question: "What diet is best for Anemia?",
      answer: null,
      status: "open",
      isPublic: true,
      createdAt: new Date(),
      answeredAt: null
   }
];

import { auth } from '../firebase/firebaseConfig';
import { signInAnonymously } from 'firebase/auth';

export const seedFirestore = async () => {
   console.log('🌱 Starting seeding process...');
   const logs = [];

   try {
      // 0. Ensure Authentication
      if (!auth.currentUser) {
         logs.push('🔑 Signing in anonymously for permissions...');
         await signInAnonymously(auth);
         logs.push('✅ Signed in.');
      }

      // 1. Seed Forum Topics
      const topicsRef = collection(db, 'forum_topics');
      const topicsSnapshot = await getDocs(topicsRef);

      if (topicsSnapshot.empty) {
         console.log('Seeding forum topics...');
         logs.push('Seeding forum topics...');

         const topicPromises = forumTopics.map(topic =>
            setDoc(doc(db, 'forum_topics', topic.id), {
               ...topic,
               createdAt: serverTimestamp()
            })
         );
         await Promise.all(topicPromises);

         console.log('✅ Forum topics seeded.');
         logs.push('✅ Forum topics seeded.');
      } else {
         console.log('Skipping forum topics (already exist).');
         logs.push('Skipping forum topics (already exist).');
      }

      // 2. Seed Forum Posts
      const postsRef = collection(db, 'forum_posts');
      const postsSnapshot = await getDocs(postsRef);

      if (postsSnapshot.empty) {
         console.log('Seeding forum posts...');
         logs.push('Seeding forum posts...');

         const postPromises = forumPosts.map(post => {
            const timestamp = post.daysAgo
               ? new Date(Date.now() - post.daysAgo * 24 * 60 * 60 * 1000)
               : new Date(Date.now() - (post.hoursAgo || 0) * 60 * 60 * 1000);

            return addDoc(collection(db, 'forum_posts'), {
               ...post,
               topic: post.topic,
               moderation: {
                  sentiment: post.moderation?.sentiment || 'neutral',
                  safetyScore: post.moderation?.safetyScore || 80,
                  flags: post.moderation?.flags || ['safe'],
                  geminiCheck: false,
                  moderatedAt: timestamp
               },

               createdAt: timestamp,
               approved: true,
               upvotes: post.upvotes || 0,
               commentCount: post.commentCount || 0,
               language: 'en' // Default language for original seed data
            });
         });
         await Promise.all(postPromises);

         console.log('✅ Forum posts seeded.');
         logs.push('✅ Forum posts seeded.');
      } else {
         console.log('Skipping forum posts (already exist).');
         logs.push('Skipping forum posts (already exist).');
      }

      // 3. Seed Remedies
      const remediesRef = collection(db, 'remedies');
      const remediesSnapshot = await getDocs(remediesRef);

      if (remediesSnapshot.empty) {
         console.log('Seeding remedies...');
         logs.push('Seeding remedies...');

         // Batch remedies if array is large
         const remedyPromises = remediesData.map(remedy =>
            addDoc(collection(db, 'remedies'), {
               ...remedy,
               createdAt: serverTimestamp()
            })
         );
         await Promise.all(remedyPromises);

         console.log('✅ Remedies seeded.');
         logs.push('✅ Remedies seeded.');
      } else {
         console.log('Skipping remedies (already exist).');
         logs.push('Skipping remedies (already exist).');
      }

      // 4. Seed Doctors (New)
      const doctorsRef = collection(db, 'doctors');
      const doctorsSnapshot = await getDocs(doctorsRef);

      if (doctorsSnapshot.empty) {
         console.log('Seeding doctors...');
         logs.push('Seeding doctors...');
         const doctorPromises = doctorsData.map(docData => {
            // Create a proper geopoint if needed, but for now simple object is fine 
            // unless using GeoFire directly. Storing as map is safer for basic display.
            return setDoc(doc(db, 'doctors', docData.id), {
               ...docData,
               createdAt: serverTimestamp()
            });
         });
         await Promise.all(doctorPromises);
         console.log('✅ Doctors seeded.');
         logs.push('✅ Doctors seeded.');
      } else {
         console.log('Skipping doctors (already exist).');
      }

      // 5. Seed Journal Entries (New)
      const journalRef = collection(db, 'journal_entries');
      const journalSnapshot = await getDocs(journalRef);

      if (journalSnapshot.empty) {
         console.log('Seeding journal entries...');
         logs.push('Seeding journal entries...');
         const journalPromises = sampleJournalEntries.map(entry =>
            addDoc(collection(db, 'journal_entries'), {
               ...entry,
               createdAt: serverTimestamp() // convert Date to Timestamp
            })
         );
         await Promise.all(journalPromises);
         console.log('✅ Journal entries seeded.');
         logs.push('✅ Journal entries seeded.');
      }

      // 6. Seed QA (New)
      const qaRef = collection(db, 'doctor_qa');
      const qaSnapshot = await getDocs(qaRef);

      if (qaSnapshot.empty) {
         console.log('Seeding QA...');
         logs.push('Seeding QA...');
         const qaPromises = sampleQA.map(qa =>
            addDoc(collection(db, 'doctor_qa'), {
               ...qa,
               createdAt: serverTimestamp(),
               answeredAt: qa.answeredAt ? serverTimestamp() : null
            })
         );
         await Promise.all(qaPromises);
         console.log('✅ Doctor QA seeded.');
         logs.push('✅ Doctor QA seeded.');
      }

      console.log('🎉 Database seeding completed!');
      logs.push('🎉 Database seeding completed!');
      return { success: true, logs };

   } catch (error) {
      console.error('Error seeding database:', error);
      logs.push(`❌ Error: ${error.message}`);
      return { success: false, error: error.message, logs };
   }
};
