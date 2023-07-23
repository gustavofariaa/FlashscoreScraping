<h1 align="center">
  <img src=".github/Logo.svg" alt="logo" width=150px>
</h1>

Flashscore is a popular website that provides live scores, statistics, and news for a variety of sports. However, the website does not provide an API for developers to access this data. This is where FlashscoreScraping comes in.

This project works for users looking for reliable information about sports results. Sports enthusiasts can rely on the scraper's data to track their favorite teams, analyze past results, and predict future outcomes. Additionally, researchers, students, and educators can use the data for academic purposes.


## Getting Started

1. Clone the project

    ```bash
      git clone https://github.com/gustavofariaa/FlashscoreScraping.git
    ```

1. Go to the project directory

    ```bash
      cd FlashscoreScraping
    ```

1. Install dependencies

    ```bash
      npm install
    ```

1. Start the crawler

    To use the crawler, you must specify a country and a league. You can also specify whether you want to run the crawler in headless mode and the path to the output file.

    ```bash
      npm run start country=brazil league=serie-a-2023 headless
    ```

    > This command runs the crawler in Brazilian Serie A 2023, in headless mode and saves the results to standard output.

    ```bash
      npm run start country=england league=premier-league-2022-2023 path=./src/data
    ```

    > This command runs the crawler in England Premier League 2022 - 2023, in graphical mode and saves the result to a path `./src/data`.

    | Parameter  |Required | Default value | Description                        |
    | :-         | :-:     | :-            |:-                |
    | `country`  | ✅     | -            | Country for which you want to crawl results. |
    | `league`   | ✅     | -             | League for which you want to crawl results. |
    | `headless` | -      | `false`        | When this argument is specified, the crawler runs without a user interface. |
    | `path`     | -      | `.src/data`    | The path to save the JSON file with crawler results. |


## Data Example

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

| Parameter    | Type              | Description                        |
| :-           | :-                | :-                                 |
| `date`       | `string`          | Date and time of the match.        |
| `home`       | `object:Team`     | Home team.                         |
| `away`       | `object:Team`     | Away team.                         |
| `result`     | `object:Result`   | Result of the match.               |
| `statistics` | `array<Statistic>`| Array of statistics for the match. |

### Team

```json
{
  "name": "Atletico-MG",
  "image": "https://static.example.com/image/atletico-mg.png"
}
```

| Parameter | Type     | Description              |
| :-        | :-       | :-                       |
| `name`    | `string` | Name of the team.        |
| `image`   | `string` | URL of the team's logo.  |

### Result

```json
{
  "home": "0",
  "away": "0",
  "penalty": null,
  "status": "FINISHED"
}
```

| Parameter | Type      | Description                               |
| :-        | :-        | :-                                        |
| `home`    | `string`  | Score of the home team.                   |
| `away`    | `string`  | Score of the away team.                   |
| `penalty` | `string?` | Number of penalties awarded in the match. |
| `status`  | `string`  | Status of the match                       |

### Statistics

```json
{
  "categoryName": "Expected Goals (xG)",
  "homeValue": "1.79",
  "awayValue": "0.26"
}
```

| Parameter      | Type     | Description                                   |
| :-             | :-       | :-                                            |
| `categoryName` | `string` | Name of the statistical category.             |
| `homeValue`    | `string` | Value of the statistic for the home team.     |
| `awayValue`    | `string` | Value of the statistic for the away team.     |
