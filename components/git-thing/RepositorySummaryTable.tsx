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

export const RepositorySummaryTable: FC<{
	allCommits: GitCommit[];
	allCommitsFiltered: GitCommit[];
}> = ({ allCommits, allCommitsFiltered }) => {
	const REPOSITORY_SUMMARY_METRICS: {
		details: ReactNode;
		label: string;
		value: ReactNode;
	}[] = [
		{
			details: null,
			label: "Number of commits (all time)",
			value: Number(allCommits.length).toLocaleString(),
		},
		{
			details: null,
			label: "Number of commits (based on filters)",
			value: Number(allCommitsFiltered.length).toLocaleString(),
		},
		{
			details: null,
			label: "% of all commits (based on filters)",
			value: allCommits.length
				? `${((100 * allCommitsFiltered.length) / allCommits.length).toFixed(
						2
				  )}%`
				: null,
		},
		{
			details: (
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
			label: "Number of committers (all time)",
			value: Number(
				_.uniqBy(allCommits, ({ author }) => author).length
			).toLocaleString(),
		},
		{
			details: (
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
			label: "Number of committers (based on filters)",
			value: Number(
				_.uniqBy(allCommitsFiltered, ({ author }) => author).length
			).toLocaleString(),
		},
		{
			details: null,
			label: "% of all committers (based on filters)",
			value: allCommits.length
				? `${(
						(100 *
							_.uniqBy(allCommitsFiltered, ({ author }) => author).length) /
						_.uniqBy(allCommits, ({ author }) => author).length
				  ).toFixed(2)}%`
				: null,
		},
	];

	return (
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
					{REPOSITORY_SUMMARY_METRICS.map(({ label, details, value }) => (
						<TableRow key={label}>
							<TableCell className="whitespace-nowrap">{label}</TableCell>
							<TableCell align="right" className="font-mono">
								{value}
							</TableCell>
							<TableCell>{details}</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</TableContainer>
	);
};
