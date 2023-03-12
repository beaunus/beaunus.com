import { NameChangeType } from "./factories";

interface GitCommit {
  author: string;
  commitHash: string;
  date: Date;
  files: GitFileChange[];
  message: string;
}

interface GitFileChange {
  numLinesAdded?: number;
  numLinesDeleted?: number;
  path: GitFileChangePath;
}

interface GitFileChangePath {
  afterChange: string;
  beforeChange?: string;
}

export const parseCommitString = (commitString: string): GitCommit => {
  const [commitHash, authorString, dateString, , ...messageAndFilesStrings] =
    commitString.split("\n").filter((line) => !line.startsWith("Merge: "));

  const indexOfFileChanges = messageAndFilesStrings.indexOf("") + 1;

  return {
    author: authorString.replace("Author:", "").trim(),
    commitHash,
    date: new Date(dateString.replace("Date:", "").trim()),
    files: messageAndFilesStrings
      .slice(indexOfFileChanges, messageAndFilesStrings.length - 1)
      .map(parseFileString),
    message: messageAndFilesStrings
      .slice(0, indexOfFileChanges)
      .join("")
      .trim()
      .replaceAll("    ", "\n"),
  };
};

export const parseFileString = (fileString: string): GitFileChange => {
  const [numLinesAdded, numLinesDeleted, pathString] = fileString
    .trim()
    .split("\t");
  const isBinaryFile = numLinesAdded === "-" && numLinesDeleted === "-";

  return {
    ...(isBinaryFile
      ? {}
      : {
          numLinesAdded: Number(numLinesAdded),
          numLinesDeleted: Number(numLinesDeleted),
        }),
    // Allow this "sibling" function to be mocked in tests
    path: module.exports.parsePathString(pathString),
  };
};

export const parsePathString = (pathString: string): GitFileChangePath => {
  const nameChangeType: NameChangeType = pathString.includes("=>")
    ? pathString.includes("{")
      ? "partial"
      : "full"
    : undefined;

  const [commonPrefix, changeSubstring, commonSuffix] =
    nameChangeType === "partial"
      ? pathString.split(/[{}]/)
      : ["", pathString, ""];
  const [beforePart, afterPart] = changeSubstring.split(" => ") ?? [];

  return nameChangeType
    ? {
        afterChange: `${commonPrefix}${afterPart}${commonSuffix}`,
        beforeChange: `${commonPrefix}${beforePart}${commonSuffix}`,
      }
    : { afterChange: pathString };
};
