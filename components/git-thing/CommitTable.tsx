import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import dayjs from "dayjs";
import Linkify from "linkify-react";
import _ from "lodash";
import { FC, useState } from "react";

import { HighlightedLink } from "../../components/HighlightedLink";
import { GitCommit } from "../../utils/git";

export const CommitTable: FC<{
	baseGithubRepository: string;
	commits: GitCommit[];
	relevantFilePath: string;
}> = ({ baseGithubRepository, commits, relevantFilePath }) => {
	const HEADINGS = [
		"commitHash",
		"date",
		"author",
		"+",
		"-",
		"-/+",
		"abs(-/+)",
		"message",
	] as const;

	const [sortStrategy, setSortStrategy] = useState<{
		criteria: (typeof HEADINGS)[number];
		direction: "asc" | "desc";
	}>({ criteria: "date", direction: "asc" });

	const sortedCommits = _.sortBy(
		commits.map((commit) => {
			const relevantFile = commit.files.find(
				({ path }) => path.afterChange === relevantFilePath
			);
			return {
				...commit,
				numLinesAddedForRelevantFile: relevantFile?.numLinesAdded ?? 0,
				numLinesChangedForRelevantFile:
					(relevantFile?.numLinesAdded ?? 0) -
					(relevantFile?.numLinesDeleted ?? 0),
				numLinesDeletedForRelevantFile: relevantFile?.numLinesDeleted ?? 0,
				numLinesDiffForRelevantFile:
					(relevantFile?.numLinesAdded ?? 0) +
					(relevantFile?.numLinesDeleted ?? 0),
			};
		}),
		sortStrategy.criteria === "+"
			? "numLinesAddedForRelevantFile"
			: sortStrategy.criteria === "-"
			? "numLinesDeletedForRelevantFile"
			: sortStrategy.criteria === "-/+"
			? "numLinesChangesForRelevantFile"
			: sortStrategy.criteria === "abs(-/+)"
			? "numLinesDiffForRelevantFile"
			: sortStrategy.criteria
	);

	return (
		<TableContainer>
			<Table aria-label="commit table" size="small">
				<TableHead>
					<TableRow className="whitespace-nowrap">
						{HEADINGS.map((heading) => (
							<TableCell
								key={heading}
								onClick={() => {
									setSortStrategy((old) => ({
										criteria: heading,
										direction:
											old.criteria === heading
												? old.direction === "asc"
													? "desc"
													: "asc"
												: "asc",
									}));
								}}
							>
								{heading}
								{sortStrategy.direction === "asc" ? (
									<ArrowDropUpIcon
										color={
											sortStrategy.criteria === heading ? "inherit" : "disabled"
										}
									/>
								) : (
									<ArrowDropDownIcon
										color={
											sortStrategy.criteria === heading ? "inherit" : "disabled"
										}
									/>
								)}
							</TableCell>
						))}
					</TableRow>
				</TableHead>
				<TableBody>
					{(sortStrategy.direction === "asc"
						? sortedCommits
						: sortedCommits.reverse()
					).map((commit) => (
						<TableRow
							key={commit.commitHash}
							sx={{
								// eslint-disable-next-line @typescript-eslint/naming-convention
								"&:last-child td, &:last-child th": { border: 0 },
							}}
						>
							<TableCell component="th" scope="row">
								<HighlightedLink
									href={`https://github.com/${baseGithubRepository}/commit/${commit.commitHash}`}
								>
									<code>{commit.commitHash.slice(0, 7)}</code>
								</HighlightedLink>
							</TableCell>
							<TableCell className="font-mono whitespace-nowrap">
								{dayjs(commit.date).format("YYYY-MM-DD")}
							</TableCell>
							<TableCell className="whitespace-nowrap">
								{commit.author.split(" <")[0]}
							</TableCell>
							<TableCell>{commit.numLinesAddedForRelevantFile}</TableCell>
							<TableCell>{commit.numLinesDeletedForRelevantFile}</TableCell>
							<TableCell>{commit.numLinesChangedForRelevantFile}</TableCell>
							<TableCell>{commit.numLinesDiffForRelevantFile}</TableCell>
							<TableCell className="whitespace-pre-line">
								<Linkify
									options={{
										render: ({ attributes: { href, ...props }, content }) => (
											<HighlightedLink href={href} {...props}>
												{content}
											</HighlightedLink>
										),
									}}
								>
									<strong>{commit.message.split("\n")[0]}</strong>
									{commit.message.split("\n").slice(1).join("\n")}
								</Linkify>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</TableContainer>
	);
};
