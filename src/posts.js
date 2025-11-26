// src/posts.js
import { db, storage } from './firebase.js';
import { 
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import {
  ref,
  uploadBytes,
  getDownloadURL
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';

// 画像を圧縮する関数
function compressImage(file, maxWidth = 1200, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          resolve(blob);
        }, 'image/jpeg', quality);
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
}

// 投稿を作成
export const createPost = async (userId, imageFile, prefecture, location, date) => {
  try {
    // 画像を圧縮
    const compressedImage = await compressImage(imageFile);
    
    // ファイル名を生成（タイムスタンプ + ランダム文字列）
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
    const storageRef = ref(storage, `users/${userId}/photos/${fileName}`);
    
    // Storageにアップロード
    await uploadBytes(storageRef, compressedImage);
    
    // ダウンロードURLを取得
    const imageUrl = await getDownloadURL(storageRef);
    
    // Firestoreに投稿情報を保存
    const postData = {
      userId: userId,
      imageUrl: imageUrl,
      prefecture: prefecture, // 追加
      location: location,
      date: date,
      createdAt: serverTimestamp(),
      likes: 0
    };
    
    const docRef = await addDoc(collection(db, 'posts'), postData);
    
    return { success: true, postId: docRef.id };
  } catch (error) {
    console.error('Post creation error:', error);
    return { success: false, error: error.message };
  }
};

// 自分の投稿を取得
export const getUserPosts = async (userId) => {
  try {
    const q = query(
      collection(db, 'posts'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const posts = [];
    
    querySnapshot.forEach((doc) => {
      posts.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return { success: true, posts: posts };
  } catch (error) {
    console.error('Get posts error:', error);
    return { success: false, error: error.message };
  }
};

// 全ての投稿を取得（将来的なSNS機能用）
export const getAllPosts = async () => {
  try {
    const q = query(
      collection(db, 'posts'),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const posts = [];
    
    querySnapshot.forEach((doc) => {
      posts.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return { success: true, posts: posts };
  } catch (error) {
    console.error('Get all posts error:', error);
    return { success: false, error: error.message };
  }
};