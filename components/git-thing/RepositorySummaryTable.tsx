import {
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
} from "@mui/material";
import _ from "lodash";
import { FC, ReactNode } from "react";

import { GitCommit } from "../../utils/git";

const REPOSITORY_SUMMARY_METRICS: {
	label: ReactNode;
	resolverDetails: (commits: {
		allCommits: GitCommit[];
		allCommitsFiltered: GitCommit[];
	}) => ReactNode;
	resolverValue: (commits: {
		allCommits: GitCommit[];
		allCommitsFiltered: GitCommit[];
	}) => ReactNode;
}[] = [
	{
		label: "Number of commits (all time)",
		resolverDetails: ({ allCommits }) => (
			<details>
				<summary>Details</summary>
				<ul>
					{allCommits.map(({ message }, index) => (
						<li key={`commits-all-time-${index}`}>{message}</li>
					))}
				</ul>
			</details>
		),
		resolverValue: ({ allCommits }) =>
			Number(allCommits.length).toLocaleString(),
	},
	{
		label: "Number of commits (based on filters)",
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
		resolverValue: ({ allCommitsFiltered }) =>
			Number(allCommitsFiltered.length).toLocaleString(),
	},
	{
		label: "% of all commits (based on filters)",
		resolverDetails: () => null,
		resolverValue: ({ allCommits, allCommitsFiltered }) =>
			allCommits.length
				? `${((100 * allCommitsFiltered.length) / allCommits.length).toFixed(
						2
				  )}%`
				: null,
	},
	{
		label: "Number of committers (all time)",
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
		label: "Number of committers (based on filters)",
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
		resolverValue: ({ allCommitsFiltered }) =>
			Number(
				_.uniqBy(allCommitsFiltered, ({ author }) => author).length
			).toLocaleString(),
	},
	{
		label: "% of all committers (based on filters)",
		resolverDetails: () => null,
		resolverValue: ({ allCommits, allCommitsFiltered }) =>
			allCommits.length
				? `${(
						(100 *
							_.uniqBy(allCommitsFiltered, ({ author }) => author).length) /
						_.uniqBy(allCommits, ({ author }) => author).length
				  ).toFixed(2)}%`
				: null,
	},
];

export const RepositorySummaryTable: FC<{
	allCommits: GitCommit[];
	allCommitsFiltered: GitCommit[];
}> = ({ allCommits, allCommitsFiltered }) => (
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
								{resolverValue({ allCommits, allCommitsFiltered })}
							</TableCell>
							<TableCell>
								{resolverDetails({ allCommits, allCommitsFiltered })}
							</TableCell>
						</TableRow>
					)
				)}
			</TableBody>
		</Table>
	</TableContainer>
);
