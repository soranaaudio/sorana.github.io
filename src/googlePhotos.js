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
          console.log('取得したスコープ:', response.scope);
          onAuthSuccess();
        } else if (response.error) {
          console.error('Google認証エラー詳細:', response);
          alert('認証エラー: ' + response.error + '\n詳細: ' + (response.error_description || ''));
        }
      },
    });
    console.log('Google認証クライアント初期化完了');
  }
};

// Google認証を開始
export const startGoogleAuth = () => {
  console.log('Google認証を開始...');
  console.log('要求するスコープ:', SCOPES);
  if (tokenClient) {
    tokenClient.requestAccessToken();
  } else {
    alert('Google認証が初期化されていません');
  }
};

// 認証成功時の処理
async function onAuthSuccess() {
  console.log('認証成功、写真を取得します');
  
  // トークンの詳細情報をデコード
  try {
    const tokenInfo = parseJwt(accessToken);
    console.log('=== トークン情報の詳細 ===');
    console.log('トークン情報:', tokenInfo);
    console.log('スコープ:', tokenInfo.scope);
    console.log('======================');
  } catch (e) {
    console.error('トークン解析エラー:', e);
  }
  
  await getPhotos();
}

// JWTトークンをパースする関数
function parseJwt(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));
  return JSON.parse(jsonPayload);
}

// Google Photosから写真を取得
async function getPhotos() {
  if (!accessToken) {
    alert('先にGoogle認証を完了してください');
    return;
  }

  console.log('写真を取得中... トークン:', accessToken.substring(0, 20) + '...');

  try {
    const response = await fetch('https://photoslibrary.googleapis.com/v1/mediaItems?pageSize=25', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('APIレスポンスステータス:', response.status);
    const data = await response.json();
    console.log('取得した写真:', data);

    if (data.error) {
      console.error('APIエラー:', data.error);
      alert(`エラー: ${data.error.message}`);
      return;
    }

    if (data.mediaItems && data.mediaItems.length > 0) {
      displayPhotos(data.mediaItems);
    } else {
      alert('写真が見つかりませんでした');
    }
  } catch (error) {
    console.error('写真取得エラー:', error);
    alert('写真の取得に失敗しました');
  }
}

// 写真を表示する関数
function displayPhotos(photos) {
  console.log(`${photos.length}枚の写真を表示します`);
  // TODO: UIに写真を表示する処理を実装
}

// getPhotos関数をエクスポート
export { getPhotos };