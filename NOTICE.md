# Third-party notices

> The **code** in this repository is under the MIT licence — see `LICENSE`. This
> file is about what is **not** ours and came with other obligations.

Blue Bees is not made of our code alone. It **redistributes third-party data and
images**, and this file says whose, under which licence, and where each piece
lives. The same attributions appear in the footer of the app's Codex tab — this
file exists because a repository is also a form of distribution, and attribution
has to travel with the copy, not just with the screen.

---

## ARK Wiki — CC BY-NC-SA 4.0

<https://ark.wiki.gg>

Licence: [Creative Commons Attribution-NonCommercial-ShareAlike 4.0
International](https://creativecommons.org/licenses/by-nc-sa/4.0/)

**What comes from there:**

| Where | What it is |
|---|---|
| `src/BlueBees/Assets/Codex/codex.json` | creatures, taming, breeding, recipes, traits, colour regions, stats, and the 227-colour palette |
| `src/BlueBees/Assets/Codex/icons/` | one icon per creature |
| `src/BlueBees/Assets/Codex/items/` | one icon per item |

The data is compiled from the wiki's Cargo tables and Lua modules by the
`src/BlueBeesCodex` tool. Dossier art and colour-region images are **not** in the
repository: they are downloaded on demand, from the wiki, on the user's machine.

Three consequences of this licence, said out loud because they are easy to
forget:

- **Attribution** — the source must be credited in any redistribution.
- **ShareAlike** — the derived data (`codex.json`, among others) stays under the
  same CC BY-NC-SA 4.0, even while living in a repository whose code carries a
  different licence.
- **NonCommercial** — commercial use is not permitted by the source's licence.
  The app is free and sells nothing; the tribe's donation link exists to cover
  costs, not to sell the program.

## ARK Breeding Calculator — MIT

<https://github.com/Crumplecorn/ARK-Breeding-Calculator>

Copyright (c) Crumplecorn. MIT licence — the full text is in `README.txt`.

**What comes from there:** the baby raising parameters (`RaisingInfo`,
`RaisingFoods`, `FoodLists`, `FoodOrder` in `codex.json`), read from
`controller.js` by `src/BlueBeesCodex/RaisingSource.cs`.

And more than data: `Services/RaisingCalculator.cs` and
`Services/TroughSimulator.cs` are **transcriptions** of his maths. That was
deliberate — reimplementing from scratch would produce plausible, wrong numbers,
and the source has details nobody gets right by guessing.

The wiki does not publish baby food consumption anywhere, and that is why there
is a second source with a second licence.

## Wildcard / Studio Wildcard

The official server list and the rates come from the public endpoints published
by Wildcard:

```
https://cdn2.arkdedicated.com/servers/asa/officialserverlist.json
```

Blue Bees only reads and displays them. **ARK: Survival Ascended** and **ARK:
Survival Evolved** are trademarks of Studio Wildcard. This project is not
affiliated with or endorsed by Studio Wildcard.
