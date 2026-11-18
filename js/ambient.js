/* ========================================
   MÚSICA AMBIENTE — S.Q.L.
======================================== */

(() => {
    const tracks = {
        home: 'audio/ambient/808988__looplicator__136-bpm-industrial-ambient-loop-13985-wav.wav',

        game: 'audio/ambient/822609__looplicator__33-bpm-industrial-ambient-loop-14727-wav.wav'
    };

    // Identifica a página atual
    const currentPage = document.getElementById('start-screen')
        ? 'home'
        : 'game';

    const audio = new Audio(tracks[currentPage]);

    audio.loop = true;
    audio.preload = 'auto';

    // Atualiza o volume
    function updateVolume() {
        const settings = window.getSqlSettings?.();

        const volume = settings?.volume ?? 70;

        audio.volume = (volume / 100) * 0.20;
    }

    // Sincroniza com as configurações
    function syncAmbient() {
        const settings = window.getSqlSettings?.();

        if (!settings || !settings.music) {
            audio.pause();
            return;
        }

        updateVolume();

        if (audio.paused) {
            audio.play().catch(() => {});
        }
    }

    // Aguarda interação do jogador
    function startAfterInteraction() {
        syncAmbient();

        if (!audio.paused) {
            document.removeEventListener('pointerdown', startAfterInteraction);
            document.removeEventListener('keydown', startAfterInteraction);
        }
    }

    document.addEventListener('pointerdown', startAfterInteraction);
    document.addEventListener('keydown', startAfterInteraction);

    // Escuta alterações nas configurações
    window.addEventListener('sql-settings-changed', syncAmbient);

    // Inicialização
    updateVolume();
    syncAmbient();

})();