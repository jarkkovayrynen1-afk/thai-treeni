# Thai-treeni

Henkilökohtainen harjoitussovellus Thain konsonanttiluokkien ja sävysääntöjen automatisointiin.
Staattinen PWA (Vite + React + TypeScript), ei palvelinta – edistyminen tallentuu selaimeen.

## Kehitys

```bash
npm install
npm run dev      # kehityspalvelin
npm test         # sävymoottorin ja datan testit
npm run build    # tuotantoversio kansioon dist/
```

Jokainen push `main`-haaraan ajaa testit ja julkaisee sovelluksen GitHub Pagesiin
(`.github/workflows/deploy.yml`). Jos testit epäonnistuvat, mitään ei julkaista.

## Rakenne

- `src/data/` – konsonantit, vokaalit, sanalista, oppitunnit
- `src/engine/` – sävysäännöt (`tone.ts`), oikeinkirjoituksen jäsennin (`spelling.ts`),
  Paiboon-romanisoinnin jäsennin (`paiboon.ts`), kertausalgoritmi (`srs.ts`)
- `tests/` – jokainen sanalistan sana tarkistetaan kolmella tavalla: kirjoitusasu,
  romanisointi ja sävymoottori
- Romanisointi: Paiboon. Fontti: Sarabun (SIL OFL 1.1).
