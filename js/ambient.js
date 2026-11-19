/* ========================================
 *  MÚSICA AMBIENTE — S.Q.L.
 * ======================================== */

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
    audio.volume = 0.1;

    let userInteracted = false;

    function getMusicSettings() {
        const settings = window.getSqlSettings?.();

        return {
            enabled: settings?.music ?? true,
            volume: settings?.volume ?? 50
        };
    }

    function updateVolume() {
        const { volume } = getMusicSettings();

        audio.volume = Math.max(0, Math.min(1, volume / 100)) * 0.20;
    }

    async function syncAmbient() {
        const { enabled } = getMusicSettings();

        updateVolume();

        if (!enabled) {
            audio.pause();
            return;
        }

        if (!userInteracted) return;

        if (audio.paused) {
            try {
                await audio.play();
            } catch (error) {
                console.warn('[S.Q.L.] Falha ao iniciar música:', error);
            }
        }
    }

    function handleUserInteraction() {
        if (!userInteracted) {
            userInteracted = true;
        }

        syncAmbient();
    }

    document.addEventListener('pointerdown', handleUserInteraction);
    document.addEventListener('keydown', handleUserInteraction);

    window.addEventListener('sql-settings-changed', syncAmbient);

    audio.addEventListener('error', () => {
        console.error('[S.Q.L.] Erro ao carregar música:', {
            arquivo: TRACKS[currentPage],
            erro: audio.error
        });
    });

    updateVolume();

})();