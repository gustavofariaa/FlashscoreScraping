<h1 align="center">
  <img src=".github/Logo.svg" alt="logo" width=150px>
</h1>

Flashscore is a popular website providing live scores, statistics, and news across various sports. However, it lacks an
official API for developers to access its data. This is where FlashscoreScraping comes in.

This project caters to users seeking reliable sports results data. Sports enthusiasts can leverage the scraper's data to
track their favorite teams, analyze past results, and predict future outcomes. Moreover, researchers, students, and
educators can utilize the data for academic purposes.

## Getting Started

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

1. Start the scraping:

   To utilize the scraping, you need to specify a country and a league. Additionally, you can indicate whether to run
   the
   scraping in headless mode and specify the output file path.

   | Parameter  | Required | Default Value | Description                                                      |
               |:-----------|:--------:|:-------------:|:-----------------------------------------------------------------|
   | `country`  |    ✅     |       -       | The country for which results are to be crawled.                 |
   | `league`   |    ✅     |       -       | The league for which results are to be crawled.                  |
   | `headless` |          |    `false`    | When specified, the scraping runs without a user interface.      |
   | `path`     |          | `./src/data`  | The path to save the output file.                                |
   | `type`     |          |    `json`     | The format of the output file (`json` or `csv`).                 |

    - **Examples:**

    ```bash
    npm run start country=brazil league=serie-a-2023 headless
    ```

   > This command runs the s for the `Brazilian` `Serie A 2023` in `headless mode` and saves the results in `JSON`
   format to `standard output`.

    ```bash
    npm run start country=england league=premier-league-2022-2023 path=./src/data type=csv
    ```

   > This command runs the scraping for the `English` `Premier League 2022-2023` in `graphical mode` and saves the
   results in `CSV` format to the specified path `./src/data`.

## Data Example

The data returned by the scraping includes information such as match date, team names, scores, and statistics.

#### JSON Format

```json
{
  "2Ba0ep6H": {
    "date": "17.07.2023 20:00",
    "home": {
      "name": "Goias",
      "image": "https://static.example.com/image/goias.png"
    },
    "away": {
      "name": "Atletico-MG",
      "image": "https://static.example.com/image/atletico-mg.png"
    },
    "result": {
      "home": "0",
      "away": "0",
      "penalty": null,
      "status": "FINISHED"
    },
    "statistics": [
      {
        "categoryName": "Expected Goals (xG)",
        "homeValue": "1.79",
        "awayValue": "0.26"
      },
      ...
    ]
  },
  ...
}
```

#### CSV Format

```csv
matchId,date,home.name,home.image,away.name,away.image,result.home,result.away,result.penalty,result.status,Expected Goals (xG).home,Expected Goals (xG).away,...
GCMMfLmA,17.07.2023 20:00,Goias,https://static.example.com/image/goias.png,Atletico-MG,https://static.example.com/image/atletico-mg.png,0,0,FINISHED,1.79,0.26
```

#### Parameters

| Parameter    | Type               | Description                      |
|:-------------|:-------------------|:---------------------------------|
| `date`       | `string`           | The date and time of the match.  |
| `home`       | `object:Team`      | Information about the home team. |
| `away`       | `object:Team`      | Information about the away team. |
| `result`     | `object:Result`    | Result of the match.             |
| `statistics` | `array<Statistic>` | An array of match statistics.    |

### Teams

#### Parameters

| Parameter | Type     | Description                 |
|:----------|:---------|:----------------------------|
| `name`    | `string` | The name of the team.       |
| `image`   | `string` | The URL of the team's logo. |

#### JSON Format

```json

{
   "home": {
      "name": "Goias",
      "image": "https://static.example.com/image/goias.png"
   },
   "away": {
      "name": "Atletico-MG",
      "image": "https://static.example.com/image/atletico-mg.png"
   }
}
```

#### CSV Format

```csv
home.name,home.image,away.name,away.image
Goias,https://static.example.com/image/goias.png,Atletico-MG,https://static.example.com/image/atletico-mg.png
```

### Result

#### Parameters

| Parameter | Type      | Description                                                   |
|:----------|:----------|:--------------------------------------------------------------|
| `home`    | `string`  | The score of the home team.                                   |
| `away`    | `string`  | The score of the away team.                                   |
| `penalty` | `string?` | The number of penalties awarded in the match (if applicable). |
| `status`  | `string`  | The status of the match.                                      |

#### JSON Format

```json
{
  "home": "0",
  "away": "0",
  "penalty": null,
  "status": "FINISHED"
}
```
#### CSV Format

```csv
result.home,result.away,result.penalty,result.status
0,0,,FINISHED
```

### Statistics

#### Parameters

| Parameter      | Type     | Description                                   |
|:---------------|:---------|:----------------------------------------------|
| `categoryName` | `string` | The name of the statistical category.         |
| `homeValue`    | `string` | The value of the statistic for the home team. |
| `awayValue`    | `string` | The value of the statistic for the away team. |

#### JSON Format

```json
[
   {
     "categoryName": "Expected Goals (xG)",
     "homeValue": "1.79",
     "awayValue": "0.26"
   },
   {
      "categoryName": "Ball Possession",
      "homeValue": "42%",
      "awayValue": "58%"
   },
   ...
]
```

#### CSV Format

```csv
Expected Goals (xG).home,Expected Goals (xG).away,Ball Possession.home,Ball Possession.away,...
1.79,0.26,42%,58%,...
```

---

If you encounter any issues or have suggestions for improvements, feel free
to [open an issue](https://github.com/gustavofariaa/FlashscoreScraping/issues).
