// src/googlePhotos.js
import { GOOGLE_CLIENT_ID, GOOGLE_SCOPES } from './googleConfig.js';

let tokenClient;
let accessToken = null;

// Google Identity Services の初期化
export const initGoogleAuth = () => {
  // Google Identity Services のスクリプトが読み込まれているか確認
  if (typeof google !== 'undefined') {
    tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: GOOGLE_SCOPES,
      callback: (response) => {
        if (response.access_token) {
          accessToken = response.access_token;
          console.log('Google認証成功！');
          // 認証成功後の処理
          onAuthSuccess();
        }
      },
    });
  }
};

// Google認証を開始
export const signInWithGoogle = () => {
  if (tokenClient) {
    tokenClient.requestAccessToken();
  } else {
    console.error('Google認証が初期化されていません');
  }
};

// 認証成功後の処理
const onAuthSuccess = () => {
  alert('Google Photos への接続に成功しました！');
  // ここで写真取得などの処理を行う
};

// Google Photosから写真を取得
export const getPhotos = async () => {
  if (!accessToken) {
    console.error('アクセストークンがありません');
    return;
  }

  try {
    const response = await fetch('https://photoslibrary.googleapis.com/v1/mediaItems?pageSize=25', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    console.log('取得した写真:', data);
    return data.mediaItems;
  } catch (error) {
    console.error('写真の取得エラー:', error);
  }
};