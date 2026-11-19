/* ========================================
 *  ANIMAÇÃO DE FOLHAS — S.Q.L.
 * ======================================== */

(() => {
    const LEAF_COUNT = 18;

    const startScreen = document.getElementById('start-screen');

    if (!startScreen) return;

    const reducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
    );

    let leafLayer = null;

    function random(min, max) {
        return Math.random() * (max - min) + min;
    }

    function getSettings() {
        return typeof window.getSqlSettings === 'function'
            ? window.getSqlSettings()
            : { leaves: true, animations: true };
    }

    function createLeaf() {
        const leaf = document.createElement('span');

        const drift = random(-180, 180);

        leaf.className = 'leaf';

        leaf.style.setProperty('--left', `${random(0, 100)}%`);
        leaf.style.setProperty('--size', `${random(9, 20)}px`);

        // Velocidade individual
        leaf.style.setProperty('--duration', `${random(16, 34)}s`);

        // Distribui as folhas pela animação desde o início
        leaf.style.setProperty('--delay', `${random(-34, 0)}s`);

        // Trajetória horizontal variável
        leaf.style.setProperty('--drift', `${drift}px`);
        leaf.style.setProperty('--drift-quarter', `${drift * 0.25 + random(-35, 35)}px`);
        leaf.style.setProperty('--drift-half', `${drift * 0.5 + random(-45, 45)}px`);
        leaf.style.setProperty('--drift-three-quarter', `${drift * 0.75 + random(-35, 35)}px`);

        leaf.style.setProperty('--rotation', `${random(360, 1080)}deg`);
        leaf.style.setProperty('--opacity', random(0.18, 0.42));

        return leaf;
    }

    function createLeafLayer() {
        if (leafLayer) return;

        leafLayer = document.createElement('div');
        leafLayer.className = 'leaf-layer';
        leafLayer.setAttribute('aria-hidden', 'true');

        for (let i = 0; i < LEAF_COUNT; i++) {
            leafLayer.appendChild(createLeaf());
        }

        startScreen.prepend(leafLayer);
    }

    function removeLeafLayer() {
        if (!leafLayer) return;

        leafLayer.remove();
        leafLayer = null;
    }

    function syncLeaves() {
        const settings = getSettings();

        const enabled =
            settings.leaves !== false &&
            settings.animations !== false &&
            !reducedMotion.matches;

        if (enabled) {
            createLeafLayer();
        } else {
            removeLeafLayer();
        }
    }

    document.getElementById('setting-leaves')
        ?.addEventListener('change', () => {
            setTimeout(syncLeaves, 0);
        });

    document.getElementById('setting-animations')
        ?.addEventListener('change', () => {
            setTimeout(syncLeaves, 0);
        });

    reducedMotion.addEventListener('change', syncLeaves);

    window.addEventListener('storage', (event) => {
        if (event.key === 'sql-settings') {
            syncLeaves();
        }
    });

    window.addEventListener('sql-settings-changed', syncLeaves);

    syncLeaves();
})();