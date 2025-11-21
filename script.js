// スムーズスクロール
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ナビゲーションの背景変化
window.addEventListener('scroll', () => {
    const nav = document.querySelector('.nav');
    if (window.scrollY > 50) {
        nav.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
        nav.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.05)';
    }
});

// デモプレーヤー機能
const audioData = {
    yakushima: {
        // 仮のダミー音源（後で差し替え）
        src: null,
        duration: 180 // 3分（仮）
    },
    okinawa: {
        src: null,
        duration: 180
    },
    kyoto: {
        src: null,
        duration: 180
    }
};

// 現在再生中のオーディオ
let currentAudio = null;
let currentAudioId = null;

// フォーマット時間
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// プレイボタンのイベント設定
document.querySelectorAll('.play-button').forEach(button => {
    button.addEventListener('click', function() {
        const audioId = this.getAttribute('data-audio');
        
        // 他の音源が再生中なら停止
        if (currentAudio && currentAudioId !== audioId) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
            const prevButton = document.querySelector(`.play-button[data-audio="${currentAudioId}"]`);
            prevButton.classList.remove('playing');
            updateProgress(currentAudioId, 0);
        }
        
        // 音源データの確認
        if (!audioData[audioId].src) {
            // 音源がない場合は仮の動作（後で実装）
            alert('音源は準備中です。近日中に追加予定です。');
            return;
        }
        
        // 音源の再生/停止
        if (this.classList.contains('playing')) {
            currentAudio.pause();
            this.classList.remove('playing');
        } else {
            if (!currentAudio || currentAudioId !== audioId) {
                currentAudio = new Audio(audioData[audioId].src);
                currentAudioId = audioId;
                
                // 時間更新のイベント
                currentAudio.addEventListener('timeupdate', function() {
                    const progress = (currentAudio.currentTime / currentAudio.duration) * 100;
                    updateProgress(audioId, progress);
                    updateTime(audioId, currentAudio.currentTime, currentAudio.duration);
                });
                
                // 再生終了時
                currentAudio.addEventListener('ended', function() {
                    button.classList.remove('playing');
                    updateProgress(audioId, 0);
                    updateTime(audioId, 0, currentAudio.duration);
                });
            }
            
            currentAudio.play();
            this.classList.add('playing');
        }
    });
});

// プログレスバーの更新
function updateProgress(audioId, progress) {
    const progressFill = document.querySelector(`.progress-fill[data-audio="${audioId}"]`);
    if (progressFill) {
        progressFill.style.width = progress + '%';
    }
}

// 時間表示の更新
function updateTime(audioId, currentTime, duration) {
    const button = document.querySelector(`.play-button[data-audio="${audioId}"]`);
    const card = button.closest('.player-card');
    const currentTimeEl = card.querySelector('.current-time');
    const durationEl = card.querySelector('.duration');
    
    if (currentTimeEl) currentTimeEl.textContent = formatTime(currentTime);
    if (durationEl) durationEl.textContent = formatTime(duration);
}

// 初期表示の時間設定
document.querySelectorAll('.player-card').forEach(card => {
    const button = card.querySelector('.play-button');
    const audioId = button.getAttribute('data-audio');
    const durationEl = card.querySelector('.duration');
    
    if (durationEl && audioData[audioId]) {
        durationEl.textContent = formatTime(audioData[audioId].duration);
    }
});
