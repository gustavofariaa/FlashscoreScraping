<h1 align="center">
  <img src=".github/Logo.svg" alt="FlashscoreScraping logo" width="150px" />
</h1>

<p align="center">
  <b>Scrape match results, statistics, and league data from Flashscore</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/node-%3E=18.0.0-green?style=flat-square" />
  <img src="https://img.shields.io/badge/scraper-playwright-blue?style=flat-square" />
  <img src="https://img.shields.io/badge/output-JSON%20%7C%20CSV-orange?style=flat-square" />
</p>

<p align="center">
  <img src=".github/FlashscoreScraping.gif" alt="Demo" width="600px" />
</p>

## 📌 About the Project

[Flashscore](https://flashscore.com) is one of the most popular platforms for real-time sports results, statistics, and standings, but it has **no official API**.

**FlashscoreScraping** bridges this gap by extracting structured match data directly from the site, enabling use in:

- 🔎 Tracking favorite teams and leagues
- 📊 Building analytics dashboards
- 🧠 Research & academic datasets
- 🤖 Bots, automations, ML training, data pipelines

## 🚀 Getting Started

```bash
git clone https://github.com/gustavofariaa/FlashscoreScraping.git
cd FlashscoreScraping
npm install
npx playwright install-deps chromium
npm run start
```

## Command-Line Parameters

| Parameter      | Default |       Required       | Description                                                                        |
| :------------- | :-----: | :------------------: | :--------------------------------------------------------------------------------- |
| `country`      |    -    | ✅ if using `league` | Country to scrape (e.g. `brazil`)                                                  |
| `league`       |    -    |          ❌          | Specific league to scrape (e.g. `serie-a`)                                         |
| `fileType`     | `json`  |          ❌          | Output format: `json`, `json-array` or `csv`                                       |
| `concurrency`  |  `10`   |          ❌          | Number of matches scraped in parallel. Higher = faster, but heavier on CPU/network |
| `saveInterval` |  `10`   |          ❌          | Number of matches processed before data is saved to disk                           |
| `headless`     | `true`  |          ❌          | Show browser UI (`false`) or run hidden (`true`)                                   |

### Examples

Scrape Brazilian Serie A 2023 into JSON:

```bash
npm run start country=brazil league=serie-a-2023 fileType=json
```

Scrape Premier League 22/23 with visible browser and export CSV:

```bash
npm run start country=england league=premier-league-2022-2023 headless=false fileType=csv
```

## Data Structure

Each match result includes:

```json
{
  "IHCq3ARL": {
    "stage": "FINAL",
    "date": "20.02.2022 16:00",
    "status": "AFTER PENALTIES",
    "home": {
      "name": "Atletico-MG",
      "image": "https://static.flashscore.com/res/image/data/WbSJHDh5-pCk2vaSD.png"
    },
    "away": {
      "name": "Flamengo RJ",
      "image": "https://static.flashscore.com/res/image/data/ADvIaiZA-2R2JjDQC.png"
    },
    "result": {
      "home": "3",
      "away": "2",
      "regulationTime": "2-2",
      "penalties": "8-7"
    },
    "information": [
      {
        "category": "Referee",
        "value": "Daronco A. (Bra)"
      },
      {
        "category": "Venue",
        "value": "Arena Pantanal (Cuiabá)"
      },
      {
        "category": "Capacity",
        "value": "44 000"
      }
    ],
    "statistics": [
      {
        "category": "Ball Possession",
        "homeValue": "57%",
        "awayValue": "43%"
      }
      // statistics are dynamic and may vary per match
    ]
  }
}
```

### Field Reference

| Field           | Type     | Description                                            |
| :-------------- | :------- | :----------------------------------------------------- |
| `matchId`       | `string` | Unique identifier for the match                        |
| `stage`         | `string` | Competition phase or round (e.g., `QUARTER-FINALS`)    |
| `status`        | `string` | Current or final state of the match (e.g., `FINISHED`) |
| `date`          | `string` | Full match date & time (dd.mm.yyyy hh:mm)              |
| `home` / `away` | `object` | Team data (name + logo URL)                            |
| `result`        | `object` | Match score data (may be empty if not available)       |
| `information`   | `array`  | Extra match info (referee, stadium, etc.)              |
| `statistics`    | `array`  | Variable-length list of stats (depends on match)       |

## Issues & Contribution

Found a bug? Want to suggest a feature? [Open an issue](https://github.com/gustavofariaa/FlashscoreScraping/issues)

## Support

If this project helped you, consider leaving a star. It motivates development and helps more people find the repo.
