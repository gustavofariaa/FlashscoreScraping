export const convertDataToCsv = (data) =>
  Object.keys(data).map((matchId) => {
    const { date, home, away, result, statistics } = data[matchId];
    const statsObject = {};

    statistics.forEach((stat) => {
      statsObject[stat.categoryName] = {
        home: stat.homeValue,
        away: stat.awayValue,
      };
    });

    return { matchId, date, home, away, result, ...statsObject };
  });
