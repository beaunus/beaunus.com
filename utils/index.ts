import encHex from "crypto-js/enc-hex";
import sha256 from "crypto-js/sha256";

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const stringToHex = (string: string) =>
  `#${sha256(string).toString(encHex).slice(0, 6)}`;
