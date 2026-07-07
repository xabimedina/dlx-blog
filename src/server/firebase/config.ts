// Inicialización del SDK de Firebase Admin (solo servidor).
import 'server-only'; // Ensure server-only is imported first
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

// Initialize Firebase Admin SDK (reutiliza la misma app si ya existe)
const app =
  getApps()[0] ??
  initializeApp({
    credential: cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      privateKey: process.env.PRIVATE_KEY?.replace(/\\n/g, '\n'),
      clientEmail: process.env.CLIENT_EMAIL,
    }),
  });

const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

export const db = getFirestore(app);
export const storage = getStorage(app).bucket(storageBucket);
