// A aba Artes da versao web: ler mascara como pixels, PINTAR uma lista de
// desenho e exportar o PNG.
//
// O LAYOUT NAO MORA AQUI (13/10/2026). O cartao e descrito no Core, em C#
// (BlueBees.Arte.CartaoArte), e chega como lista de passos -- a mesma que o
// desktop pinta com WPF e o Android com Skia. Este arquivo so executa os passos;
// o formato de cada um esta em Desenho.cs. A conta da pintura da criatura e o
// TintCore, tambem em C#.
(function () {
    "use strict";

    const FONTE = '"Segoe UI", system-ui, -apple-system, Roboto, sans-serif';

    let logo = null;
    const promessaLogo = new Promise(ok => {
        const img = new Image();
        img.onload = () => { logo = img; ok(); };
        img.onerror = () => ok();          // sem a marca a arte ainda serve
        img.src = "bee.png";
    });

    // ------------------------------------------------------------ mascara

    // Devolve um bloco so para o C#: largura (4 bytes), altura (4 bytes) e os
    // pixels em BGRA, que e a ordem que o TintCore le (a do WPF).
    // fetch + createImageBitmap, e nao Image.decode(): o decode nao termina com a
    // aba do navegador escondida, e exportar o pacote e trocar de aba no meio
    // travava a exportacao para sempre (visto em 14/10/2026).
    async function mascara(url) {
        let img;
        try {
            const resp = await fetch(url);
            if (!resp.ok) return null;
            img = await createImageBitmap(await resp.blob());
        } catch { return null; }

        const w = img.width, h = img.height;
        const c = new OffscreenCanvas(w, h);
        const ctx = c.getContext("2d", { willReadFrequently: true });
        ctx.drawImage(img, 0, 0);
        const rgba = ctx.getImageData(0, 0, w, h).data;

        const saida = new Uint8Array(8 + rgba.length);
        const cab = new DataView(saida.buffer);
        cab.setInt32(0, w, true);
        cab.setInt32(4, h, true);
        for (let i = 0, k = 8; i < rgba.length; i += 4, k += 4) {
            saida[k] = rgba[i + 2];
            saida[k + 1] = rgba[i + 1];
            saida[k + 2] = rgba[i];
            saida[k + 3] = rgba[i + 3];
        }
        return saida;
    }

    // -------------------------------------------------------------- medida

    // Chamada de forma SINCRONA pelo layout em C#, para encaixar o nome.
    const medidor = new OffscreenCanvas(1, 1).getContext("2d");
    const fonte = (px, forte) => `${forte ? "bold " : ""}${px}px ${FONTE}`;

    function medir(texto, px, forte) {
        medidor.font = fonte(px, forte);
        return medidor.measureText(texto).width;
    }

    // -------------------------------------------------------------- pintor

    // A criatura pintada chega em BGRA (a saida do TintCore); o canvas quer RGBA.
    function imagemDeBgra(bgra, w, h) {
        if (!bgra || !bgra.length || !w || !h) return null;
        const img = new ImageData(w, h);
        const px = img.data;
        for (let i = 0; i < px.length; i += 4) {
            px[i] = bgra[i + 2];
            px[i + 1] = bgra[i + 1];
            px[i + 2] = bgra[i];
            px[i + 3] = bgra[i + 3];
        }
        const c = new OffscreenCanvas(w, h);
        c.getContext("2d").putImageData(img, 0, 0);
        return c;
    }

    async function pintar(id, json, dino, dinoLargura, dinoAltura) {
        const canvas = document.getElementById(id);
        if (!canvas) return;
        await promessaLogo;
        pintarEm(canvas, JSON.parse(json), { logo, dino: imagemDeBgra(dino, dinoLargura, dinoAltura) });
    }

    function pintarEm(canvas, desenho, imagens) {
        canvas.width = desenho.largura;
        canvas.height = desenho.altura;
        const d = canvas.getContext("2d");
        d.clearRect(0, 0, canvas.width, canvas.height);
        for (const p of desenho.passos) passo(d, p, imagens);
    }

    // ------------------------------------------------------------- pacote

    // As criaturas do pacote, uma por ficha ("dino0", "dino1"...). Chegam uma a
    // uma, porque byte[] so atravessa do C# sozinho, e sao soltas na exportacao.
    let doPacote = {};

    function registrar(chave, bgra, w, h) {
        doPacote[chave] = imagemDeBgra(bgra, w, h);
    }

    // A folha nao aparece na tela: e pintada num canvas solto e baixada direto.
    async function exportarDesenho(json, nome) {
        await promessaLogo;
        const canvas = document.createElement("canvas");
        pintarEm(canvas, JSON.parse(json), { ...doPacote, logo });
        doPacote = {};
        await new Promise(ok => canvas.toBlob(blob => { baixar(blob, nome); ok(); }, "image/png"));
    }

    function baixar(blob, nome) {
        if (!blob) return;
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = nome;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(a.href), 10000);
    }

    function passo(d, p, imagens) {
        const n = v => v || 0;
        switch (p.tipo) {
            case "linear": {
                const [x0, y0, x1, y1] = p.pontos;
                const g = d.createLinearGradient(x0, y0, x1, y1);
                g.addColorStop(0, p.cores[0]);
                g.addColorStop(1, p.cores[1]);
                d.fillStyle = g;
                d.fillRect(n(p.x), n(p.y), p.l, p.a);
                break;
            }
            case "radial": {
                // Elipse = circulo achatado: o canvas so faz gradiente redondo.
                d.save();
                d.translate(n(p.x), n(p.y));
                d.scale(1, p.a / p.l);
                const g = d.createRadialGradient(0, 0, 0, 0, 0, p.l);
                p.paradas.forEach((s, i) => g.addColorStop(s, p.cores[i]));
                d.fillStyle = g;
                d.beginPath();
                d.arc(0, 0, p.l, 0, Math.PI * 2);
                d.fill();
                d.restore();
                break;
            }
            case "poligono": {
                const pts = p.pontos;
                d.beginPath();
                d.moveTo(pts[0], pts[1]);
                for (let i = 2; i < pts.length; i += 2) d.lineTo(pts[i], pts[i + 1]);
                d.closePath();
                preencherEContornar(d, p);
                break;
            }
            case "retangulo":
                d.beginPath();
                d.roundRect(n(p.x), n(p.y), p.l, p.a, n(p.raio));
                preencherEContornar(d, p);
                break;
            case "linha":
                d.beginPath();
                d.moveTo(n(p.x), n(p.y));
                d.lineTo(n(p.x2), n(p.y2));
                contornar(d, p);
                break;
            case "texto":
                d.font = fonte(p.tam, !!p.forte);
                d.fillStyle = p.cor;
                d.textBaseline = "alphabetic";
                d.fillText(p.texto, n(p.x), n(p.y));
                break;
            case "imagem": {
                const img = imagens[p.chave];
                if (!img) break;
                d.imageSmoothingQuality = "high";
                d.drawImage(img, n(p.x), n(p.y), p.l, p.a);
                break;
            }
        }
    }

    function preencherEContornar(d, p) {
        if (p.cor) { d.fillStyle = p.cor; d.fill(); }
        contornar(d, p);
    }

    function contornar(d, p) {
        if (!p.traco) return;
        d.setLineDash(p.tracejado || []);
        d.strokeStyle = p.traco;
        d.lineWidth = p.espessura || 1;
        d.stroke();
        d.setLineDash([]);
    }

    // ------------------------------------------------------------ exportar

    function exportar(id, nome) {
        const canvas = document.getElementById(id);
        if (!canvas) return;
        canvas.toBlob(blob => baixar(blob, nome), "image/png");
    }

    window.blueBeesArte = { mascara, medir, pintar, exportar, registrar, exportarDesenho };
})();
