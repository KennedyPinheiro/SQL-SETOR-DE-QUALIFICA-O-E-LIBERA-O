/* ========================================
   MÚSICA AMBIENTE — S.Q.L.
======================================== */

(() => {
    const TRACKS = {
        home: 'audio/ambient/808988__looplicator__136-bpm-industrial-ambient-loop-13985-wav.wav',
        game: 'audio/ambient/822609__looplicator__33-bpm-industrial-ambient-loop-14727-wav.wav'
    };

    const currentPage = document.getElementById('start-screen')
        ? 'home'
        : 'game';

    const audio = new Audio(TRACKS[currentPage]);

    audio.loop = true;
    audio.preload = 'auto';

    let userInteracted = false;

    // Consulta as configurações
    function getMusicSettings() {
        const settings = window.getSqlSettings?.();

        return {
            enabled: settings?.music ?? true,
            volume: settings?.volume ?? 50
        };
    }

    // Atualiza o volume
    function updateVolume() {
        const settings = getMusicSettings();

        audio.volume = (settings.volume / 100) * 0.20;
    }

    // Sincroniza a reprodução com as configurações
    async function syncAmbient() {
        const settings = getMusicSettings();

        updateVolume();

        if (!settings.enabled) {
            audio.pause();
            return;
        }

        if (!userInteracted) return;

        if (audio.paused) {
            try {
                await audio.play();
            } catch (error) {
                console.warn(
                    'Não foi possível iniciar a música ambiente:',
                    error
                );
            }
        }
    }

    // Aguarda uma interação real do usuário
    function handleUserInteraction() {
        userInteracted = true;
        syncAmbient();
    }

    document.addEventListener(
        'pointerdown',
        handleUserInteraction
    );

    document.addEventListener(
        'keydown',
        handleUserInteraction
    );

    // Detecta alterações nas configurações
    window.addEventListener(
        'sql-settings-changed',
        syncAmbient
    );

    // Diagnóstico de carregamento
    audio.addEventListener('error', () => {
        console.error(
            'Erro ao carregar música ambiente:',
            audio.currentSrc,
            audio.error
        );
    });

    updateVolume();

})();