import _ from "lodash";
import React from "react";

import { AudioConfigContext } from "../../contexts/AudioConfigContext";
import { BASE_INTERVALS } from "../../utils/constants/music";
import { romanNumerals, rotateArray } from "../../utils/functions";

import { ChordDescriptionCell } from "./ChordDescriptionCell";
import { ModeTitleCell } from "./ModeTitleCell";

export const ModeRow: React.FC<{
	baseIntervals: number[];
	className?: HTMLTableRowElement["className"];
	indexRelativeToParent: number;
	intervalsFromTonic: number[];
	modeNames: string[];
	parentModeNames: string[];
	sumsStatsByNumIntervals: Record<
		string,
		{ max: number; median: number; min: number; range: number }
	>;
}> = ({
	baseIntervals,
	className,
	indexRelativeToParent,
	intervalsFromTonic,
	modeNames,
	parentModeNames,
	sumsStatsByNumIntervals,
}) => {
	const { octave, startingMidiNumber } = React.useContext(AudioConfigContext);

	const keyNumbers = [...intervalsFromTonic, 6].map(
		(intervalFromTonic) =>
			startingMidiNumber + intervalFromTonic * 2 + 12 * octave
	);
	return (
		<tr className={className ?? ""}>
			<ModeTitleCell
				brightness={Math.round(
					100 *
						2 *
						((_.sum(intervalsFromTonic) -
							sumsStatsByNumIntervals[intervalsFromTonic.length].min) /
							sumsStatsByNumIntervals[intervalsFromTonic.length].range -
							0.5)
				)}
				indexRelativeToParent={indexRelativeToParent}
				keyNumbers={keyNumbers}
				modeNames={modeNames}
				parentModeNames={parentModeNames}
			/>
			{romanNumerals(baseIntervals, BASE_INTERVALS).map((romanNumeral, i) => {
				const numHalfStepsAfterThisTone = 2 * (baseIntervals[i] - 0.5);

				return (
					<React.Fragment key={i}>
						<ChordDescriptionCell
							intervals={rotateArray(baseIntervals, i).map(
								(_v, j, rotatedBaseIntervals) =>
									_.sum(rotatedBaseIntervals.slice(0, j))
							)}
							romanNumeral={romanNumeral}
							tonicKeyNumber={keyNumbers[i]}
						/>
						{Array.from({ length: numHalfStepsAfterThisTone }).map(() => (
							<td key={_.uniqueId()} />
						))}
					</React.Fragment>
				);
			})}
		</tr>
	);
};
