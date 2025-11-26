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
  } else {
    // ログアウト中
    if (authSection) authSection.style.display = 'block';
    if (userSection) userSection.style.display = 'none';
  }
});