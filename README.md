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

1. Start the crawler:

   To utilize the crawler, you need to specify a country and a league. Additionally, you can indicate whether to run the
   crawler in headless mode and specify the output file path.

   | Parameter  | Required | Default Value | Description                                                |
   |:-----------|:--------:|:-------------:|:-----------------------------------------------------------|
   | `country`  |    ✅     |       -       | The country for which results are to be crawled.           |
   | `league`   |    ✅     |       -       | The league for which results are to be crawled.            |
   | `headless` |          |    `false`    | When specified, the crawler runs without a user interface. |
   | `path`     |          | `./src/data`  | The path to save the JSON file with crawler results.       |

    - **Examples:**

    ```bash
    npm run start country=brazil league=serie-a-2023 headless
    ```

   > This command runs the crawler for the Brazilian Serie A 2023, in headless mode, and saves the results to standard
   output.

    ```bash
    npm run start country=england league=premier-league-2022-2023 path=./src/data
    ```

   > This command runs the crawler for the English Premier League 2022-2023, in graphical mode, and saves the result to
   the specified path `./src/data`.

## Data Example

The data returned by the crawler is in JSON format and includes information such as match date, team names, scores, and
statistics.

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

| Parameter    | Type               | Description                      |
|:-------------|:-------------------|:---------------------------------|
| `date`       | `string`           | The date and time of the match.  |
| `home`       | `object:Team`      | Information about the home team. |
| `away`       | `object:Team`      | Information about the away team. |
| `result`     | `object:Result`    | Result of the match.             |
| `statistics` | `array<Statistic>` | An array of match statistics.    |

### Team

```json
{
  "name": "Atletico-MG",
  "image": "https://static.example.com/image/atletico-mg.png"
}
```

| Parameter | Type     | Description                 |
|:----------|:---------|:----------------------------|
| `name`    | `string` | The name of the team.       |
| `image`   | `string` | The URL of the team's logo. |

### Result

```json
{
  "home": "0",
  "away": "0",
  "penalty": null,
  "status": "FINISHED"
}
```

| Parameter | Type      | Description                                                   |
|:----------|:----------|:--------------------------------------------------------------|
| `home`    | `string`  | The score of the home team.                                   |
| `away`    | `string`  | The score of the away team.                                   |
| `penalty` | `string?` | The number of penalties awarded in the match (if applicable). |
| `status`  | `string`  | The status of the match.                                      |

### Statistics

```json
{
  "categoryName": "Expected Goals (xG)",
  "homeValue": "1.79",
  "awayValue": "0.26"
}
```

| Parameter      | Type     | Description                                   |
|:---------------|:---------|:----------------------------------------------|
| `categoryName` | `string` | The name of the statistical category.         |
| `homeValue`    | `string` | The value of the statistic for the home team. |
| `awayValue`    | `string` | The value of the statistic for the away team. |

---

If you encounter any issues or have suggestions for improvements, feel free to [open an issue](https://github.com/gustavofariaa/FlashscoreScraping/issues).
