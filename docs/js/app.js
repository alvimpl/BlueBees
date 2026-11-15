// App instalavel (PWA, 15/11/2026): registro do service worker e o botao Instalar.

(function () {
    // O mesmo carimbo de publicacao do index.html ("?v=..."): o endereco do
    // service worker muda a cada publicacao, e e isso que troca a versao no aparelho.
    const versao = new URL(document.currentScript.src).searchParams.get('v') || 'dev';

    // Em desenvolvimento ("dev") o cache atrapalharia ver o css novo. Para testar o
    // service worker localmente: localStorage['bluebees.sw'] = '1' e recarregar.
    let ligar = versao !== 'dev';
    try { ligar = ligar || localStorage.getItem('bluebees.sw') === '1'; } catch { }

    if (ligar && 'serviceWorker' in navigator) {
        // updateViaCache 'none': o GitHub Pages manda max-age=600, e sem isto o
        // aparelho podia demorar a enxergar o sw.js novo (pedido da VPS).
        navigator.serviceWorker.register('sw.js?v=' + versao, { updateViaCache: 'none' })
            .catch(e => console.warn('service worker:', e));
    }

    // Chrome e Edge (Android e PC) oferecem o pedido de instalacao; guardado para
    // o botao Instalar. O iPhone nunca oferece: la o botao abre as instrucoes.
    let pedido = null;
    addEventListener('beforeinstallprompt', e => { e.preventDefault(); pedido = e; });
    addEventListener('appinstalled', () => { pedido = null; });

    window.blueBeesApp = {
        instalado: () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true,
        ehIos: () => /iPad|iPhone|iPod/.test(navigator.userAgent)
            || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1),
        // true = o navegador mostrou o pedido dele; false = mostrar as instrucoes.
        pedirInstalacao: async () => {
            if (!pedido) return false;
            const p = pedido;
            pedido = null;
            await p.prompt();
            return true;
        }
    };
})();
