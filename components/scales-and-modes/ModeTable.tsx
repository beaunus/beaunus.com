import _ from "lodash";
import React, { FC } from "react";

import { AudioConfigContext } from "../../contexts/AudioConfigContext";
import { ModeSet } from "../../types";
import { INTERVALS_OF_WHITE_KEYS } from "../../utils/constants/music";
import { rotateArray } from "../../utils/functions";

import { ModeRow } from "./ModeRow";
import { ModeTableHeader } from "./ModeTableHeader";

export const ModeTable: FC<{
	modeSets: ModeSet[];
}> = ({ modeSets }) => {
	const { startingMidiNumber } = React.useContext(AudioConfigContext);

	const [mustContainByNoteIndex, setMustContainByNoteIndex] = React.useState(
		Array.from({ length: 12 }, () => false)
	);

	const numSelectedNotes = Object.values(mustContainByNoteIndex).filter(
		Boolean
	).length;

	const sumsStatsByNumIntervals = _.mapValues(
		_.groupBy(
			modeSets.flatMap(({ baseIntervals }) =>
				baseIntervals.map((_interval, i) => ({
					numIntervals: baseIntervals.length,
					sumIntervalsFromTonic: _.sum(
						rotateArray(baseIntervals, i).map(
							(_rotatedInterval, j, rotatedIntervals) =>
								_.sum(rotatedIntervals.slice(0, j))
						)
					),
				}))
			),
			"numIntervals"
		),
		(sumsMetaData) => {
			const sumsSorted = sumsMetaData
				.map(({ sumIntervalsFromTonic }) => sumIntervalsFromTonic)
				.sort((a, b) => b - a);
			return {
				max: _.max(sumsSorted) ?? 0,
				median:
					sumsSorted.length % 2 === 0
						? (sumsSorted[sumsSorted.length / 2] +
								sumsSorted[sumsSorted.length / 2 - 1]) /
						  2
						: sumsSorted[Math.floor(sumsSorted.length / 2)],
				min: _.min(sumsSorted) ?? 0,
				range: (_.max(sumsSorted) ?? 0) - (_.min(sumsSorted) ?? 0),
			};
		}
	);

	return (
		<table className="w-full table-fixed modes-table">
			<colgroup>
				<col className="bg-gray-50" />
				{_.range(0, 12).map((colIndex) => (
					<col
						className={[
							...(INTERVALS_OF_WHITE_KEYS.includes(
								(colIndex + startingMidiNumber) % 12
							)
								? ["white-key"]
								: ["black-key"]),
							...(INTERVALS_OF_WHITE_KEYS.includes(colIndex) ? ["ionian"] : []),
						].join(" ")}
						key={_.uniqueId()}
					/>
				))}
			</colgroup>
			<ModeTableHeader
				mustContainByNoteIndex={mustContainByNoteIndex}
				setMustContainByNoteIndex={setMustContainByNoteIndex}
			/>
			<tbody>
				{modeSets
					.flatMap(({ baseIntervals, namesLists }) => {
						const intervalsFromTonicByModeIndex = baseIntervals.map(
							(_interval, i) =>
								rotateArray(baseIntervals, i).map(
									(_rotatedInterval, j, rotatedIntervals) =>
										_.sum(rotatedIntervals.slice(0, j))
								)
						);

						return namesLists.map((names, indexRelativeToParent) => ({
							baseIntervals: rotateArray(baseIntervals, indexRelativeToParent),
							indexRelativeToParent,
							intervalsFromTonic:
								intervalsFromTonicByModeIndex[indexRelativeToParent],
							names,
							numCommonNotes: rotateArray(
								mustContainByNoteIndex,
								startingMidiNumber % 12
							).filter(
								(mustContain, interval) =>
									mustContain &&
									intervalsFromTonicByModeIndex[indexRelativeToParent].includes(
										interval / 2
									)
							).length,
							parentModeNames: namesLists[0],
						}));
					})
					.sort((a, b) => b.numCommonNotes - a.numCommonNotes)
					.map(
						(
							{
								baseIntervals,
								names,
								numCommonNotes,
								indexRelativeToParent,
								intervalsFromTonic,
								parentModeNames,
							},
							index
						) => (
							<ModeRow
								baseIntervals={baseIntervals}
								className={`fade-${
									10 * Math.ceil(10 * (numCommonNotes / numSelectedNotes)) ||
									100
								} ${index > 0 && index % 7 === 0 ? "break-before-page" : ""} `}
								indexRelativeToParent={indexRelativeToParent}
								intervalsFromTonic={intervalsFromTonic}
								key={_.uniqueId()}
								modeNames={names}
								parentModeNames={parentModeNames}
								sumsStatsByNumIntervals={sumsStatsByNumIntervals}
							/>
						)
					)}
			</tbody>
		</table>
	);
};
