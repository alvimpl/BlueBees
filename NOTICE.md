# Avisos de terceiros

> O **código** deste repositório está sob licença MIT — veja `LICENSE`. Este
> arquivo trata do que **não** é nosso e veio com outras obrigações.

O Blue Bees não é feito só de código nosso. Ele **redistribui dados e imagens de
terceiros**, e este arquivo diz de quem, sob qual licença e onde cada coisa está.
As mesmas atribuições aparecem no rodapé da aba Codex do aplicativo — este arquivo
existe porque o repositório também é uma forma de distribuição, e a atribuição
precisa acompanhar a cópia, não só a tela.

---

## ARK Wiki — CC BY-NC-SA 4.0

<https://ark.wiki.gg>

Licença: [Creative Commons Atribuição-NãoComercial-CompartilhaIgual 4.0
Internacional](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.pt-br)

**O que vem de lá:**

| Onde | O que é |
|---|---|
| `src/BlueBees/Assets/Codex/codex.json` | criaturas, doma, reprodução, receitas, traits, regiões de cor, estatísticas e a paleta de 227 cores |
| `src/BlueBees/Assets/Codex/icons/` | ícone de cada criatura |
| `src/BlueBees/Assets/Codex/items/` | ícone de cada item |

Os dados são compilados das tabelas Cargo e dos módulos Lua da wiki pela
ferramenta `src/BlueBeesCodex`. As imagens de dossiê e as de região de cor **não**
estão no repositório: são baixadas sob demanda, da wiki, na máquina de quem usa.

Três consequências desta licença, ditas em voz alta porque são fáceis de esquecer:

- **Atribuição** — a fonte tem de ser creditada em qualquer redistribuição.
- **CompartilhaIgual** — o dado derivado (o `codex.json`, entre outros) segue sob
  a mesma CC BY-NC-SA 4.0, mesmo estando num repositório cujo código tem outra
  licença.
- **NãoComercial** — o uso comercial não é permitido pela licença da fonte. O
  aplicativo é gratuito e não vende nada; o link de doação da tribo existe para
  cobrir custo, não para vender o programa.

## ARK Breeding Calculator — MIT

<https://github.com/Crumplecorn/ARK-Breeding-Calculator>

Copyright (c) Crumplecorn. Licença MIT — o texto completo está em `README.txt`.

**O que vem de lá:** os parâmetros de criação de filhote (`RaisingInfo`,
`RaisingFoods`, `FoodLists`, `FoodOrder` no `codex.json`), lidos do `controller.js`
pelo `src/BlueBeesCodex/RaisingSource.cs`.

E mais que dados: `Services/RaisingCalculator.cs` e `Services/TroughSimulator.cs`
são **transcrições** do cálculo dele. Foi escolha deliberada — reimplementar de
cabeça daria número plausível e errado, e a fonte tem detalhes que ninguém acerta
adivinhando.

A wiki não publica consumo de comida de filhote em lugar nenhum, e é por isso que
existe uma segunda fonte com uma segunda licença.

## Wildcard / Studio Wildcard

A lista de servidores oficiais e as taxas vêm dos endpoints públicos publicados
pela Wildcard:

```
https://cdn2.arkdedicated.com/servers/asa/officialserverlist.json
```

O Blue Bees apenas consulta e exibe. **ARK: Survival Ascended** e **ARK: Survival
Evolved** são marcas da Studio Wildcard. Este projeto não é afiliado à Studio
Wildcard, nem endossado por ela.
