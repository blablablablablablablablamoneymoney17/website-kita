// Simple Global Music Player
class GlobalMusicPlayer {
    constructor() {
        this.audio = null;
        this.isPlaying = false;
        this.currentTime = 0;
        this.volume = 0.7;
        this.musicUrl = './assets/music/imtiaz252_all-of-me-john-legend-lindsey-stirling (1).mp3';
        
        this.init();
    }
    
    init() {
        // Create simple audio element
        this.audio = new Audio(this.musicUrl);
        this.audio.loop = true;
        this.audio.volume = this.volume;
        this.audio.preload = 'auto';
        
        // Load saved state
        this.loadState();
        
        // Simple event listeners
        this.audio.addEventListener('timeupdate', () => {
            if (this.isPlaying) {
                this.currentTime = this.audio.currentTime;
            }
        });
        
        // Create controls
        this.createMusicControls();
        
        // Auto-resume if was playing
        if (this.isPlaying) {
            setTimeout(() => {
                this.resumeMusic();
            }, 300);
        }
        
        // Save state before page unload
        window.addEventListener('beforeunload', () => {
            this.saveState();
        });
        
        // Save state periodically
        setInterval(() => {
            if (this.isPlaying && this.audio) {
                this.currentTime = this.audio.currentTime;
                this.saveState();
            }
        }, 1000);
    }
    
    
    createMusicControls() {
        // Remove existing music controls
        const existingPlayer = document.querySelector('.music-player');
        if (existingPlayer) {
            existingPlayer.remove();
        }
        
        const existingNavButton = document.querySelector('#musicToggle');
        if (existingNavButton) {
            existingNavButton.remove();
        }
        
        // Create floating music player
        const musicPlayer = document.createElement('div');
        musicPlayer.className = 'music-player';
        musicPlayer.innerHTML = `
            <button class="music-btn" id="musicBtn">
                <i class="fas fa-music"></i> <span class="music-text">Play Music</span>
            </button>
        `;
        document.body.appendChild(musicPlayer);
        
        // Add to navbar if it exists
        const navbar = document.querySelector('.navbar-nav');
        if (navbar) {
            const navItem = document.createElement('li');
            navItem.className = 'nav-item';
            navItem.innerHTML = `
                <button id="musicToggle" class="btn btn-pink btn-sm mt-1">
                    <i class="fas fa-music"></i> <span class="nav-music-text">Play Music</span>
                </button>
            `;
            navbar.appendChild(navItem);
            
            // Add event listener to navbar button
            document.getElementById('musicToggle').addEventListener('click', () => {
                this.toggleMusic();
            });
        }
        
        // Add event listener to floating button
        document.getElementById('musicBtn').addEventListener('click', () => {
            this.toggleMusic();
        });
        
        // Update button states
        this.updateButtonStates();
    }
    
    toggleMusic() {
        if (this.isPlaying) {
            this.pauseMusic();
        } else {
            this.playMusic();
        }
    }
    
    playMusic() {
        if (!this.audio) return;
        
        // Restore saved position
        if (this.currentTime > 0) {
            this.audio.currentTime = this.currentTime;
        }
        
        this.audio.play().then(() => {
            this.isPlaying = true;
            this.updateButtonStates();
            this.saveState();
        }).catch(e => {
            console.log('Play failed:', e);
        });
    }
    
    pauseMusic() {
        if (this.audio) {
            this.currentTime = this.audio.currentTime;
            this.audio.pause();
            this.isPlaying = false;
            this.updateButtonStates();
            this.saveState();
        }
    }
    
    resumeMusic() {
        if (this.audio && this.isPlaying) {
            if (this.currentTime > 0) {
                this.audio.currentTime = this.currentTime;
            }
            this.audio.play().catch(e => console.log('Resume failed:', e));
        }
    }
    
    updateButtonStates() {
        const musicBtn = document.getElementById('musicBtn');
        const musicToggle = document.getElementById('musicToggle');
        
        if (this.isPlaying) {
            if (musicBtn) {
                musicBtn.innerHTML = '<i class="fas fa-pause"></i> <span class="music-text">Pause</span>';
            }
            if (musicToggle) {
                musicToggle.innerHTML = '<i class="fas fa-pause"></i> <span class="nav-music-text">Pause</span>';
            }
        } else {
            if (musicBtn) {
                musicBtn.innerHTML = '<i class="fas fa-music"></i> <span class="music-text">Play Music</span>';
            }
            if (musicToggle) {
                musicToggle.innerHTML = '<i class="fas fa-music"></i> <span class="nav-music-text">Play Music</span>';
            }
        }
    }
    
    saveState() {
        const state = {
            isPlaying: this.isPlaying,
            currentTime: this.currentTime,
            volume: this.volume
        };
        localStorage.setItem('globalMusicState', JSON.stringify(state));
        sessionStorage.setItem('musicActive', 'true');
    }
    
    loadState() {
        try {
            const savedState = localStorage.getItem('globalMusicState');
            if (savedState) {
                const state = JSON.parse(savedState);
                this.isPlaying = state.isPlaying || false;
                this.currentTime = state.currentTime || 0;
                this.volume = state.volume || 0.7;
                
                if (this.audio) {
                    this.audio.volume = this.volume;
                }
            }
        } catch (e) {
            console.log('Error loading music state:', e);
        }
    }
    
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (!window.globalMusicPlayer) {
        window.globalMusicPlayer = new GlobalMusicPlayer();
    }
});

// Legacy function for backward compatibility
function toggleMusic() {
    if (window.globalMusicPlayer) {
        window.globalMusicPlayer.toggleMusic();
    }
}
