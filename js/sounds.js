/* ========================================
   SISTEMA DE ÁUDIO — S.Q.L.
======================================== */

(() => {
    const SOUND_PATHS = {
        click: 'audio/interface/mixkit-single-classic-click-1116.wav',
        select: 'audio/interface/mixkit-interface-device-click-2577.wav',
        modal: 'audio/interface/mixkit-interface-hint-notification-911.wav',
        hover: 'audio/interface/hover.wav'
    };

    const sounds = {};

    let audioUnlocked = false;

    // Libera o áudio após a primeira interação do usuário.
    function unlockAudio() {
        if (audioUnlocked) return;

        audioUnlocked = true;

        Object.values(sounds).forEach(audio => {
            audio.load();
        });
    }

    document.addEventListener('pointerdown', unlockAudio, { once: true });
    document.addEventListener('keydown', unlockAudio, { once: true });
    // Carrega os efeitos
    Object.entries(SOUND_PATHS).forEach(([name, path]) => {
        const audio = new Audio(path);

        audio.preload = 'auto';

        sounds[name] = audio;
    });

    // Consulta as configurações de áudio
    function getAudioSettings() {
        const settings = window.getSqlSettings?.();

        return {
            enabled: settings?.sound ?? true,
            volume: settings?.volume ?? 70
        };
    }

    // Reproduz um efeito sonoro
    function playSound(name) {
        const sound = sounds[name];

        if (!sound || !audioUnlocked) return;

        const settings = getAudioSettings();

        if (!settings.enabled) return;

        const volume = Math.max(0, Math.min(1, settings.volume / 100));

        if (volume === 0) return;

        const audio = sound.cloneNode();
        audio.volume = volume;

        audio.play().catch(error => {
            console.warn(`Falha ao reproduzir ${name}:`, error);
        });
    }

    // Disponibiliza a função globalmente
    window.playSound = playSound;

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