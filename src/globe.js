// src/globe.js
import { auth } from './firebase.js';
import { watchAuthState } from './auth.js';
import { getUserPosts } from './posts.js';

// Three.jsのシーン設定
let scene, camera, renderer, globe, controls;
let visitedPrefectures = new Set();
let prefecturePhotoCounts = {};
let visitedCountries = new Set(); // 海外の国
let countryPhotoCounts = {}; // 海外の国ごとの写真数
let markers = [];
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();

// 都道府県の3D座標（緯度経度から計算）
const prefectureCoordinates = {
  '北海道': { lat: 43.064, lon: 141.347 },
  '青森県': { lat: 40.824, lon: 140.740 },
  '岩手県': { lat: 39.704, lon: 141.153 },
  '宮城県': { lat: 38.269, lon: 140.872 },
  '秋田県': { lat: 39.719, lon: 140.103 },
  '山形県': { lat: 38.241, lon: 140.364 },
  '福島県': { lat: 37.750, lon: 140.468 },
  '茨城県': { lat: 36.341, lon: 140.447 },
  '栃木県': { lat: 36.566, lon: 139.883 },
  '群馬県': { lat: 36.391, lon: 139.061 },
  '埼玉県': { lat: 35.857, lon: 139.649 },
  '千葉県': { lat: 35.605, lon: 140.123 },
  '東京都': { lat: 35.690, lon: 139.692 },
  '神奈川県': { lat: 35.448, lon: 139.643 },
  '新潟県': { lat: 37.902, lon: 139.023 },
  '富山県': { lat: 36.696, lon: 137.214 },
  '石川県': { lat: 36.595, lon: 136.626 },
  '福井県': { lat: 36.065, lon: 136.222 },
  '山梨県': { lat: 35.664, lon: 138.568 },
  '長野県': { lat: 36.651, lon: 138.181 },
  '岐阜県': { lat: 35.391, lon: 136.722 },
  '静岡県': { lat: 34.977, lon: 138.383 },
  '愛知県': { lat: 35.180, lon: 136.907 },
  '三重県': { lat: 34.730, lon: 136.509 },
  '滋賀県': { lat: 35.004, lon: 135.869 },
  '京都府': { lat: 35.021, lon: 135.756 },
  '大阪府': { lat: 34.686, lon: 135.520 },
  '兵庫県': { lat: 34.691, lon: 135.183 },
  '奈良県': { lat: 34.685, lon: 135.833 },
  '和歌山県': { lat: 34.226, lon: 135.168 },
  '鳥取県': { lat: 35.504, lon: 134.238 },
  '島根県': { lat: 35.472, lon: 133.051 },
  '岡山県': { lat: 34.662, lon: 133.935 },
  '広島県': { lat: 34.397, lon: 132.460 },
  '山口県': { lat: 34.186, lon: 131.471 },
  '徳島県': { lat: 34.066, lon: 134.559 },
  '香川県': { lat: 34.340, lon: 134.043 },
  '愛媛県': { lat: 33.842, lon: 132.766 },
  '高知県': { lat: 33.560, lon: 133.531 },
  '福岡県': { lat: 33.606, lon: 130.418 },
  '佐賀県': { lat: 33.250, lon: 130.299 },
  '長崎県': { lat: 32.745, lon: 129.874 },
  '熊本県': { lat: 32.790, lon: 130.742 },
  '大分県': { lat: 33.238, lon: 131.613 },
  '宮崎県': { lat: 31.911, lon: 131.424 },
  '鹿児島県': { lat: 31.560, lon: 130.558 },
  '沖縄県': { lat: 26.212, lon: 127.681 }
};

// 主要国の座標（首都の位置）
const countryCoordinates = {
  'アメリカ': { lat: 38.9072, lon: -77.0369 },
  'カナダ': { lat: 45.4215, lon: -75.6972 },
  'メキシコ': { lat: 19.4326, lon: -99.1332 },
  'イギリス': { lat: 51.5074, lon: -0.1278 },
  'フランス': { lat: 48.8566, lon: 2.3522 },
  'ドイツ': { lat: 52.5200, lon: 13.4050 },
  'イタリア': { lat: 41.9028, lon: 12.4964 },
  'スペイン': { lat: 40.4168, lon: -3.7038 },
  'オランダ': { lat: 52.3676, lon: 4.9041 },
  'スイス': { lat: 46.9480, lon: 7.4474 },
  'オーストリア': { lat: 48.2082, lon: 16.3738 },
  'ベルギー': { lat: 50.8503, lon: 4.3517 },
  'ポルトガル': { lat: 38.7223, lon: -9.1393 },
  'ギリシャ': { lat: 37.9838, lon: 23.7275 },
  '中国': { lat: 39.9042, lon: 116.4074 },
  '韓国': { lat: 37.5665, lon: 126.9780 },
  '台湾': { lat: 25.0330, lon: 121.5654 },
  'タイ': { lat: 13.7563, lon: 100.5018 },
  'ベトナム': { lat: 21.0285, lon: 105.8542 },
  'シンガポール': { lat: 1.3521, lon: 103.8198 },
  'マレーシア': { lat: 3.1390, lon: 101.6869 },
  'インドネシア': { lat: -6.2088, lon: 106.8456 },
  'フィリピン': { lat: 14.5995, lon: 120.9842 },
  'インド': { lat: 28.6139, lon: 77.2090 },
  'オーストラリア': { lat: -35.2809, lon: 149.1300 },
  'ニュージーランド': { lat: -41.2865, lon: 174.7762 },
  'ブラジル': { lat: -15.8267, lon: -47.9218 },
  'アルゼンチン': { lat: -34.6037, lon: -58.3816 },
  'チリ': { lat: -33.4489, lon: -70.6693 },
  'エジプト': { lat: 30.0444, lon: 31.2357 },
  '南アフリカ': { lat: -25.7479, lon: 28.2293 },
  'トルコ': { lat: 39.9334, lon: 32.8597 },
  'ロシア': { lat: 55.7558, lon: 37.6173 },
  'アラブ首長国連邦': { lat: 25.2048, lon: 55.2708 },
  'サウジアラビア': { lat: 24.7136, lon: 46.6753 }
};

// 緯度経度から3D座標に変換
function latLonToVector3(lat, lon, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);

  return new THREE.Vector3(x, y, z);
}

// 初期化
function init() {
  const container = document.getElementById('globe-container');

  // シーンの作成
  scene = new THREE.Scene();

  // カメラの作成
  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  // 日本を正面に向ける（緯度36°、経度138°あたり）
camera.position.set(50, 50, 250);
camera.lookAt(0, 0, 0);

  // レンダラーの作成
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  container.appendChild(renderer.domElement);

  // 地球の作成（カスタムテクスチャ）
const geometry = new THREE.SphereGeometry(100, 64, 64);

// 一旦青い球体として作成（後でテクスチャを適用）
const material = new THREE.MeshPhongMaterial({
  color: 0x3b82f6,  // 鮮やかな青（海の色）
  shininess: 5
});
globe = new THREE.Mesh(geometry, material);
scene.add(globe);


  // ライトの追加
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(5, 3, 5);
  scene.add(directionalLight);

// OrbitControlsの追加（マウス/タッチ操作）
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 150;
  controls.maxDistance = 500;
  controls.enablePan = false;
  controls.autoRotate = false;

  // マウスクリックイベント
  renderer.domElement.addEventListener('click', onMarkerClick);
  renderer.domElement.addEventListener('touchstart', onMarkerClick);

  // ウィンドウリサイズ対応
  window.addEventListener('resize', onWindowResize);

  // ローディング非表示
  document.getElementById('loading').style.display = 'none';

  // カスタムテクスチャを作成
  createCustomTexture();

  // アニメーション開始
  animate();
}

// アニメーション
function animate() {
  requestAnimationFrame(animate);

 // OrbitControlsを更新（滑らかな動きのため）
  controls.update();

  renderer.render(scene, camera);
}

// ウィンドウリサイズ
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// 訪問済み都道府県にマーカーを追加
function addVisitedMarkers() {
  // 既存のマーカーを削除
  markers.forEach(marker => scene.remove(marker));
  markers = [];
  
  visitedPrefectures.forEach(prefName => {
    const coord = prefectureCoordinates[prefName];
    if (coord) {
      const position = latLonToVector3(coord.lat, coord.lon, 102);
      
      // 緑色のマーカー（大きく目立つように）
      const markerGeometry = new THREE.SphereGeometry(3, 16, 16);
      const markerMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x10b981,
        transparent: true,
        opacity: 0.9
      });
      const marker = new THREE.Mesh(markerGeometry, markerMaterial);
      marker.position.copy(position);
      
      // マーカーにデータを保存
      marker.userData = {
        prefecture: prefName,
        photoCount: prefecturePhotoCounts[prefName] || 0,
        coordinate: coord
      };
      
      scene.add(marker);
      markers.push(marker);
    }
  });
  
  // 海外の国のマーカーを追加
  visitedCountries.forEach(countryName => {
    const coord = countryCoordinates[countryName];
    if (coord) {
      const position = latLonToVector3(coord.lat, coord.lon, 102);
      
      // オレンジ色のマーカー（海外を区別）
      const markerGeometry = new THREE.SphereGeometry(4, 16, 16); // 少し大きく
      const markerMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xf59e0b, // オレンジ色
        transparent: true,
        opacity: 0.9
      });
      const marker = new THREE.Mesh(markerGeometry, markerMaterial);
      marker.position.copy(position);
      
      // マーカーにデータを保存
      marker.userData = {
        country: countryName,
        photoCount: countryPhotoCounts[countryName] || 0,
        coordinate: coord,
        isOverseas: true // 海外フラグ
      };
      
      scene.add(marker);
      markers.push(marker);
    }
  });
}

// 訪問済み都道府県を集計
function displayVisitedPrefectures(posts) {
  visitedPrefectures.clear();
  prefecturePhotoCounts = {};
  visitedCountries.clear();
  countryPhotoCounts = {};

  posts.forEach(post => {
    if (post.prefecture === '海外' && post.country) {
      // 海外の場合
      visitedCountries.add(post.country);
      countryPhotoCounts[post.country] = (countryPhotoCounts[post.country] || 0) + 1;
    } else if (post.prefecture && post.prefecture !== '海外') {
      // 国内の場合
      visitedPrefectures.add(post.prefecture);
      prefecturePhotoCounts[post.prefecture] = (prefecturePhotoCounts[post.prefecture] || 0) + 1;
    }
  });

  // マーカーを追加
  addVisitedMarkers();

  // 統計を更新（国内+海外の合計）
  const totalVisited = visitedPrefectures.size + visitedCountries.size;
  document.getElementById('visited-count').textContent = totalVisited;
  document.getElementById('photos-total').textContent = posts.length;
}

// 認証状態の監視
watchAuthState(async (user) => {
  if (user) {
    const result = await getUserPosts(user.uid);
    if (result.success && result.posts.length > 0) {
      displayVisitedPrefectures(result.posts);
    }
  } else {
    window.location.href = 'mypage.html';
  }
});

// カスタムテクスチャを作成（白い陸地 + 青い海 + 黒い境界線）
async function createCustomTexture() {
  try {
    // 世界地図のGeoJSONを取得
    const response = await fetch('https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson');
    const worldData = await response.json();
    
    // 日本のGeoJSONも取得
    const japanResponse = await fetch('./assets/data/japan.geojson');
    const japanData = await japanResponse.json();
    
    // Canvasでテクスチャを作成
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    
    // 背景を青色（海）で塗りつぶし
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 陸地を白で描画
    ctx.fillStyle = 'rgba(255, 255, 255, 1.0)';  // 完全不透明の白
ctx.strokeStyle = '#000000';
ctx.lineWidth = 1; 
    
    // 世界の国々を描画
    worldData.features.forEach(feature => {
      drawGeoJSON(ctx, feature, canvas.width, canvas.height);
    });
    
    // 日本の都道府県境界を描画
    japanData.features.forEach(feature => {
      drawGeoJSON(ctx, feature, canvas.width, canvas.height, true);
    });
    
    // CanvasをテクスチャとしてThree.jsに適用
    const texture = new THREE.CanvasTexture(canvas);
    globe.material.map = texture;
    globe.material.needsUpdate = true;
    
  } catch (error) {
    console.error('テクスチャ作成エラー:', error);
  }
}

// GeoJSONをCanvasに描画する関数
function drawGeoJSON(ctx, feature, width, height, isJapan = false) {
  const geometry = feature.geometry;
  
  if (geometry.type === 'Polygon') {
    drawPolygon(ctx, geometry.coordinates, width, height);
  } else if (geometry.type === 'MultiPolygon') {
    geometry.coordinates.forEach(polygon => {
      drawPolygon(ctx, polygon, width, height);
    });
  }
}

// ポリゴンを描画
function drawPolygon(ctx, coordinates, width, height) {
  coordinates.forEach(ring => {
    ctx.beginPath();
    ring.forEach((coord, i) => {
      const x = ((coord[0] + 180) / 360) * width;
      const y = ((90 - coord[1]) / 180) * height;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  });
}

// マーカークリック処理
function onMarkerClick(event) {
  event.preventDefault();
  
  // マウス座標を正規化（-1 〜 +1）
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX || event.touches[0].clientX) - rect.left) / rect.width * 2 - 1;
  mouse.y = -((event.clientY || event.touches[0].clientY) - rect.top) / rect.height * 2 + 1;
  
  // レイキャストでマーカーとの交差判定
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(markers);
  
  if (intersects.length > 0) {
    const clickedMarker = intersects[0].object;
    const data = clickedMarker.userData;
    
    // ポップアップを表示
    showPopup(data);
    
    // その地域にズーム
    zoomToLocation(data.coordinate);
  }
}

// ポップアップ表示
function showPopup(data) {
  // 既存のポップアップを削除
  const existingPopup = document.getElementById('marker-popup');
  if (existingPopup) existingPopup.remove();
  
  // 表示名を決定（都道府県 or 国名）
  const locationName = data.isOverseas ? data.country : data.prefecture;
  const markerColor = data.isOverseas ? '#f59e0b' : '#10b981';
  
  // 新しいポップアップを作成
  const popup = document.createElement('div');
  popup.id = 'marker-popup';
  popup.innerHTML = `
    <div style="
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(255, 255, 255, 0.95);
      padding: 20px 30px;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
      z-index: 1000;
      min-width: 200px;
      text-align: center;
      border-top: 4px solid ${markerColor};
    ">
      <h3 style="margin: 0 0 10px 0; color: #1e293b; font-size: 20px;">${locationName}</h3>
      <p style="margin: 0; color: #64748b; font-size: 16px;">${data.photoCount}枚の写真</p>
      <button onclick="document.getElementById('marker-popup').remove()" style="
        margin-top: 15px;
        padding: 8px 20px;
        background: ${markerColor};
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
      ">閉じる</button>
    </div>
  `;
  document.body.appendChild(popup);
  
  // 3秒後に自動で閉じる
  setTimeout(() => {
    if (document.getElementById('marker-popup')) {
      popup.remove();
    }
  }, 3000);
}

// 指定座標にズーム
function zoomToLocation(coord) {
  const targetPosition = latLonToVector3(coord.lat, coord.lon, 200);
  
  // カメラを滑らかに移動
  const startPosition = camera.position.clone();
  const duration = 1500; // 1.5秒
  const startTime = Date.now();
  
  function animateZoom() {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // イージング（滑らかな動き）
    const eased = 1 - Math.pow(1 - progress, 3);
    
    camera.position.lerpVectors(startPosition, targetPosition, eased);
    camera.lookAt(0, 0, 0);
    
    if (progress < 1) {
      requestAnimationFrame(animateZoom);
    }
  }
  
  animateZoom();
}

// ページ読み込み時に初期化
window.addEventListener('load', () => {
  init();
});