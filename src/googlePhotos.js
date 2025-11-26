// Google Identity Services の初期化
export const initGoogleAuth = () => {
  console.log('Google認証を初期化中...');
  
  if (typeof google !== 'undefined' && google.accounts) {
    tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: 'https://www.googleapis.com/auth/photoslibrary.readonly',
      callback: (response) => {
        console.log('Google認証レスポンス:', response);
        
        if (response.access_token) {
          accessToken = response.access_token;
          console.log('Google認証成功!');
          console.log('取得したスコープ:', response.scope);
          onAuthSuccess();
        } else if (response.error) {
          console.error('Google認証エラー詳細:', response);
          alert('認証エラー: ' + response.error + '\n詳細: ' + (response.error_description || ''));
        }
      },
    });
  }
};