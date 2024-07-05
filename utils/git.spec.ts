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
						// TODO: figure out mocking
						// eslint-disable-next-line jest/no-disabled-tests
						it.skip("should be whatever parsePathString returns", () => {
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

	describe("splitGitLog", () => {
		const gitLogString = `commit d7b1c30ec615bdd3097110d5014929e6541343b7
Merge: e69522d72 931936a7d
Author: FirstName LastName <first.last@domain.com>
Date:   Thu Mar 16 17:20:32 2023 +0900

    Merge pull request #1234 from company/feature/awesome-thing
    
    feature: add awesome thing

commit e69522d72187ee0b6d30c58b0df4085597724ba6
Merge: edf653999 c8a84b079
Author: FirstName LastName <first.last@domain.com>
Date:   Thu Mar 16 17:05:17 2023 +0900

    Merge pull request #2345 from company/fix/broken-thing
    
    fix: make it work

commit edf6539995864f8f13f4f5a059f9be017de21eed
Merge: d857c154f 273d22589
Author: First <first@domain.com>
Date:   Thu Mar 16 16:30:54 2023 +0900

    Merge pull request #3456 from company/refactor/pretty-thing
    
    refactor: make it pretty

commit 273d2258974ba2c9e812e152c442ca20854da2fe
Author: FirstLast <firstlast@domain.com>
Date:   Thu Mar 16 16:18:12 2023 +0900

    feat: Add good thing

45	0	src/utils/sub-domain/file-1.ts
2	0	src/utils/sub-domain/index.ts
4	0	src/utils/sub-domain/nested-folder/constants.ts
`;

		it("should return an array with an element for each commit", () => {
			const numCommits = gitLogString.match(/commit/g)?.length ?? 0;

			expect(Git.splitGitLog(gitLogString)).toHaveLength(numCommits);
		});
	});
});
