// src/profile.js
import { db } from './firebase.js';
import { 
  doc, 
  setDoc, 
  getDoc 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// プロフィール保存
export const saveProfile = async (userId, profileData) => {
  try {
    await setDoc(doc(db, 'users', userId), profileData, { merge: true });
    return { success: true };
  } catch (error) {
    console.error('Profile save error:', error);
    return { success: false, error: error.message };
  }
};

// プロフィール取得
export const getProfile = async (userId) => {
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { success: true, data: docSnap.data() };
    } else {
      return { success: true, data: null };
    }
  } catch (error) {
    console.error('Profile get error:', error);
    return { success: false, error: error.message };
  }
};

// デフォルトプロフィール作成
export const createDefaultProfile = async (userId, email) => {
  const defaultProfile = {
    displayName: email.split('@')[0],
    iconEmoji: '🌍',
    iconColor: '#667eea',
    createdAt: new Date().toISOString()
  };
  
  return await saveProfile(userId, defaultProfile);
};