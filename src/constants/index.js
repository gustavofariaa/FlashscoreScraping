export const BASE_URL = "https://www.flashscore.com";
export const OUTPUT_PATH = "./src/data";
export const TIMEOUT = 2500;
export const FileTypes = Object.freeze({
  JSON: {
    label: "JSON (Padrão)",
    argument: "json",
    extension: ".json",
  },
  JSON_ARRAY: {
    label: "JSON Array (Lista)",
    argument: "json-array",
    extension: ".array.json",
  },
  CSV: {
    label: "Arquivo CSV",
    argument: "csv",
    extension: ".csv",
  },
});
