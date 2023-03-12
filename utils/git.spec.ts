import { aGitPathString, aGitFileLine, NameChangeType } from "./factories";
import * as Git from "./git";

describe("git", () => {
  describe("parseFileNameString", () => {
    describe("no nameChangeType", () => {
      it("should return the pathString itself as afterChange", () => {
        const pathString = aGitPathString();
        const actual = Git.parsePathString(pathString);

        expect(actual).toStrictEqual({ afterChange: pathString });
      });
    });

    describe("full nameChangeType", () => {
      it("should return the correct beforeChange and afterChange values", () => {
        const pathString = aGitPathString("full");
        const [beforeChange, afterChange] = pathString.split(" => ");
        const actual = Git.parsePathString(pathString);

        expect(actual).toStrictEqual({ afterChange, beforeChange });
      });
    });

    describe("partial nameChangeType", () => {
      it("should return the correct beforeChange and afterChange values", () => {
        const pathString = aGitPathString("partial");
        const [commonPrefix, changeSubstring, commonSuffix] =
          pathString.split(/[{}]/);
        const [before, after] = changeSubstring.split(" => ");
        const actual = Git.parsePathString(pathString);

        expect(actual).toStrictEqual({
          afterChange: `${commonPrefix}${after}${commonSuffix}`,
          beforeChange: `${commonPrefix}${before}${commonSuffix}`,
        });
      });
    });
  });

  describe("parseFileString", () => {
    describe("numLinesAdded and numLinesDeleted", () => {
      describe.each<NameChangeType>([undefined, "full", "partial"])(
        "with nameChangeType: %s",
        (nameChange) => {
          describe("non-binary file", () => {
            it("should be non-negative numbers", () => {
              const actual = Git.parseFileString(
                aGitFileLine({ isBinary: false, nameChangeType: nameChange })
              );

              expect(actual.numLinesAdded).toBeGreaterThanOrEqual(0);
              expect(actual.numLinesDeleted).toBeGreaterThanOrEqual(0);
            });
          });

          describe("binary file", () => {
            it("should be undefined", () => {
              const actual = Git.parseFileString(
                aGitFileLine({ isBinary: true, nameChangeType: nameChange })
              );

              expect(actual.numLinesAdded).toBeUndefined();
              expect(actual.numLinesDeleted).toBeUndefined();
            });
          });
        }
      );
    });

    describe("path", () => {
      describe.each<boolean>([false, true])("with isBinary: %p", (isBinary) => {
        describe.each<NameChangeType>([undefined, "full", "partial"])(
          "with nameChangeType: %s",
          (nameChangeType) => {
            it("should be whatever parsePathString returns", () => {
              const expected = {
                afterChange: `${Math.random()}`,
                beforeChange: `${Math.random()}`,
              };
              jest.spyOn(Git, "parsePathString").mockReturnValue(expected);

              const gitFileLine = aGitFileLine({ isBinary, nameChangeType });
              const [, , pathString] = gitFileLine.split("\t");

              expect(Git.parseFileString(gitFileLine).path).toStrictEqual(
                expected
              );
              expect(Git.parsePathString).toHaveBeenCalledWith(pathString);
            });
          }
        );
      });
    });
  });
});
