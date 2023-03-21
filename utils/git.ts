import dayjs, { Dayjs } from "dayjs";

import { NameChangeType } from "./factories";

export interface GitCommit {
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

export type Stats = Required<
  Pick<GitFileChange, "numLinesAdded" | "numLinesDeleted">
> & { commits: GitCommit[] };

export const computeDateRange = (commits: GitCommit[]): [Dayjs, Dayjs] => [
  dayjs(
    commits.reduce(
      (earliestDateSoFar, { date }) =>
        date < earliestDateSoFar ? date : earliestDateSoFar,
      commits[0]?.date
    )
  ),
  dayjs(
    commits.reduce(
      (latestDateSoFar, { date }) =>
        date > latestDateSoFar ? date : latestDateSoFar,
      commits[0]?.date
    )
  ),
];

export const computeStatsByFileName = (
  commits: GitCommit[]
): Record<string, Stats> => {
  const fileChanges = commits
    .slice()
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
    .flatMap((commit) =>
      commit.files.map((file) => ({ commit, date: commit.date, ...file }))
    );
  const successorByPredecessor: Record<string, string> = Object.fromEntries(
    fileChanges
      .filter(
        ({ path: { beforeChange } }, index, array) =>
          beforeChange &&
          !array
            .slice(0, index)
            .find((fileChange) => fileChange.path.afterChange === beforeChange)
      )
      .map(({ path: { afterChange, beforeChange } }) => [
        beforeChange,
        afterChange,
      ])
  );

  return fileChanges.reduce<
    Record<
      string,
      { commits: GitCommit[]; numLinesAdded: number; numLinesDeleted: number }
    >
  >((statsByPath, fileChange) => {
    let path = fileChange.path.afterChange;
    while (successorByPredecessor[path]) {
      path = successorByPredecessor[path];
    }

    return Object.assign(statsByPath, {
      [path]: {
        commits: (statsByPath[path]?.commits ?? []).concat(fileChange.commit),
        numLinesAdded:
          (statsByPath[path]?.numLinesAdded ?? 0) +
          (fileChange?.numLinesAdded ?? 0),
        numLinesDeleted:
          (statsByPath[path]?.numLinesDeleted ?? 0) +
          (fileChange?.numLinesDeleted ?? 0),
      },
    });
  }, {});
};

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

export const splitGitLog = (gitLogString: string): string[] =>
  `\n${gitLogString}`.split(/\ncommit /).slice(1);
