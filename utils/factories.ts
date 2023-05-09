import { faker } from "@faker-js/faker";

export type NameChangeType = undefined | "full" | "partial";

export function aGitFileLine({
	isBinary,
	nameChangeType: nameChange,
}: { isBinary?: boolean; nameChangeType?: NameChangeType } = {}): string {
	const numLinesAdded = isBinary ? "-" : faker.datatype.number();
	const numLinesDeleted = isBinary ? "-" : faker.datatype.number();

	return [numLinesAdded, numLinesDeleted, aGitPathString(nameChange)].join(
		"\t"
	);
}

export function aGitPathString(nameChange?: NameChangeType) {
	const oldFilePath = faker.system.directoryPath().substring(1);
	const oldFileName = faker.system.fileName();
	const newFilePath = faker.system.directoryPath().substring(1);
	const newFileName = faker.system.fileName();

	return nameChange === "full"
		? `${oldFilePath}/${oldFileName} => ${newFilePath}/${newFileName}`
		: nameChange === "partial"
		? `{${oldFilePath} => ${newFilePath}}/${newFileName}`
		: `${oldFilePath}/${oldFileName}`;
}
