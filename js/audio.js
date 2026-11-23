// Web Audio API Synthesizer - 100% Offline, Zero external asset dependency
class SoundManager {
    constructor() {
        this.ctx = null;
        this.enabled = true;
        this.vibrationEnabled = true;
        this.isAudioUnlocked = false;
    }

    init() {
        if (!this.ctx) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (AudioContextClass) {
                this.ctx = new AudioContextClass();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
        this.isAudioUnlocked = true;
    }

    vibrate(pattern = [50]) {
        if (!this.vibrationEnabled) return;
        if ('vibrate' in navigator) {
            try {
                navigator.vibrate(pattern);
            } catch (e) {
                // Ignore vibration errors on unsupported devices
            }
        }
    }

    // Helper: generate white noise buffer
    createNoiseBuffer(duration = 0.2) {
        if (!this.ctx) return null;
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }
        return buffer;
    }

    // Sound 1: Cú đập uy lực (Thump)
    playSlapThump() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;

        // Sub bass thump
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(35, now + 0.18);

        gain.gain.setValueAtTime(0.9, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.22);

        // Impact slap noise (tiếng vỗ tay/mặt bàn)
        const noiseBuffer = this.createNoiseBuffer(0.12);
        if (noiseBuffer) {
            const noise = this.ctx.createBufferSource();
            noise.buffer = noiseBuffer;

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(1200, now);
            filter.frequency.exponentialRampToValueAtTime(200, now + 0.12);

            const noiseGain = this.ctx.createGain();
            noiseGain.gain.setValueAtTime(0.8, now);
            noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

            noise.connect(filter);
            filter.connect(noiseGain);
            noiseGain.connect(this.ctx.destination);

            noise.start(now);
            noise.stop(now + 0.13);
        }

        this.vibrate([70]);
    }

    // Sound 2: LẬT BÀI THÀNH CÔNG (Critical Flip / Chát + Chime)
    playCriticalFlip() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        this.playSlapThump();

        const now = this.ctx.currentTime + 0.05;

        // Crisp crack sound
        const crackBuffer = this.createNoiseBuffer(0.2);
        if (crackBuffer) {
            const crack = this.ctx.createBufferSource();
            crack.buffer = crackBuffer;

            const crackFilter = this.ctx.createBiquadFilter();
            crackFilter.type = 'bandpass';
            crackFilter.frequency.setValueAtTime(2800, now);
            crackFilter.Q.setValueAtTime(3.0, now);

            const crackGain = this.ctx.createGain();
            crackGain.gain.setValueAtTime(1.0, now);
            crackGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

            crack.connect(crackFilter);
            crackFilter.connect(crackGain);
            crackGain.connect(this.ctx.destination);

            crack.start(now);
            crack.stop(now + 0.16);
        }

        // Triumphant chord arpeggio
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
            const noteOsc = this.ctx.createOscillator();
            const noteGain = this.ctx.createGain();
            const noteTime = now + 0.08 + idx * 0.06;

            noteOsc.type = 'sine';
            noteOsc.frequency.setValueAtTime(freq, noteTime);

            noteGain.gain.setValueAtTime(0.3, noteTime);
            noteGain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.35);

            noteOsc.connect(noteGain);
            noteGain.connect(this.ctx.destination);

            noteOsc.start(noteTime);
            noteOsc.stop(noteTime + 0.38);
        });

        this.vibrate([100, 50, 150]);
    }

    // Sound 3: Đập hụt (Miss / Whoosh)
    playMissWhoosh() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const noiseBuffer = this.createNoiseBuffer(0.25);
        if (noiseBuffer) {
            const noise = this.ctx.createBufferSource();
            noise.buffer = noiseBuffer;

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(400, now);
            filter.frequency.exponentialRampToValueAtTime(1400, now + 0.12);
            filter.frequency.exponentialRampToValueAtTime(250, now + 0.25);
            filter.Q.setValueAtTime(2.0, now);

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.linearRampToValueAtTime(0.4, now + 0.1);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);

            noise.start(now);
            noise.stop(now + 0.26);
        }

        // Dull thud
        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(90, now + 0.1);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.25);
        oscGain.gain.setValueAtTime(0.25, now + 0.1);
        oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc.connect(oscGain);
        oscGain.connect(this.ctx.destination);
        osc.start(now + 0.1);
        osc.stop(now + 0.26);

        this.vibrate([30]);
    }

    // Sound 4: Oẳn tù tì (Pops & Reveal)
    playRpsCountdown(pitch = 440) {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(pitch, now);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.11);
    }

    // Sound 5: Chia bài / Rút bài
    playCardDeal() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const noiseBuffer = this.createNoiseBuffer(0.08);
        if (noiseBuffer) {
            const noise = this.ctx.createBufferSource();
            noise.buffer = noiseBuffer;

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'highpass';
            filter.frequency.setValueAtTime(2500, now);

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.3, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);

            noise.start(now);
            noise.stop(now + 0.09);
        }
    }

    // Sound 6: Thắng trận chung cuộc
    playVictory() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const melody = [
            { f: 523.25, d: 0.15 }, // C5
            { f: 523.25, d: 0.15 }, // C5
            { f: 523.25, d: 0.15 }, // C5
            { f: 659.25, d: 0.4 },  // E5
            { f: 587.33, d: 0.15 }, // D5
            { f: 659.25, d: 0.15 }, // E5
            { f: 783.99, d: 0.6 }   // G5
        ];

        let offset = 0;
        melody.forEach(item => {
            const noteOsc = this.ctx.createOscillator();
            const noteGain = this.ctx.createGain();
            const noteTime = now + offset;

            noteOsc.type = 'triangle';
            noteOsc.frequency.setValueAtTime(item.f, noteTime);

            noteGain.gain.setValueAtTime(0.35, noteTime);
            noteGain.gain.exponentialRampToValueAtTime(0.001, noteTime + item.d);

            noteOsc.connect(noteGain);
            noteGain.connect(this.ctx.destination);

            noteOsc.start(noteTime);
            noteOsc.stop(noteTime + item.d + 0.05);

            offset += item.d + 0.02;
        });

        this.vibrate([100, 100, 100, 100, 300]);
    }

    // Sound 7: Thất bại trận chung cuộc
    playDefeat() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const melody = [
            { f: 440.00, d: 0.25 }, // A4
            { f: 415.30, d: 0.25 }, // G#4
            { f: 392.00, d: 0.35 }, // G4
            { f: 349.23, d: 0.6 }   // F4
        ];

        let offset = 0;
        melody.forEach(item => {
            const noteOsc = this.ctx.createOscillator();
            const noteGain = this.ctx.createGain();
            const noteTime = now + offset;

            noteOsc.type = 'sawtooth';
            noteOsc.frequency.setValueAtTime(item.f, noteTime);

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(600, noteTime);

            noteGain.gain.setValueAtTime(0.25, noteTime);
            noteGain.gain.exponentialRampToValueAtTime(0.001, noteTime + item.d);

            noteOsc.connect(filter);
            filter.connect(noteGain);
            noteGain.connect(this.ctx.destination);

            noteOsc.start(noteTime);
            noteOsc.stop(noteTime + item.d + 0.05);

            offset += item.d + 0.05;
        });

        this.vibrate([200, 100, 300]);
    }

    // UI Click
    playClick() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.05);
    }
}

window.soundManager = new SoundManager();
