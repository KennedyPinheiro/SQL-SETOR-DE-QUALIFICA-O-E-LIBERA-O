/* ========================================
   ANIMAÇÃO DE FOLHAS — S.Q.L.
======================================== */

(() => {
    const LEAF_COUNT = 16;

    const startScreen = document.getElementById('start-screen');

    if (!startScreen) return;

    const reducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
    );

    let leafLayer = null;

    function getSettings() {
        return typeof window.getSqlSettings === 'function'
            ? window.getSqlSettings()
            : { leaves: true, animations: true };
    }

    function createLeaf() {
        const leaf = document.createElement('span');

        const size = random(9, 19);
        const drift = random(-130, 130);

        leaf.className = 'leaf';

        leaf.style.setProperty('--left', `${random(0, 100)}%`);
        leaf.style.setProperty('--size', `${size}px`);
        leaf.style.setProperty('--duration', `${random(14, 28)}s`);
        leaf.style.setProperty('--delay', `${random(-28, 0)}s`);
        leaf.style.setProperty('--drift', `${drift}px`);
        leaf.style.setProperty('--drift-half', `${drift / 2}px`);
        leaf.style.setProperty('--rotation', `${random(360, 1080)}deg`);
        leaf.style.setProperty('--opacity', random(0.18, 0.42));

        return leaf;
    }

    function random(min, max) {
        return Math.random() * (max - min) + min;
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

    // Atualiza quando as configurações são alteradas.
    document.getElementById('setting-leaves')
        ?.addEventListener('change', () => {
            setTimeout(syncLeaves, 0);
        });

    document.getElementById('setting-animations')
        ?.addEventListener('change', () => {
            setTimeout(syncLeaves, 0);
        });

    // Atualiza caso a preferência de movimento do sistema mude.
    reducedMotion.addEventListener('change', syncLeaves);

    // Atualiza caso as configurações sejam alteradas em outra aba.
    window.addEventListener('storage', (event) => {
        if (event.key === 'sql-settings') {
            syncLeaves();
        }
    });

    // Inicialização.
    syncLeaves();
})();