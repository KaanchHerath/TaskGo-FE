// Audio utilities for chat notifications

class AudioManager {
  constructor() {
    this.audioContext = null;
    this.messageSound = null;
    this.isEnabled = true;
    this.volume = 0.3;
    
    // Initialize audio context
    this.initAudioContext();
  }

  // Initialize Web Audio API context
  initAudioContext() {
    try {
      // Check if Web Audio API is supported
      if (typeof window !== 'undefined' && window.AudioContext) {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.createMessageSound();
      }
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
    }
  }

  // Create a simple notification sound
  createMessageSound() {
    if (!this.audioContext) return;

    try {
      // Create oscillator for notification sound
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      // Configure sound
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      // Set frequency and type
      oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
      oscillator.type = 'sine';
      
      // Set volume
      gainNode.gain.setValueAtTime(this.volume, this.audioContext.currentTime);
      
      // Create envelope
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(this.volume, this.audioContext.currentTime + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.3);
      
      this.messageSound = { oscillator, gainNode };
    } catch (error) {
      console.warn('Failed to create message sound:', error);
    }
  }

  // Play message notification sound
  playMessageSound() {
    if (!this.messageSound || !this.isEnabled) return;

    try {
      // Resume audio context if suspended (required by some browsers)
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }

      // Create a new instance for each play (oscillators can only be used once)
      this.createMessageSound();
      
      if (this.messageSound) {
        this.messageSound.oscillator.start();
        this.messageSound.oscillator.stop(this.audioContext.currentTime + 0.3);
      }
    } catch (error) {
      console.warn('Failed to play message sound:', error);
    }
  }

  // Enable/disable sound
  setSoundEnabled(enabled) {
    this.isEnabled = enabled;
    
    // Save preference to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('chatSoundEnabled', enabled.toString());
    }
  }

  // Set volume (0.0 to 1.0)
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    
    // Save preference to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('chatVolume', this.volume.toString());
    }
  }

  // Load preferences from localStorage
  loadPreferences() {
    if (typeof window !== 'undefined') {
      const soundEnabled = localStorage.getItem('chatSoundEnabled');
      const volume = localStorage.getItem('chatVolume');
      
      if (soundEnabled !== null) {
        this.isEnabled = soundEnabled === 'true';
      }
      
      if (volume !== null) {
        this.volume = parseFloat(volume);
      }
    }
  }

  // Cleanup
  destroy() {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.messageSound = null;
  }
}

// Create singleton instance
const audioManager = new AudioManager();

// Load preferences on initialization
audioManager.loadPreferences();

export default audioManager;
