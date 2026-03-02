export const BASE_URL = "https://www.flashscore.com";
export const OUTPUT_PATH = "./src/data";
export const TIMEOUT = 2500;
export const FileTypes = Object.freeze({
  JSON: {
    label: "JSON",
    argument: "json",
    extension: ".json",
  },
  JSON_ARRAY: {
    label: "JSON Array",
    argument: "json-array",
    extension: ".array.json",
  },
  CSV: {
    label: "CSV",
    argument: "csv",
    extension: ".csv",
  },
});
export const Sports = Object.freeze({
  FOOTBALL: {
    label: "Football",
    argument: "football",
  },
  HOCKEY: {
    label: "Hockey",
    argument: "hockey",
  },
});
