// DOMの読み込み完了を待つ
document.addEventListener('DOMContentLoaded', function() {

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
        src: 'https://soranaaudio.github.io/sorana.github.io/assets/audio/yakushima.mp3',
        duration: 94
    },
    okinawa: {
        src: 'https://soranaaudio.github.io/sorana.github.io/assets/audio/okinawa.mp3',
        duration: 132
    },
    kyoto: {
        src: 'https://soranaaudio.github.io/sorana.github.io/assets/audio/kyoto.mp3',
        duration: 90
    }
};

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
            
            console.log('Button clicked:', audioId); // デバッグ用
            
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
                    
                    currentAudio.addEventListener('timeupdate', function() {
                        const progress = (currentAudio.currentTime / currentAudio.duration) * 100;
                        updateProgress(audioId, progress);
                        updateTime(audioId, currentAudio.currentTime, currentAudio.duration);
                    });
                    
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

}); // DOMContentLoaded の終了