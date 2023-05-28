import {
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
} from "@mui/material";
import { Stack } from "@mui/system";
import _ from "lodash";
import { FC, ReactNode } from "react";

import { GitCommit } from "../../utils/git";

const REPOSITORY_SUMMARY_METRICS: {
	label: ReactNode;
	resolverDetails: (commits: {
		allCommits: GitCommit[];
		allCommitsFiltered: GitCommit[];
		fileNameFilter: (fileName: string) => boolean;
	}) => ReactNode;
	resolverValue: (commits: {
		allCommits: GitCommit[];
		allCommitsFiltered: GitCommit[];
		fileNameFilter: (fileName: string) => boolean;
	}) => ReactNode;
}[] = [
	{
		label: "Commits (all time)",
		resolverDetails: () => null,
		resolverValue: ({ allCommits }) =>
			Number(allCommits.length).toLocaleString(),
	},
	{
		label: "Commits (based on filters)",
		resolverDetails: ({ allCommitsFiltered }) => (
			<details>
				<summary>Details</summary>
				<ul>
					{allCommitsFiltered.map(({ message }, index) => (
						<li key={`commits-filtered-${index}`}>{message}</li>
					))}
				</ul>
			</details>
		),
		resolverValue: ({ allCommits, allCommitsFiltered }) =>
			allCommits.length ? (
				<>
					{Number(allCommitsFiltered.length).toLocaleString()}
					<br />
					{((100 * allCommitsFiltered.length) / allCommits.length).toFixed(2)}%
				</>
			) : null,
	},
	{
		label: "Committers (all time)",
		resolverDetails: ({ allCommits }) => (
			<details>
				<summary>Details</summary>
				<ul>
					{_.uniqBy(allCommits, ({ author }) => author)
						.sort((a, b) =>
							a.author < b.author ? -1 : a.author > b.author ? 1 : 0
						)
						.map(({ author }) => (
							<li key={`num-committers-${author}`}>{author}</li>
						))}
				</ul>
			</details>
		),
		resolverValue: ({ allCommits }) =>
			Number(
				_.uniqBy(allCommits, ({ author }) => author).length
			).toLocaleString(),
	},
	{
		label: "Committers (based on filters)",
		resolverDetails: ({ allCommitsFiltered }) => (
			<details>
				<summary>Details</summary>
				<ul>
					{_.uniqBy(allCommitsFiltered, ({ author }) => author)
						.sort((a, b) =>
							a.author < b.author ? -1 : a.author > b.author ? 1 : 0
						)
						.map(({ author }) => (
							<li key={`num-committers-${author}`}>{author}</li>
						))}
				</ul>
			</details>
		),
		resolverValue: ({ allCommits, allCommitsFiltered }) =>
			allCommits.length ? (
				<>
					{Number(
						_.uniqBy(allCommitsFiltered, ({ author }) => author).length
					).toLocaleString()}
					<br />
					{(
						(100 *
							_.uniqBy(allCommitsFiltered, ({ author }) => author).length) /
						_.uniqBy(allCommits, ({ author }) => author).length
					).toFixed(2)}
					%
				</>
			) : null,
	},
	{
		label: "Lines changed",
		resolverDetails: ({ allCommitsFiltered, fileNameFilter }) => (
			<details>
				<summary>Details</summary>
				<Stack>
					{allCommitsFiltered
						.flatMap(({ files }) => files)
						.filter((file) => fileNameFilter(file.path.afterChange))
						.sort((a, b) =>
							Number((b.numLinesAdded ?? 0) - (a.numLinesAdded ?? 0))
						)
						.map(({ numLinesAdded, numLinesDeleted, path }, index) => (
							<Stack
								direction="row"
								key={`num-lines-changed-for-${path.afterChange}-${index}`}
							>
								<div className="w-20">
									{numLinesAdded ? `+${numLinesAdded} ` : ""}
								</div>
								<div className="w-20">
									{numLinesDeleted ? `-${numLinesDeleted} ` : ""}
								</div>
								<div>{path.afterChange}</div>
							</Stack>
						))}
				</Stack>
			</details>
		),
		resolverValue: ({ allCommits, allCommitsFiltered, fileNameFilter }) => {
			const numLinesChangedAllTime = _.sumBy(
				allCommits
					.flatMap(({ files }) => files)
					.filter((file) => fileNameFilter(file.path.afterChange)),
				({ numLinesAdded, numLinesDeleted }) =>
					(numLinesAdded ?? 0) + (numLinesDeleted ?? 0)
			);
			const numLinesChangedFiltered = _.sumBy(
				allCommitsFiltered
					.flatMap(({ files }) => files)
					.filter((file) => fileNameFilter(file.path.afterChange)),
				({ numLinesAdded, numLinesDeleted }) =>
					(numLinesAdded ?? 0) + (numLinesDeleted ?? 0)
			);
			return allCommits.length ? (
				<>
					{numLinesChangedFiltered.toLocaleString()}&nbsp;/&nbsp;
					{numLinesChangedAllTime.toLocaleString()}
					<br />
					{((100 * numLinesChangedFiltered) / numLinesChangedAllTime).toFixed(
						2
					)}
					%
				</>
			) : null;
		},
	},
];

export const RepositorySummaryTable: FC<{
	allCommits: GitCommit[];
	allCommitsFiltered: GitCommit[];
	fileNameFilter: (fileName: string) => boolean;
}> = ({ allCommits, allCommitsFiltered, fileNameFilter }) => (
	<TableContainer>
		<Table aria-label="criteria table" size="small">
			<TableHead>
				<TableRow className="whitespace-nowrap">
					<TableCell component="th">Metric</TableCell>
					<TableCell component="th">Value</TableCell>
					<TableCell component="th" width="100%">
						Details
					</TableCell>
				</TableRow>
			</TableHead>
			<TableBody>
				{REPOSITORY_SUMMARY_METRICS.map(
					({ label, resolverDetails, resolverValue }, index) => (
						<TableRow
							className="align-top"
							key={`repository-summary-metrics-${index}`}
						>
							<TableCell className="whitespace-nowrap">{label}</TableCell>
							<TableCell align="right" className="font-mono">
								{resolverValue({
									allCommits,
									allCommitsFiltered,
									fileNameFilter,
								})}
							</TableCell>
							<TableCell>
								{resolverDetails({
									allCommits,
									allCommitsFiltered,
									fileNameFilter,
								})}
							</TableCell>
						</TableRow>
					)
				)}
			</TableBody>
		</Table>
	</TableContainer>
);
