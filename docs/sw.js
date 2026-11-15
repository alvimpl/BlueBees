// Service worker do Blue Bees (PWA, 15/11/2026).
//
// Ate aqui o site nao tinha service worker de proposito: cache offline segurava
// versao velha. Ele entrou para o app instalar de verdade no celular (iPhone e
// Android, sem loja) e abrir sem internet, e foi desenhado para nao repetir
// aquele problema:
//
// - O index.html vem SEMPRE da rede quando ha rede. E ele que traz o carimbo da
//   publicacao (o "?v=" que o publish.cmd web grava), inclusive no endereco deste
//   arquivo. Publicou de novo -> endereco novo -> o navegador instala este
//   service worker de novo -> a ativacao apaga o cache da versao anterior.
// - Dentro de uma versao, o resto do proprio site (Codex, icones, mascaras, css)
//   sai do cache: nao muda ate a proxima publicacao.
// - _framework (o .NET) vai pela rede e cai no cache so offline: o Blazor tem o
//   cache dele, e misturar dll de duas versoes quebra o app.
//
// O que a VPS pediu (PWA-VPS.md):
// - /tribo/api/ NUNCA passa por aqui: nem cache, nem copia. Offline, a aba Tribo
//   mostra "sem conexao", nunca dado velho de membro.
// - servidores.json, uptime.json, fontes.json e dia.json: rede primeiro, a ultima
//   copia so offline. Este arquivo nao faz pedido nenhum por conta propria; a
//   frequencia continua a do app (5 min, limite do Caddy 30/min por IP).
// - Registrado com updateViaCache: 'none' (ver index.html).

const VERSAO = new URL(self.location).searchParams.get('v') || 'dev';
const CACHE = 'bluebees-' + VERSAO;
const DADOS = 'bluebees-dados'; // listas da VPS: sobrevive a troca de versao

const HOST_VPS = 'bluebees.alvimpl.dev.br';
const ARQUIVOS_DA_VPS = ['/servidores.json', '/uptime.json', '/fontes.json', '/dia.json'];

// O minimo para abrir offline. O resto entra no cache conforme o app usa.
const ESSENCIAIS = ['./', 'bee.png', 'manifest.webmanifest', 'codex/codex.json',
    'css/app.css?v=' + VERSAO, 'js/arte.js?v=' + VERSAO, 'js/app.js?v=' + VERSAO];

self.addEventListener('install', evento => {
    evento.waitUntil((async () => {
        const cache = await caches.open(CACHE);
        // Um por um: um arquivo que falhe nao impede a instalacao.
        await Promise.all(ESSENCIAIS.map(u =>
            fetch(u, { cache: 'reload' })
                .then(r => r.ok ? cache.put(u, r) : null)
                .catch(() => null)));
        await self.skipWaiting();
    })());
});

self.addEventListener('activate', evento => {
    evento.waitUntil((async () => {
        // So os caches deste arquivo. Os do Blazor (dotnet-resources-...) sao dele.
        for (const nome of await caches.keys())
            if (nome.startsWith('bluebees-') && nome !== CACHE && nome !== DADOS)
                await caches.delete(nome);
        await self.clients.claim();
    })());
});

self.addEventListener('fetch', evento => {
    const req = evento.request;
    if (req.method !== 'GET') return;
    const url = new URL(req.url);

    if (url.hostname === HOST_VPS) {
        // A tribo nem passa por aqui: o navegador busca direto, como sem service worker.
        if (url.pathname.includes('/tribo/')) return;
        if (ARQUIVOS_DA_VPS.some(a => url.pathname.endsWith(a)))
            evento.respondWith(redePrimeiro(req, DADOS, url.origin + url.pathname));
        return;
    }

    // Fora do proprio site (Wildcard, wiki, CDN): sem cache.
    if (url.origin !== self.location.origin) return;
    if (url.pathname.endsWith('/sw.js')) return;

    if (req.mode === 'navigate')
        evento.respondWith(redePrimeiro(req, CACHE, './'));
    else if (url.pathname.includes('/_framework/'))
        evento.respondWith(redePrimeiro(req, CACHE));
    else
        evento.respondWith(cachePrimeiro(req));
});

async function redePrimeiro(req, nomeCache, chave) {
    const cache = await caches.open(nomeCache);
    try {
        const resp = await fetch(req);
        if (resp.ok) await cache.put(chave || req, resp.clone());
        return resp;
    } catch (erro) {
        const guardada = await cache.match(chave || req);
        if (guardada) return guardada;
        throw erro;
    }
}

async function cachePrimeiro(req) {
    const cache = await caches.open(CACHE);
    const guardada = await cache.match(req);
    if (guardada) return guardada;
    const resp = await fetch(req);
    if (resp.ok) await cache.put(req, resp.clone());
    return resp;
}
