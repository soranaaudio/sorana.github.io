// src/googlePhotos.js
import { GOOGLE_CLIENT_ID } from './googleConfig.js';

let tokenClient;
let accessToken = null;

// スコープを直接ここに定義
const SCOPES = 'https://www.googleapis.com/auth/photoslibrary.readonly';

// Google Identity Services の初期化
export const initGoogleAuth = () => {
  console.log('Google認証を初期化中...');
  
  if (typeof google !== 'undefined' && google.accounts) {
    tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: SCOPES, // 直接定義したスコープを使用
      callback: (response) => {
        console.log('Google認証レスポンス:', response);
        
        if (response.access_token) {
          accessToken = response.access_token;
          console.log('Google認証成功！');
          console.log('取得したスコープ:', response.scope); // スコープ確認用
          onAuthSuccess();
        } else if (response.error) {
          console.error('Google認証エラー詳細:', response);
          alert('認証エラー: ' + response.error + '\n詳細: ' + (response.error_description || ''));
        }
      },
    });
    console.log('Google認証クライアント初期化完了');
  } else {
    console.error('Google Identity Services が読み込まれていません');
    setTimeout(initGoogleAuth, 1000);
  }
};

// Google認証を開始
export const signInWithGoogle = () => {
  console.log('Google認証を開始...');
  console.log('要求するスコープ:', SCOPES); // デバッグ用
  if (tokenClient) {
    tokenClient.requestAccessToken({ prompt: 'consent' }); // 強制的に再同意を求める
  } else {
    console.error('Google認証が初期化されていません');
    alert('Google認証の準備ができていません。ページを再読み込みしてください。');
  }
};

// 認証成功後の処理
const onAuthSuccess = async () => {
  alert('Google Photos への接続に成功しました！');
  
  // トークン情報を検証
  try {
    const tokenInfoResponse = await fetch(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${accessToken}`);
    const tokenInfo = await tokenInfoResponse.json();
    console.log('=== トークン情報の詳細 ===');
    console.log('トークン情報:', tokenInfo);
    console.log('スコープ:', tokenInfo.scope);
    console.log('======================');
  } catch (error) {
    console.error('トークン情報の取得エラー:', error);
  }
  
  getPhotos();
};

// Google Photosから写真を取得
export const getPhotos = async () => {
  if (!accessToken) {
    console.error('アクセストークンがありません');
    return;
  }

  console.log('写真を取得中... トークン:', accessToken.substring(0, 20) + '...'); // デバッグ用

  try {
    const response = await fetch('https://photoslibrary.googleapis.com/v1/mediaItems?pageSize=25', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    console.log('取得した写真:', data);
    
    if (data.mediaItems) {
      console.log('写真の数:', data.mediaItems.length);
      return data.mediaItems;
    } else {
      console.error('写真が取得できませんでした');
    }
  } catch (error) {
    console.error('写真の取得エラー:', error);
  }
};