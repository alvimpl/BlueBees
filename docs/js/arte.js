// A aba Artes da versao web: ler mascara como pixels, desenhar o cartao e
// exportar o PNG.
//
// O CARTAO E O ArtCard.cs DO DESKTOP, transcrito: mesmas medidas, cores e
// ordem de desenho. Mudou la, muda aqui -- as duas artes precisam sair iguais.
// Tamanho de fonte: o WPF recebe ponto e desenha em px (pt * 96 / 72); o
// DrawText posiciona o TOPO da linha, e a linha de base da Segoe UI fica 1,079
// em abaixo dele.
//
// A conta da pintura NAO esta aqui: ela e o TintCore do Core, em C#. Este
// arquivo so entrega os pixels e desenha o resultado.
(function () {
    "use strict";

    const LARGURA = 1200, ALTURA = 630;
    const MEL = "#FDF3D8", CEU = "#E6F0F9", TINTA = "#16243C", SUAVE = "#7686A0",
          AMBAR = "#E2A01E", BORDA = "#E2DCC8", OURO = [224, 168, 60];
    const FONTE = '"Segoe UI", system-ui, -apple-system, Roboto, sans-serif';
    const ASCENDENTE = 1.079;

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
    async function mascara(url) {
        const img = new Image();
        img.decoding = "async";
        img.src = url;
        try { await img.decode(); } catch { return null; }

        const w = img.naturalWidth, h = img.naturalHeight;
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

    // ------------------------------------------------------------- cartao

    async function desenhar(id, json, dino) {
        const canvas = document.getElementById(id);
        if (!canvas) return;
        await promessaLogo;
        const m = JSON.parse(json);
        const d = canvas.getContext("2d");
        canvas.width = LARGURA;
        canvas.height = ALTURA;

        fundo(d);
        favo(d);
        halo(d);
        desenharDino(d, dino, m.dinoLargura, m.dinoAltura);
        painel(d, m);
    }

    function fundo(d) {
        // LinearGradientBrush(Mel, Ceu, 55): de (0,0) ate (cos 55, sin 55) na
        // caixa relativa.
        const a = 55 * Math.PI / 180;
        const g = d.createLinearGradient(0, 0, Math.cos(a) * LARGURA, Math.sin(a) * ALTURA);
        g.addColorStop(0, MEL);
        g.addColorStop(1, CEU);
        d.fillStyle = g;
        d.fillRect(0, 0, LARGURA, ALTURA);
    }

    function favo(d) {
        const lado = 44, inset = 250;
        for (let linha = -1; linha < 12; linha++)
            for (let col = -1; col < 20; col++) {
                const cx = col * (lado * 1.5);
                const cy = linha * (lado * 1.732) + (col % 2 !== 0 ? lado * 0.866 : 0);
                const dist = Math.max(0, Math.min(Math.min(cx, LARGURA - cx), Math.min(cy, ALTURA - cy)));
                if (dist >= inset) continue;
                const f = Math.pow(1 - dist / inset, 1.6);
                if (f <= 0.02) continue;

                hexagono(d, cx, cy, lado);
                const semente = Math.abs((col * 37 + linha * 91) % 100) / 100;
                if (semente < f * 0.85) {
                    d.fillStyle = `rgba(240,186,74,${(24 + 62 * f) / 255})`;
                    d.fill();
                }
                d.strokeStyle = `rgba(214,166,62,${(30 + 70 * f) / 255})`;
                d.lineWidth = 1.2 + 1.4 * f;
                d.stroke();
            }
    }

    function halo(d) {
        d.save();
        d.translate(880, 320);
        d.scale(1, 430 / 500);
        const g = d.createRadialGradient(0, 0, 0, 0, 0, 500);
        const [r, gg, b] = OURO;
        g.addColorStop(0, `rgba(${r},${gg},${b},${74 / 255})`);
        g.addColorStop(0.26, `rgba(${r},${gg},${b},${60 / 255})`);
        g.addColorStop(0.62, `rgba(${r},${gg},${b},${22 / 255})`);
        g.addColorStop(1, `rgba(${r},${gg},${b},0)`);
        d.fillStyle = g;
        d.beginPath();
        d.arc(0, 0, 500, 0, Math.PI * 2);
        d.fill();
        d.restore();
    }

    function desenharDino(d, bgra, w, h) {
        if (!bgra || !bgra.length || !w || !h) return;

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

        // Encaixa na area da direita mantendo a proporcao, como no desktop.
        const areaX = 500, areaY = 120, areaW = 700, areaH = 420;
        const escala = Math.min(areaW / w, areaH / h);
        const dw = w * escala, dh = h * escala;
        d.imageSmoothingQuality = "high";
        d.drawImage(c, areaX + (areaW - dw) / 2, areaY + (areaH - dh) / 2, dw, dh);
    }

    function painel(d, m) {
        const px = 38, py = 38, pw = 440, ph = ALTURA - 76;
        retanguloRedondo(d, px, py, pw, ph, 20);
        d.fillStyle = "rgba(255,255,255,0.918)";
        d.fill();
        d.strokeStyle = BORDA;
        d.lineWidth = 1;
        d.stroke();

        const x = px + 28;
        let y = py + 22;
        const r = m.rotulos;

        titulo(d, m.criatura, x - 2, y, pw - 56);
        texto(d, m.sexo, x + 2, y + 46, 8, true, SUAVE);
        y += 76;

        texto(d, r.nivel, x, y, 8, true, SUAVE);
        texto(d, `${m.nivel}`, x, y + 12, 25, true, AMBAR);
        if (m.nivelSelvagem > 0)
            texto(d, `${m.nivelSelvagem} + ${m.nivelDomado}`, x + 72, y + 28, 9, false, SUAVE);
        texto(d, r.imprint, x + 250, y, 8, true, SUAVE);
        texto(d, `${m.imprint}%`, x + 250, y + 12, 25, true, TINTA);
        y += 62;

        linha(d, x, y, x + 384);
        y += 12;

        texto(d, r.stats, x, y, 8, true, SUAVE);
        texto(d, "W", x + 200, y, 8, true, SUAVE);
        texto(d, "M", x + 238, y, 8, true, SUAVE);
        texto(d, "T", x + 276, y, 8, true, SUAVE);
        texto(d, r.valor, x + 318, y, 8, true, SUAVE);
        y += 18;

        for (const s of m.stats) {
            texto(d, s.nome, x, y, 11, false, TINTA);
            texto(d, `${s.selvagem}`, x + 198, y, 11, true, TINTA);
            texto(d, `${s.mutacao}`, x + 236, y, 11, true, s.mutacao === 0 ? SUAVE : AMBAR);
            texto(d, `${s.domado}`, x + 274, y, 11, false, SUAVE);
            texto(d, s.valor, x + 306, y, 11, true, TINTA);
            y += 25;
        }

        y += 6;
        linha(d, x, y, x + 384);
        y += 12;
        texto(d, r.regioes, x, y, 8, true, SUAVE);
        y += 18;
        regioes(d, m.regioes, x, y);

        assinatura(d, x, py + ph - 60);
    }

    function regioes(d, lista, x, y) {
        let cx = x;
        for (const r of lista) {
            retanguloRedondo(d, cx, y, 30, 30, 7);
            if (r.cor) {
                d.fillStyle = r.cor;
                d.fill();
                d.setLineDash([]);
                d.strokeStyle = BORDA;
                d.lineWidth = 1;
                d.stroke();
                texto(d, `R${r.id}`, cx + 1, y + 32, 8, true, TINTA);
                texto(d, `${r.corId}`, cx + 1, y + 44, 8, false, SUAVE);
            } else {
                d.setLineDash([3, 3]);
                d.strokeStyle = BORDA;
                d.lineWidth = 1.5;
                d.stroke();
                d.beginPath();
                d.moveTo(cx + 10, y + 15);
                d.lineTo(cx + 20, y + 15);
                d.stroke();
                d.setLineDash([]);
                texto(d, `R${r.id}`, cx + 1, y + 32, 8, true, BORDA);
            }
            cx += 64;
        }
    }

    function assinatura(d, x, y) {
        if (logo) d.drawImage(logo, x, y, 40, 40);
        texto(d, "BLUE BEES", x + 50, y + 2, 15, true, TINTA);
        texto(d, "ARK: SURVIVAL ASCENDED", x + 51, y + 25, 7.5, true, SUAVE);
    }

    // ------------------------------------------------------------- pinceis

    const px = pt => pt * 96 / 72;
    const fonte = (pt, forte) => `${forte ? "bold " : ""}${px(pt)}px ${FONTE}`;

    function texto(d, txt, x, y, pt, forte, cor) {
        if (!txt) return;
        d.font = fonte(pt, forte);
        d.fillStyle = cor;
        d.textBaseline = "alphabetic";
        d.fillText(txt, x, y + px(pt) * ASCENDENTE);
    }

    // Cabe numa linha do maior tamanho que couber, de 30 ate 20 pontos; senao,
    // duas linhas de 17 pontos com reticencias -- a mesma regra do desktop.
    function titulo(d, txt, x, y, largura) {
        if (!txt) return;
        d.fillStyle = TINTA;
        d.textBaseline = "alphabetic";
        for (let tam = 30; tam >= 20; tam -= 0.5) {
            d.font = fonte(tam, true);
            if (d.measureText(txt).width > largura) continue;
            d.fillText(txt, x, y + px(tam) * ASCENDENTE);
            return;
        }

        d.font = fonte(17, true);
        const linhas = quebrar(d, txt, largura, 2);
        linhas.forEach((l, i) => d.fillText(l, x, y - 6 + i * 24 + px(17) * ASCENDENTE));
    }

    function quebrar(d, txt, largura, max) {
        const palavras = txt.split(" ");
        const linhas = [];
        let atual = "";
        for (const p of palavras) {
            const tenta = atual ? `${atual} ${p}` : p;
            if (d.measureText(tenta).width <= largura || !atual) { atual = tenta; continue; }
            linhas.push(atual);
            atual = p;
        }
        if (atual) linhas.push(atual);
        if (linhas.length <= max) return linhas;

        const corte = linhas.slice(0, max);
        let ultima = corte[max - 1];
        while (ultima.length > 1 && d.measureText(ultima + "…").width > largura) ultima = ultima.slice(0, -1);
        corte[max - 1] = ultima + "…";
        return corte;
    }

    function linha(d, x1, y, x2) {
        d.beginPath();
        d.moveTo(x1, y);
        d.lineTo(x2, y);
        d.strokeStyle = BORDA;
        d.lineWidth = 1;
        d.setLineDash([]);
        d.stroke();
    }

    function hexagono(d, cx, cy, lado) {
        d.beginPath();
        d.moveTo(cx + lado, cy);
        for (let k = 1; k < 6; k++) {
            const a = Math.PI / 180 * (60 * k);
            d.lineTo(cx + lado * Math.cos(a), cy + lado * Math.sin(a));
        }
        d.closePath();
    }

    function retanguloRedondo(d, x, y, w, h, r) {
        d.beginPath();
        d.roundRect(x, y, w, h, r);
    }

    // ------------------------------------------------------------ exportar

    function exportar(id, nome) {
        const canvas = document.getElementById(id);
        if (!canvas) return;
        canvas.toBlob(blob => {
            if (!blob) return;
            const a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = nome;
            document.body.appendChild(a);
            a.click();
            a.remove();
            setTimeout(() => URL.revokeObjectURL(a.href), 10000);
        }, "image/png");
    }

    window.blueBeesArte = { mascara, desenhar, exportar };
})();
