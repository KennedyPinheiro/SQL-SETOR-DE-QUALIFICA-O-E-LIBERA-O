/* ========================================
   SISTEMA DE ÁUDIO — S.Q.L.
======================================== */

(() => {
    const SOUND_PATHS = {
        click: 'audio/interface/mixkit-single-classic-click-1116.wav',
        select: 'audio/interface/mixkit-interface-device-click-2577.wav',
        modal: 'audio/interface/mixkit-interface-hint-notification-911.wav',
        hover: 'audio/interface/hover.wav',
        priority: 'audio/interface/alarme.wav',
        defeat: 'audio/interface/derrota.wav'
    };

    const sounds = {};

    let audioUnlocked = false;
    let priorityAudio = null;

    function unlockAudio() {
        if (audioUnlocked) return;
        audioUnlocked = true;

        Object.values(sounds).forEach(audio => {
            audio.load();
        });
    }

    document.addEventListener('pointerdown', unlockAudio, { once: true });
    document.addEventListener('keydown', unlockAudio, { once: true });
    Object.entries(SOUND_PATHS).forEach(([name, path]) => {
        const audio = new Audio(path);

        audio.preload = 'auto';

        sounds[name] = audio;
    });

    function getAudioSettings() {
        const settings = window.getSqlSettings?.();

        return {
            enabled: settings?.sound ?? true,
            volume: settings?.volume ?? 70
        };
    }

    function playSound(name) {
        const sound = sounds[name];

        if (!sound || !audioUnlocked) return;

        const settings = getAudioSettings();

        if (!settings.enabled) return;

        const volume = Math.max(0, Math.min(1, settings.volume / 100));

        if (volume === 0) return;

        if (name === "priority") {
            stopPrioritySound();

            priorityAudio = sound.cloneNode();
            priorityAudio.volume = volume;
            priorityAudio.loop = true;

            priorityAudio.play().catch(error => {
                console.warn("Falha ao reproduzir alarme:", error);
            });

            return;
        }

        const audio = sound.cloneNode();
        audio.volume = volume;

        audio.play().catch(error => {
            console.warn(`Falha ao reproduzir ${name}:`, error);
        });
    }


    /* ========================================
       INTERROMPER ALARME PRIORITÁRIO
    ======================================== */

    function stopPrioritySound() {
        if (!priorityAudio) return;

        priorityAudio.pause();
        priorityAudio.currentTime = 0;
        priorityAudio = null;
    }
    /* ========================================
       ALERTAS SONOROS DE SUSPEITA
    ======================================== */

    let suspicionAudioContext = null;

    function playSuspicionAlert(level) {
        if (!audioUnlocked) return;

        const settings = getAudioSettings();

        if (!settings.enabled || settings.volume <= 0) return;

        if (level !== "high" && level !== "critical") return;

        const AudioContextClass =
            window.AudioContext || window.webkitAudioContext;

        if (!AudioContextClass) return;

        if (!suspicionAudioContext) {
            suspicionAudioContext = new AudioContextClass();
        }

        const context = suspicionAudioContext;

        if (context.state === "suspended") {
            context.resume();
        }

        const volume = Math.max(
            0,
            Math.min(1, settings.volume / 100)
        );

        /* Configuração dos alertas */

        const patterns = {
            high: [
                { frequency: 620, duration: 0.13 }
            ],

            critical: [
                { frequency: 850, duration: 0.12 },
                { frequency: 650, duration: 0.12 },
                { frequency: 850, duration: 0.18 }
            ]
        };

        const pattern = patterns[level];

        pattern.forEach((note, index) => {
            const startTime = context.currentTime + index * 0.18;

            const oscillator = context.createOscillator();
            const gain = context.createGain();

            oscillator.type = "sine";
            oscillator.frequency.value = note.frequency;

            gain.gain.setValueAtTime(0, startTime);

            gain.gain.linearRampToValueAtTime(
                volume * 0.18,
                startTime + 0.02
            );

            gain.gain.exponentialRampToValueAtTime(
                0.001,
                startTime + note.duration
            );

            oscillator.connect(gain);
            gain.connect(context.destination);

            oscillator.start(startTime);
            oscillator.stop(startTime + note.duration);
        });
    }

    /* ========================================
       DISPONIBILIZA FUNÇÕES GLOBALMENTE
    ======================================== */

    window.playSound = playSound;
    window.playSuspicionAlert = playSuspicionAlert;
    window.stopPrioritySound = stopPrioritySound;

    // Clique e seleção de elementos
    document.addEventListener('click', (event) => {
        const element = event.target.closest(
            'button, [data-sound]'
        );

        if (!element) return;

        const soundType = element.dataset.sound;

        if (soundType === 'none') return;

        if (soundType) {
            playSound(soundType);
            return;
        }

        if (element.tagName === 'BUTTON') {
            playSound('click');
        }
    });
    // Detecta passagem do mouse sobre elementos
    let lastHoveredElement = null;

    document.addEventListener('mouseover', (event) => {
        const element = event.target.closest('[data-hover-sound]');

        if (!element || element === lastHoveredElement) return;

        lastHoveredElement = element;

        playSound(element.dataset.hoverSound);
    });

    document.addEventListener('mouseout', (event) => {
        const element = event.target.closest('[data-hover-sound]');

        if (!element) return;

        if (!element.contains(event.relatedTarget)) {
            lastHoveredElement = null;
        }
    });
    // Detecta abertura de modais
    const observedModals = new WeakMap();

    function checkModals() {
        const modals = document.querySelectorAll(
            '.modal-backdrop, [role="dialog"]'
        );

        modals.forEach((modal) => {
            const isOpen =
                modal.classList.contains('open') ||
                modal.getAttribute('aria-hidden') === 'false';

            const wasOpen = observedModals.get(modal) || false;

            if (isOpen && !wasOpen) {
                playSound('modal');
            }

            observedModals.set(modal, isOpen);
        });
    }

    const modalObserver = new MutationObserver(checkModals);

    modalObserver.observe(document.body, {
        subtree: true,
        childList: true,
        attributes: true,
        attributeFilter: ['class', 'aria-hidden']
    });

    checkModals();

})();