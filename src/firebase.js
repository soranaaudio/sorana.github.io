// src/firebase.js
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js'; // 追加

const firebaseConfig = {
  apiKey: "AIzaSyCC4kC-Qqw078qlWRVcQZ5fLSf2y2PD-J8",
  authDomain: "sorana-9a752.firebaseapp.com",
  projectId: "sorana-9a752",
  storageBucket: "sorana-9a752.firebasestorage.app",
  messagingSenderId: "174339477540",
  appId: "1:174339477540:web:3be000100a388decce48b1",
  measurementId: "G-48ND337B9E"
};

// Firebaseを初期化
const app = initializeApp(firebaseConfig);

// Authenticationを初期化
export const auth = getAuth(app);

// Firestoreを初期化
export const db = getFirestore(app);

// Storageを初期化（追加）
export const storage = getStorage(app);

export default app;