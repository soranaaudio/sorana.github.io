// src/map.js
import { auth } from './firebase.js';
import { watchAuthState } from './auth.js';
import { getUserPosts } from './posts.js';

// 地図の初期化
let map = null;
let geojsonLayer = null;

// 都道府県の座標（中心点）
const prefectureCoordinates = {
  '北海道': [43.064, 141.347],
  '青森県': [40.824, 140.740],
  '岩手県': [39.704, 141.153],
  '宮城県': [38.269, 140.872],
  '秋田県': [39.719, 140.103],
  '山形県': [38.241, 140.364],
  '福島県': [37.750, 140.468],
  '茨城県': [36.341, 140.447],
  '栃木県': [36.566, 139.883],
  '群馬県': [36.391, 139.061],
  '埼玉県': [35.857, 139.649],
  '千葉県': [35.605, 140.123],
  '東京都': [35.690, 139.692],
  '神奈川県': [35.448, 139.643],
  '新潟県': [37.902, 139.023],
  '富山県': [36.696, 137.214],
  '石川県': [36.595, 136.626],
  '福井県': [36.065, 136.222],
  '山梨県': [35.664, 138.568],
  '長野県': [36.651, 138.181],
  '岐阜県': [35.391, 136.722],
  '静岡県': [34.977, 138.383],
  '愛知県': [35.180, 136.907],
  '三重県': [34.730, 136.509],
  '滋賀県': [35.004, 135.869],
  '京都府': [35.021, 135.756],
  '大阪府': [34.686, 135.520],
  '兵庫県': [34.691, 135.183],
  '奈良県': [34.685, 135.833],
  '和歌山県': [34.226, 135.168],
  '鳥取県': [35.504, 134.238],
  '島根県': [35.472, 133.051],
  '岡山県': [34.662, 133.935],
  '広島県': [34.397, 132.460],
  '山口県': [34.186, 131.471],
  '徳島県': [34.066, 134.559],
  '香川県': [34.340, 134.043],
  '愛媛県': [33.842, 132.766],
  '高知県': [33.560, 133.531],
  '福岡県': [33.606, 130.418],
  '佐賀県': [33.250, 130.299],
  '長崎県': [32.745, 129.874],
  '熊本県': [32.790, 130.742],
  '大分県': [33.238, 131.613],
  '宮崎県': [31.911, 131.424],
  '鹿児島県': [31.560, 130.558],
  '沖縄県': [26.212, 127.681]
};

// 訪問済み都道府県のセット（グローバル変数）
let visitedPrefectures = new Set();
let prefecturePhotoCounts = {};

// 地図の初期化
function initMap() {
  // 地図を作成（日本中心）
  map = L.map('map').setView([37.5, 137.5], 5);
  
  // タイルレイヤーを追加（薄い色）
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 18,
    opacity: 0.5
  }).addTo(map);
  
  // GeoJSONを読み込んで都道府県ポリゴンを追加
  loadPrefecturePolygons();
}

// 都道府県ポリゴンを読み込む
async function loadPrefecturePolygons() {
  try {
    // GeoJSONを取得
    const response = await fetch('https://raw.githubusercontent.com/smartnews-smri/japan-topography/main/data/prefecture.json');
    const geojsonData = await response.json();
    
    // GeoJSONレイヤーを作成
    geojsonLayer = L.geoJSON(geojsonData, {
      style: (feature) => getStyle(feature),
      onEachFeature: onEachFeature
    }).addTo(map);
    
  } catch (error) {
    console.error('GeoJSON読み込みエラー:', error);
  }
}

// 都道府県ごとのスタイルを設定
function getStyle(feature) {
  const prefName = feature.properties.nam_ja; // 都道府県名
  const isVisited = visitedPrefectures.has(prefName);
  
  return {
    fillColor: isVisited ? '#667eea' : '#e2e8f0',
    weight: 1,
    opacity: 1,
    color: '#94a3b8',
    fillOpacity: isVisited ? 0.7 : 0.3
  };
}

// 各都道府県にイベントを設定
function onEachFeature(feature, layer) {
  const prefName = feature.properties.nam_ja;
  
  // マウスオーバー時
  layer.on('mouseover', function() {
    this.setStyle({
      weight: 2,
      color: '#475569',
      fillOpacity: 0.9
    });
  });
  
  // マウスアウト時
  layer.on('mouseout', function() {
    geojsonLayer.resetStyle(this);
  });
  
  // クリック時
  layer.on('click', function() {
    const photoCount = prefecturePhotoCounts[prefName] || 0;
    const status = visitedPrefectures.has(prefName) ? '訪問済み' : '未訪問';
    layer.bindPopup(`
      <b>${prefName}</b><br>
      ${status}<br>
      ${photoCount > 0 ? `${photoCount}枚の写真` : ''}
    `).openPopup();
  });
}

// 訪問済み都道府県を表示
function displayVisitedPrefectures(posts) {
  // 訪問済み都道府県を集計
  visitedPrefectures.clear();
  prefecturePhotoCounts = {};
  
  posts.forEach(post => {
    if (post.prefecture && post.prefecture !== '海外') {
      visitedPrefectures.add(post.prefecture);
      prefecturePhotoCounts[post.prefecture] = (prefecturePhotoCounts[post.prefecture] || 0) + 1;
    }
  });
  
  // ポリゴンのスタイルを更新
  if (geojsonLayer) {
    geojsonLayer.setStyle((feature) => getStyle(feature));
  }
  
  // 統計を更新
  document.getElementById('visited-count').textContent = visitedPrefectures.size;
  document.getElementById('photos-total').textContent = posts.length;
}

// 認証状態の監視
watchAuthState(async (user) => {
  if (user) {
    // ログイン中：投稿を取得して地図に表示
    const result = await getUserPosts(user.uid);
    if (result.success && result.posts.length > 0) {
      displayVisitedPrefectures(result.posts);
    }
  } else {
    // ログアウト中：ログインページへリダイレクト
    window.location.href = 'mypage.html';
  }
});

// ページ読み込み時に地図を初期化
window.addEventListener('load', () => {
  initMap();
});