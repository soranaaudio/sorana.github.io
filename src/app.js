// src/app.js
import { auth } from './firebase.js'; // この行を追加
import { signUp, signIn, logOut, watchAuthState } from './auth.js';
import { initGoogleAuth, startGoogleAuth } from './googlePhotos.js';
import { getProfile, createDefaultProfile, saveProfile } from './profile.js'; // saveProfileを追加

// DOM要素の取得
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const logoutBtn = document.getElementById('logout-btn');
const authSection = document.getElementById('auth');
const userSection = document.getElementById('user-section');
const userEmail = document.getElementById('user-email');
const googleSigninBtn = document.getElementById('google-signin-btn');
const photosStatus = document.getElementById('photos-status');
const logoutNavBtn = document.querySelector('.logout-nav-button');
const prefectureSelect = document.getElementById('prefecture-select');

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

// プロフィール情報を表示する関数（新規追加）
async function displayProfile(user) {
  // プロフィール取得
  const profileResult = await getProfile(user.uid);
  
  let profile;
  if (profileResult.success && profileResult.data) {
    // 既存プロフィールがある
    profile = profileResult.data;
  } else {
    // 初回ログイン：デフォルトプロフィール作成
    await createDefaultProfile(user.uid, user.email);
    const newProfileResult = await getProfile(user.uid);
    profile = newProfileResult.data;
  }
  
  // ユーザー名を表示
  const userName = document.getElementById('user-name');
  if (userName && profile) {
    userName.textContent = profile.displayName || user.email.split('@')[0];
  }
  
  // アイコンを表示
  const profileIcon = document.querySelector('.profile-icon svg circle');
  const profileIconText = document.querySelector('.profile-icon svg text');
  
  if (profileIcon && profile) {
    profileIcon.setAttribute('fill', profile.iconColor || '#667eea');
  }
  
  if (profileIconText && profile) {
    profileIconText.textContent = profile.iconEmoji || profile.displayName.charAt(0).toUpperCase();
  }
  // 投稿を読み込む
  await loadUserPosts(user.uid);
}

// 認証状態の監視
watchAuthState(async (user) => {  // ← ここにasyncを追加
  if (user) {
    // ログイン中
    if (authSection) authSection.style.display = 'none';
    if (userSection) userSection.style.display = 'block';
    if (userEmail) userEmail.textContent = user.email;
    if (logoutNavBtn) logoutNavBtn.style.display = 'inline-block';
    
    
// プロフィール情報を表示（新規追加）
    await displayProfile(user);

    // アカウント作成日を表示
    const joinDate = document.getElementById('join-date');
    if (joinDate && user.metadata && user.metadata.creationTime) {
      const date = new Date(user.metadata.creationTime);
      joinDate.textContent = date.toLocaleDateString('ja-JP');
    }
    
    // index.htmlにいる場合は自動的にmypage.htmlへリダイレクト
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
      // ログイン後、マイページ以外にいる場合はリダイレクトしない
    }
    
  } else {
    // ログアウト中
    if (authSection) authSection.style.display = 'block';
    if (userSection) userSection.style.display = 'none';
    if (logoutNavBtn) logoutNavBtn.style.display = 'none';
    // mypage.htmlにいる場合は、ログインフォームを表示
    if (window.location.pathname.includes('mypage.html')) {
      if (authSection) authSection.style.display = 'block';
    }
  }
});

// ログアウトボタン（既存の部分に追加）
if (logoutNavBtn) {
  logoutNavBtn.addEventListener('click', async () => {
    const result = await logOut();
    if (result.success) {
      alert('ログアウトしました');
      window.location.href = 'index.html';
    }
  });
}

// ==========================================
// プロフィール編集機能
// ==========================================

const editProfileBtn = document.getElementById('edit-profile-btn');
const editModal = document.getElementById('edit-profile-modal');
const modalCloseBtn = document.getElementById('modal-close-btn');
const cancelBtn = document.getElementById('cancel-btn');
const saveProfileBtn = document.getElementById('save-profile-btn');
const displayNameInput = document.getElementById('display-name-input');

// 選択中のアイコン設定
let selectedEmoji = '🌍';
let selectedColor = '#667eea';

// モーダルを開く
if (editProfileBtn) {
  editProfileBtn.addEventListener('click', async () => {
    const user = auth.currentUser;
    if (!user) return;
    
    // 現在のプロフィールを取得
    const profileResult = await getProfile(user.uid);
    if (profileResult.success && profileResult.data) {
      const profile = profileResult.data;
      selectedEmoji = profile.iconEmoji || '🌍';
      selectedColor = profile.iconColor || '#667eea';
      displayNameInput.value = profile.displayName || '';
      
      // プレビュー更新
      updatePreview();
      
      // 選択状態を反映
      document.querySelectorAll('.emoji-btn').forEach(btn => {
        btn.classList.toggle('selected', btn.dataset.emoji === selectedEmoji);
      });
      document.querySelectorAll('.color-btn').forEach(btn => {
        btn.classList.toggle('selected', btn.dataset.color === selectedColor);
      });
    }
    
    editModal.style.display = 'flex';
  });
}

// モーダルを閉じる
function closeModal() {
  if (editModal) editModal.style.display = 'none';
}

if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

// モーダル外クリックで閉じる
if (editModal) {
  editModal.addEventListener('click', (e) => {
    if (e.target === editModal) closeModal();
  });
}

// プレビュー更新
function updatePreview() {
  const previewCircle = document.getElementById('preview-circle');
  const previewText = document.getElementById('preview-text');
  
  if (previewCircle) previewCircle.setAttribute('fill', selectedColor);
  if (previewText) previewText.textContent = selectedEmoji;
}

// 絵文字選択
document.querySelectorAll('.emoji-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    selectedEmoji = btn.dataset.emoji;
    
    // 選択状態更新
    document.querySelectorAll('.emoji-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    
    updatePreview();
  });
});

// 色選択
document.querySelectorAll('.color-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    selectedColor = btn.dataset.color;
    
    // 選択状態更新
    document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    
    updatePreview();
  });
});

// プロフィール保存
if (saveProfileBtn) {
  saveProfileBtn.addEventListener('click', async () => {
    const user = auth.currentUser;
    if (!user) return;
    
    const displayName = displayNameInput.value.trim();
    
    if (!displayName) {
      alert('ユーザー名を入力してください');
      return;
    }
    
    // プロフィール保存
    const result = await saveProfile(user.uid, {
      displayName: displayName,
      iconEmoji: selectedEmoji,
      iconColor: selectedColor,
      updatedAt: new Date().toISOString()
    });
    
    if (result.success) {
      alert('プロフィールを更新しました！');
      closeModal();
      
      // 画面を再読み込みして反映
      await displayProfile(user);
    } else {
      alert('エラーが発生しました: ' + result.error);
    }
  });
}

// ==========================================
// 投稿機能
// ==========================================

import { createPost, getUserPosts } from './posts.js';

const addPostBtn = document.getElementById('add-post-btn');
const createPostModal = document.getElementById('create-post-modal');
const postModalCloseBtn = document.getElementById('post-modal-close-btn');
const postCancelBtn = document.getElementById('post-cancel-btn');
const postSaveBtn = document.getElementById('post-save-btn');
const imageInput = document.getElementById('image-input');
const imageUploadArea = document.getElementById('image-upload-area');
const uploadPlaceholder = document.getElementById('upload-placeholder');
const imagePreview = document.getElementById('image-preview');
const locationInput = document.getElementById('location-input');
const dateInput = document.getElementById('date-input');
const postsGrid = document.getElementById('posts-grid');

let selectedImageFile = null;

// 投稿モーダルを開く
if (addPostBtn) {
  addPostBtn.addEventListener('click', () => {
    // 今日の日付をデフォルトで設定
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
    
    createPostModal.style.display = 'flex';
  });
}

// 投稿モーダルを閉じる
function closePostModal() {
  if (createPostModal) {
    createPostModal.style.display = 'none';
    // フォームをリセット
    selectedImageFile = null;
    imagePreview.style.display = 'none';
    uploadPlaceholder.style.display = 'block';
    locationInput.value = '';
    dateInput.value = '';
    postSaveBtn.disabled = true;
  }
}

if (postModalCloseBtn) postModalCloseBtn.addEventListener('click', closePostModal);
if (postCancelBtn) postCancelBtn.addEventListener('click', closePostModal);

// モーダル外クリックで閉じる
if (createPostModal) {
  createPostModal.addEventListener('click', (e) => {
    if (e.target === createPostModal) closePostModal();
  });
}

// 画像選択エリアのクリック
if (imageUploadArea) {
  imageUploadArea.addEventListener('click', () => {
    imageInput.click();
  });
}

// 画像選択時
if (imageInput) {
  imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      selectedImageFile = file;
      
      // プレビュー表示
      const reader = new FileReader();
      reader.onload = (e) => {
        imagePreview.src = e.target.result;
        imagePreview.style.display = 'block';
        uploadPlaceholder.style.display = 'none';
      };
      reader.readAsDataURL(file);
      
      // 投稿ボタンの有効化チェック
      checkFormValid();
    }
  });
}

// フォーム入力時
if (locationInput) {
  locationInput.addEventListener('input', checkFormValid);
}
if (dateInput) {
  dateInput.addEventListener('input', checkFormValid);
}
// 都道府県選択時（ここに追加）
if (prefectureSelect) {
  prefectureSelect.addEventListener('change', checkFormValid);
}

// フォームの有効性チェック
function checkFormValid() {
  const isValid = selectedImageFile && 
                  prefectureSelect.value &&
                  locationInput.value.trim() && 
                  dateInput.value;
  postSaveBtn.disabled = !isValid;
}

// 投稿保存
// 投稿保存
if (postSaveBtn) {
  postSaveBtn.addEventListener('click', async () => {
    const user = auth.currentUser;
    if (!user) return;
    
    const prefecture = document.getElementById('prefecture-select').value;
    const location = locationInput.value.trim();
    const date = dateInput.value;
    
    if (!selectedImageFile || !prefecture || !location || !date) {
      alert('全ての項目を入力してください');
      return;
    }
    
    // ローディング表示
    postSaveBtn.disabled = true;
    postSaveBtn.textContent = '投稿中...';
    
    try {
      const result = await createPost(user.uid, selectedImageFile, prefecture, location, date);
      
      if (result.success) {
        alert('投稿しました！');
        closePostModal();
        
        // 投稿一覧を再読み込み
        await loadUserPosts(user.uid);
      } else {
        alert('エラーが発生しました: ' + result.error);
      }
    } catch (error) {
      alert('エラーが発生しました: ' + error.message);
    } finally {
      postSaveBtn.disabled = false;
      postSaveBtn.textContent = '投稿';
    }
  });
}

// 投稿一覧を読み込む
async function loadUserPosts(userId) {
  if (!postsGrid) return;
  
  const result = await getUserPosts(userId);
  
  if (result.success && result.posts.length > 0) {
    postsGrid.innerHTML = '';
    
    result.posts.forEach(post => {
      const postCard = document.createElement('div');
      postCard.className = 'post-card';
      postCard.innerHTML = `
        <img src="${post.imageUrl}" alt="${post.location}" class="post-image">
        <div class="post-info">
          <div class="post-location">${post.location}</div>
          <div class="post-date">${post.date}</div>
        </div>
      `;
      postsGrid.appendChild(postCard);
    });
    
    // 写真数を更新
    const photosCount = document.getElementById('photos-count');
    if (photosCount) {
      photosCount.textContent = result.posts.length;
    }
  } else {
    postsGrid.innerHTML = '<p class="no-posts">まだ投稿がありません</p>';
  }
}

