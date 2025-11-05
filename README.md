<h1 align="center">
  <img src=".github/Logo.svg" alt="logo" width=150px>
</h1>

Flashscore is a popular website providing live scores, statistics, and news across various sports. However, it lacks an
official API for developers to access its data. This is where FlashscoreScraping comes in.

This project serves users seeking reliable sports results data. Sports enthusiasts can use the scraper data to
to track their favorite teams, analyze past results, and predict future outcomes. Additionally, researchers,
students, and educators can utilize the data for academic purposes.

<img src=".github/FlashscoreScraping.gif" alt="logo" width=600px>

## Key Features

- **Match Data Extraction**: Comprehensive extraction of match details, scores, and team information
- **Statistics Scraping**: Detailed match statistics including Expected Goals (xG), possession, shots, passes, and more
- **Period Analysis**: Support for Full Time, 1st Half, and 2nd Half statistics separately or combined
- **Incidents Tracking**: Extract match events including goals, cards, substitutions, VAR decisions, and penalties
- **Smart Browser Management**: Automatic memory monitoring and browser restart to prevent crashes
- **Checkpoint System**: Auto-save progress and resume from interruptions
- **Real-time Dashboard**: Live progress tracking with ETA, memory usage, and performance metrics
- **Data Normalization**: Intelligent normalization of statistics with standardized formats
- **Multiple Export Formats**: Save data as JSON or CSV
- **ISO 8601 Dates**: Automatic conversion of dates to standardized ISO format
- **Context Enrichment**: Automatically adds country, league, and season metadata to each match

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

The scraper supports various command-line parameters to customize the scraping behavior. If parameters are not provided, the scraper will prompt you interactively.

| Parameter     | Default Value | Description                                                     |
| :------------ | :-----------: | :-------------------------------------------------------------- |
| `country`     |       -       | The country for which results are to be crawled.                |
| `league`      |       -       | The league for which results are to be crawled.                 |
| `fileType`    |    `json`     | The format of the output file (`json` or `csv`).                |
| `no-headless` |    `false`    | If set, the scraper will run with a graphical browser interface.|

**Note**: The scraper will also prompt you to select the **statistics period**:
- **Full Time**: Extract only full-time match statistics (default)
- **All Periods**: Extract Full Time + 1st Half + 2nd Half statistics

### Example commands

- Scrape Brazilian Serie A 2023 results and save as JSON:

  ```bash
  npm run start country=brazil league=serie-a-2023 fileType=json
  ```

- Scrape English Premier League 2022-2023 results with a graphical interface and save as CSV:

  ```bash
  npm run start country=england league=premier-league-2022-2023 no-headless fileType=csv
  ```

- Interactive mode (will prompt for all options):

  ```bash
  npm run start
  ```

## Data Example

When scraping match data, you'll receive detailed information about each match, including match metadata, teams, scores, statistics, and incidents. Below is an example of what the data might look like in `JSON` format:

### JSON Format

```json
{
  "Gd4glas0": {
    "country": "brazil",
    "league": "serie-a",
    "season": "2024",
    "seasonStartYear": null,
    "seasonEndYear": null,
    "stage": "BRASILEIRO SERIE A - ROUND 38",
    "date": "2025-02-09T16:00:00Z",
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
      "away": "2",
      "regulationTime": "0 - 2",
      "penalties": null
    },
    "information": [
      {
        "category": "Referee",
        "value": "Fernandes de Lima F. (Bra)"
      },
      {
        "category": "Stadium",
        "value": "Estadio Mineirao (Belo Horizonte)"
      }
    ],
    "incidents": [
      {
        "id": 1,
        "half": "1st Half",
        "minute": "23'",
        "team": "Away",
        "type": "Goal",
        "cardType": null,
        "player": "Hulk",
        "assist": "Scarpa G.",
        "outPlayer": null,
        "score": "0 - 1",
        "detail": null
      },
      {
        "id": 2,
        "half": "2nd Half",
        "minute": "67'",
        "team": "Home",
        "type": "Card",
        "cardType": "Yellow",
        "player": "Lucas Silva",
        "assist": null,
        "outPlayer": null,
        "score": null,
        "detail": "Foul"
      }
    ],
    "statistics": [
      {
        "category": "Expected Goals (xG)",
        "section": "Shots",
        "home": {
          "raw": "0.84",
          "value": 0.84,
          "percentage": null,
          "successful": null,
          "total": null
        },
        "away": {
          "raw": "2.51",
          "value": 2.51,
          "percentage": null,
          "successful": null,
          "total": null
        }
      },
      {
        "category": "Ball Possession",
        "section": "Passes",
        "home": {
          "raw": "42%",
          "value": 42,
          "percentage": 42,
          "successful": null,
          "total": null
        },
        "away": {
          "raw": "58%",
          "value": 58,
          "percentage": 58,
          "successful": null,
          "total": null
        }
      }
    ]
  }
}
```

### JSON Format (All Periods Mode)

When using the "All Periods" option, statistics are organized by time period:

```json
{
  "Gd4glas0": {
    "country": "brazil",
    "league": "serie-a",
    "season": "2024",
    "date": "2025-02-09T16:00:00Z",
    "status": "FINISHED",
    "home": { "name": "Cruzeiro", "image": "..." },
    "away": { "name": "Atletico-MG", "image": "..." },
    "result": { "home": "0", "away": "2" },
    "information": [...],
    "incidents": [...],
    "statistics": {
      "fullTime": [
        { "category": "Expected Goals (xG)", "section": "Shots", "home": {...}, "away": {...} }
      ],
      "firstHalf": [
        { "category": "Expected Goals (xG)", "section": "Shots", "home": {...}, "away": {...} }
      ],
      "secondHalf": [
        { "category": "Expected Goals (xG)", "section": "Shots", "home": {...}, "away": {...} }
      ]
    }
  }
}
```

## Data Breakdown

### 1. Context Metadata

Automatically added to every match:

- `country`: The country of the league (e.g., "brazil")
- `league`: The league identifier (e.g., "serie-a")
- `season`: The season name (e.g., "2024" or "2023/2024")
- `seasonStartYear`: Extracted start year for multi-year seasons (null for single-year)
- `seasonEndYear`: Extracted end year for multi-year seasons (null for single-year)

### 2. Match Information

- `stage`: The name of the competition and round (e.g., "BRASILEIRO SERIE A - ROUND 38")
- `date`: Match date in ISO 8601 format (e.g., "2025-02-09T16:00:00Z")
- `status`: The match status (e.g., "FINISHED", "LIVE", "SCHEDULED")

### 3. Teams

Objects representing home and away teams:

- `name`: The team's name
- `image`: URL to the team's logo

### 4. Result

Match result details:

- `home`: The home team's score
- `away`: The away team's score
- `regulationTime`: The result in regular time (e.g., "0 - 2"), null if not applicable
- `penalties`: The penalty shootout score (e.g., "4 - 3"), null if not applicable

### 5. Incidents

Array of match events (only for finished matches):

- `id`: Sequential incident number
- `half`: Match period ("1st Half", "2nd Half", "Extra Time")
- `minute`: Time of incident (e.g., "23'", "45+2'")
- `team`: Team involved ("Home" or "Away")
- `type`: Event type ("Goal", "Card", "Substitution", "VAR - Disallowed", "Penalty Missed", "Own Goal")
- `cardType`: If type is "Card": "Yellow", "Red", or "Yellow/Red"
- `player`: Player involved in the incident
- `assist`: Player who assisted (for goals)
- `outPlayer`: Player substituted off (for substitutions)
- `score`: Score after the incident (for goals)
- `detail`: Additional details (e.g., "Foul", "Not on pitch")

### 6. Statistics

Comprehensive match statistics with 35 standardized metrics organized into 5 sections:

**Structure**:
- `category`: The statistic name (e.g., "Expected Goals (xG)")
- `section`: Category group ("Shots", "Attack", "Passes", "Defense", "Goalkeeping")
- `home`: Home team values
- `away`: Away team values

**Value Structure**:
- `raw`: Original extracted value
- `value`: Parsed numeric value
- `percentage`: Percentage value (if applicable)
- `successful`: Successful attempts (for ratio stats like "75% (15/20)")
- `total`: Total attempts (for ratio stats)

**Statistics Sections**:

- **Shots**: Expected Goals (xG), xG on target (xGOT), Total shots, Shots on target, Shots off target, Blocked Shots, Shots inside the Box, Shots outside the Box, Hit the Woodwork, Headed Goals

- **Attack**: Big Chances, Corner Kicks, Touches in opposition box, Accurate through passes, Offsides, Free Kicks

- **Passes**: Ball Possession, Passes, Long passes, Passes in final third, Crosses, Expected assists (xA), Throw-ins

- **Defense**: Yellow Cards, Red Cards, Fouls, Tackles, Duels won, Clearances, Interceptions, Errors leading to shot, Errors leading to goal

- **Goalkeeping**: Goalkeeper Saves, xGOT faced, Goals prevented

**Note**: Missing statistics are automatically filled with zeros to maintain consistency.

### 7. Information

Array of additional match metadata:

- `category`: Information type (e.g., "Referee", "Stadium", "Attendance")
- `value`: Corresponding value

## Advanced Features

### Smart Browser Management

The scraper includes intelligent browser lifecycle management to prevent crashes and memory leaks:

- **Automatic Memory Monitoring**: Tracks JavaScript heap usage and restarts browser before memory issues occur
- **Page Leak Detection**: Monitors open pages and restarts if threshold exceeded
- **Time-based Restart**: Restarts browser periodically to maintain performance
- **Match-based Restart**: Restart after processing a set number of matches
- **Crash Recovery**: Automatically restarts browser on errors or timeouts

### Checkpoint System

Robust progress tracking that survives interruptions:

- **Auto-save**: Progress saved every 10 matches
- **Auto-resume**: Automatically resumes from last checkpoint if interrupted
- **State Persistence**: Saves match data, processed IDs, success/failure counts, and incident tracking
- **Smart Recovery**: Checkpoint expires after 2 hours to avoid stale data

### Data Normalization

Intelligent data processing for consistency:

- **Standardized Statistics**: 35 standardized metrics with fuzzy matching for variations
- **Missing Data Handling**: Automatically fills missing statistics with zeros
- **Deduplication**: Removes duplicate stats, keeping the most complete version
- **Validation**: Built-in validation to ensure data quality
- **Section Organization**: Statistics grouped into logical sections (Shots, Attack, Passes, Defense, Goalkeeping)

### Real-time Dashboard

Live progress monitoring during scraping:

```
╔══════════════════════════════════════════════════════════════════════╗
║                    FLASHSCORE SCRAPER v2.0                           ║
║  brazil → serie-a 2024                                               ║
╠══════════════════════════════════════════════════════════════════════╣
║  Progress:  ████████████████░░░░░░░░░  65% (130/200)                ║
║  ✅ Success: 125  |  ❌ Failed: 5  |  ⏱️  Avg: 8.3s                 ║
║  📊 Incidents: ✅ 110  |  ❌ 15                                      ║
║  💾 Memory: 234MB  |  🔄 Restarts: 3                                ║
║  💾 Checkpoint: 130/200 (13 saves)                                  ║
║  ⏱️  Duration: 18m 12s  |  📅 ETA: 9m 45s                          ║
╚══════════════════════════════════════════════════════════════════════╝
```

Displays:
- Real-time progress with visual progress bar
- Success/failure counts for matches and incidents
- Average processing time per match
- Memory usage and browser restart count
- Checkpoint status
- Elapsed time and estimated completion time (ETA)

### Period-based Statistics

Extract statistics for different match periods:

- **Full Time**: Standard full match statistics (90+ minutes)
- **All Periods**: Separate statistics for Full Time, 1st Half, and 2nd Half
- **Automatic Navigation**: Intelligently switches between period tabs
- **Independent Normalization**: Each period is normalized separately for consistency

### Incident Tracking

Comprehensive match event extraction:

- **Event Types**: Goals, Cards (Yellow/Red/Yellow-Red), Substitutions, VAR Decisions, Penalty Misses, Own Goals
- **Timing**: Automatic period detection (1st Half, 2nd Half, Extra Time)
- **Detailed Information**: Player names, assists, scores, card types
- **Robust Extraction**: Multiple fallback strategies for different page layouts
- **Data Cleaning**: Removes formatting artifacts and normalizes text

### Date Standardization

All dates are converted to ISO 8601 format for universal compatibility:

- **Input**: "09.02.2025 16:00" (FlashScore format)
- **Output**: "2025-02-09T16:00:00Z" (ISO 8601)
- **Benefits**: Better database integration, timezone awareness, standardized parsing

## Output Files

The scraper generates files in the `data/` directory:

- **Match Data**: `{country}_{season}.json` or `{country}_{season}.csv`
- **All Periods**: `{country}_{season}_all_periods.json` (when using All Periods mode)
- **Checkpoint**: `checkpoint_{country}_{season}.json` (temporary, deleted on completion)

## Project Structure

For a detailed overview of the project architecture and module organization, see [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md).

---

If you encounter any issues or have suggestions for improvements, feel free
to [open an issue](https://github.com/gustavofariaa/FlashscoreScraping/issues).
