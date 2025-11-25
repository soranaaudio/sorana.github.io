// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

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
export default app;