// src/app.js
import { signUp, signIn, logOut, watchAuthState } from './auth.js';
import { initGoogleAuth, startGoogleAuth } from './googlePhotos.js';

// DOM要素の取得
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const logoutBtn = document.getElementById('logout-btn');
const authSection = document.getElementById('auth');
const userSection = document.getElementById('user-section');
const userEmail = document.getElementById('user-email');
const googleSigninBtn = document.getElementById('google-signin-btn');
const photosStatus = document.getElementById('photos-status');

// Google認証の初期化
window.addEventListener('load', () => {
  initGoogleAuth();
});

// Google Photosサインインボタン
if (googleSigninBtn) {
  googleSigninBtn.addEventListener('click', async () => {
    startGoogleAuth();
  });
}

// ログインフォーム送信
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    const result = await signIn(email, password);
    if (result.success) {
      alert('ログインしました！');
      loginForm.reset();
    } else {
      alert('ログインエラー: ' + result.error);
    }
  });
}

// 登録フォーム送信
if (signupForm) {
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    
    const result = await signUp(email, password);
    if (result.success) {
      alert('登録完了しました！');
      signupForm.reset();
    } else {
      alert('登録エラー: ' + result.error);
    }
  });
}

// ログアウトボタン
if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    const result = await logOut();
    if (result.success) {
      alert('ログアウトしました');
    }
  });
}

// 認証状態の監視
watchAuthState((user) => {
  if (user) {
    // ログイン中
    if (authSection) authSection.style.display = 'none';
    if (userSection) userSection.style.display = 'block';
    if (userEmail) userEmail.textContent = user.email;
    
    // ユーザー名を取得（メールアドレスの@前の部分）
    const userName = document.getElementById('user-name');
    if (userName) {
      userName.textContent = user.email.split('@')[0];
    }
    
    // アカウント作成日を表示
    const joinDate = document.getElementById('join-date');
    if (joinDate && user.metadata && user.metadata.creationTime) {
      const date = new Date(user.metadata.creationTime);
      joinDate.textContent = date.toLocaleDateString('ja-JP');
    }
    
    // プロフィールアイコンの頭文字
    const profileIcon = document.querySelector('.profile-icon text');
    if (profileIcon) {
      profileIcon.textContent = user.email.charAt(0).toUpperCase();
    }
    
    // index.htmlにいる場合は自動的にmypage.htmlへリダイレクト
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
      // ログイン後、マイページ以外にいる場合はリダイレクトしない
    }
    
  } else {
    // ログアウト中
    if (authSection) authSection.style.display = 'block';
    if (userSection) userSection.style.display = 'none';
    
    // mypage.htmlにいる場合は、ログインフォームを表示
    if (window.location.pathname.includes('mypage.html')) {
      if (authSection) authSection.style.display = 'block';
    }
  }
});