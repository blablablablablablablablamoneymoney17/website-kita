// Global Music Player - Persists across all pages
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
        // Create audio element
        this.audio = new Audio(this.musicUrl);
        this.audio.loop = true;
        this.audio.volume = this.volume;
        this.audio.preload = 'auto';
        
        // Load saved state from localStorage
        this.loadState();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Create music controls
        this.createMusicControls();
        
        // Auto-resume if was playing - with delay to ensure DOM is ready
        setTimeout(() => {
            if (this.isPlaying) {
                this.resumeMusic();
            }
        }, 200);
        
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
    
    setupEventListeners() {
        if (this.audio) {
            this.audio.addEventListener('loadeddata', () => {
                // Audio is ready to play
                if (this.isPlaying && this.currentTime > 0) {
                    this.audio.currentTime = this.currentTime;
                }
            });
            
            this.audio.addEventListener('canplaythrough', () => {
                // Audio can play through without buffering
                if (this.isPlaying) {
                    this.audio.currentTime = this.currentTime;
                    this.audio.play().catch(e => console.log('Autoplay prevented:', e));
                }
            });
            
            this.audio.addEventListener('timeupdate', () => {
                this.currentTime = this.audio.currentTime;
            });
        }
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
        if (this.audio) {
            // Set current time if we have a saved position
            if (this.currentTime > 0) {
                this.audio.currentTime = this.currentTime;
            }
            
            const playPromise = this.audio.play();
            
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    this.isPlaying = true;
                    this.updateButtonStates();
                    this.saveState();
                }).catch(e => {
                    console.log('Play failed:', e);
                    // Try to enable audio context with user interaction
                    this.enableAudioContext();
                });
            }
        }
    }
    
    pauseMusic() {
        if (this.audio) {
            this.audio.pause();
            this.isPlaying = false;
            this.updateButtonStates();
            this.saveState();
        }
    }
    
    resumeMusic() {
        if (this.audio && this.isPlaying) {
            // Ensure audio is loaded before resuming
            const tryResume = () => {
                if (this.audio.readyState >= 2) { // HAVE_CURRENT_DATA or higher
                    if (this.currentTime > 0) {
                        this.audio.currentTime = this.currentTime;
                    }
                    this.audio.play().catch(e => {
                        console.log('Resume failed:', e);
                        // Retry after user interaction
                        this.enableAudioContext();
                    });
                } else {
                    // Wait for audio to load
                    setTimeout(tryResume, 50);
                }
            };
            tryResume();
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
    
    enableAudioContext() {
        // Enable audio context on user interaction
        const enableAudio = () => {
            if (this.audio && this.isPlaying) {
                if (this.currentTime > 0) {
                    this.audio.currentTime = this.currentTime;
                }
                this.audio.play().then(() => {
                    this.updateButtonStates();
                }).catch(e => console.log('Audio context enable failed:', e));
            }
        };
        
        document.addEventListener('click', enableAudio, { once: true });
        document.addEventListener('touchstart', enableAudio, { once: true });
    }
}

// Initialize global music player when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Small delay to ensure all elements are ready
    setTimeout(() => {
        if (!window.globalMusicPlayer) {
            window.globalMusicPlayer = new GlobalMusicPlayer();
        }
    }, 100);
});

// Also initialize on window load as backup
window.addEventListener('load', () => {
    setTimeout(() => {
        if (!window.globalMusicPlayer) {
            window.globalMusicPlayer = new GlobalMusicPlayer();
        }
    }, 200);
});

// Legacy function for backward compatibility
function toggleMusic() {
    if (window.globalMusicPlayer) {
        window.globalMusicPlayer.toggleMusic();
    }
}
