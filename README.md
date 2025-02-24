<h1 align="center">
  <img src=".github/Logo.svg" alt="logo" width=150px>
</h1>

Flashscore is a popular website providing live scores, statistics, and news across various sports. However, it lacks an
official API for developers to access its data. This is where FlashscoreScraping comes in.

This project serves users seeking reliable sports results data. Sports enthusiasts can use the scraper data to
to track their favorite teams, analyze past results, and predict future outcomes. Additionally, researchers,
students, and educators can utilize the data for academic purposes.

<img src=".github/FlashscoreScraping.gif" alt="logo" width=600px>

## Getting Started

To get started with FlashscoreScraping, follow these steps:

1. Clone the project:

   ```bash
   git clone https://github.com/gustavofariaa/FlashscoreScraping.git
   ```

1. Navigate to the project directory:

   ```bash
   cd FlashscoreScraping
   ```

1. Install dependencies:

   ```bash
   npm install
   ```

1. Run the scraper:

   Once everything is installed, you can run the scraper using the following command:

   ```bash
   npm run start
   ```

## Available Command-Line Parameters

The scraper allows you to specify the country, league, output file type (JSON or CSV), and whether to run in headless mode.

| Parameter     | Default Value | Description                                              |
| :------------ | :-----------: | :------------------------------------------------------- |
| `country`     |       -       | The country for which results are to be crawled.         |
| `league`      |       -       | The league for which results are to be crawled.          |
| `fileType`    |    `json`     | The format of the output file (`JSON` or `CSV`).         |
| `no-headless` |    `false`    | If set, the scraper will run with a graphical interface. |

### Example commands

- Scrape Brazilian Serie A 2023 results and save as a `JSON` file:

  ```bash
  npm run start country=brazil league=serie-a-2023 fileType=json
  ```

- Scrape English Premier League 2022-2023 results with a graphical interface and save as a `CSV` file:

  ```bash
  npm run start country=england league=premier-league-2022-2023 no-headless fileType=csv
  ```

## Data Example

When scraping match data, you’ll receive detailed information about each match, such as the match date, teams, scores, and statistics. Below is an example of what the data might look like in `JSON` format:

### JSON Format

```json
{
  "Gd4glas0": {
    "stage": "MINEIRO - ROUND 7",
    "date": "09.02.2025 16:00",
    "status": "FINISHED",
    "home": {
      "name": "Cruzeiro",
      "image": "https://static.flashscore.com/res/image/data/lCWrxmg5-SjJmyx86.png"
    },
    "away": {
      "name": "Atletico-MG",
      "image": "https://static.flashscore.com/res/image/data/WbSJHDh5-pCk2vaSD.png"
    },
    "result": {
      "home": "0",
      "away": "2"
    },
    "information": [
      {
        "category": "Referee",
        "value": "Fernandes de Lima F. (Bra)"
      }
    ],
    "statistics": [
      {
        "category": "Ball Possession",
        "homeValue": "42%",
        "awayValue": "58%"
      }
    ]
  }
}
```

## Data Breakdown

1. Match Date

   - `stage`: The name of the competition and round (e.g., "MINEIRO - ROUND 7").
   - `date`: The date and time the match took place.
   - `status`: The match status (e.g., FINISHED).

1. Team

   An object representing the team, containing:

   - `name`: The team's name.
   - `image`: The URL to the team's logo.

1. Result

   The match result, including:

   - `home`: The home team's score.
   - `away`: The away team's score.
   - `regulationTime`: The result of the match in regular time, if applicable (null if not).
   - `penalties`: The penalty score, if applicable (null if not).

1. Statistics

   An array of match statistics, each with the following structure:

   - `category`: The name of the statistic (e.g., "Expected Goals (xG)").
   - `homeValue`: The statistic value for the home team.
   - `awayValue`: The statistic value for the away team.

1. Information

   An array of additional match information, including categories such as referee, stadium, and more.

   - `category`: The category of information (e.g., "Referee").
   - `value`: The corresponding value for that category (e.g., "Fernandes de Lima F. (Bra)").

---

If you encounter any issues or have suggestions for improvements, feel free
to [open an issue](https://github.com/gustavofariaa/FlashscoreScraping/issues).
