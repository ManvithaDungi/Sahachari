import fs from 'fs';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const env = fs.readFileSync(new URL('./.env', import.meta.url), 'utf8');
const cfg = {};
for (const line of env.split(/\r?\n/)) {
  if (!line || line.startsWith('#') || !line.includes('=')) continue;
  const [key, ...rest] = line.split('=');
  cfg[key.trim()] = rest.join('=').trim();
}

const firebaseConfig = {
  apiKey: cfg.VITE_FIREBASE_API_KEY,
  authDomain: cfg.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: cfg.VITE_FIREBASE_PROJECT_ID,
  storageBucket: cfg.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: cfg.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: cfg.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const postsSnap = await getDocs(collection(db, 'forum_posts'));
const topicsSnap = await getDocs(collection(db, 'forum_topics'));
const remediesSnap = await getDocs(collection(db, 'remedies'));

console.log('forum_posts docs:', postsSnap.size);
console.log('forum_topics docs:', topicsSnap.size);
console.log('remedies docs:', remediesSnap.size);
