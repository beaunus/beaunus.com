import _ from "lodash";
import React from "react";

import { AudioConfigContext } from "../../contexts/AudioConfigContext";
import { INTERVALS } from "../../types";
import { playChord } from "../../utils/audio";
import {
	INDEXES_BY_CHORD_CLASS,
	OSCILLATOR_TYPES,
	CHORD_NAME_BY_INTERVALS,
} from "../../utils/constants";

export const ChordDescriptionCell: React.FC<{
	intervals: number[];
	romanNumeral: string;
	tonicKeyNumber: number;
}> = ({ intervals, tonicKeyNumber, romanNumeral }) => {
	const { audioCtx, durationInSeconds, oscillatorTypeIndex } =
		React.useContext(AudioConfigContext);

	const keyNumbers = intervals.map((interval) => tonicKeyNumber + interval * 2);
	const keyNumbersOverTwoOctaves = keyNumbers.concat(
		keyNumbers.map((keyNumber) => keyNumber + 12)
	);
	const intervalsOverTwoOctaves = intervals.concat(
		intervals.map((interval) => interval + 6)
	);

	return (
		<td
			className={[
				intervals[2] < INTERVALS.majorThird ? "triad-minor" : "triad-major",
				...(intervals[4] < INTERVALS.perfectFifth ? ["triad-diminished"] : []),
			].join(" ")}
		>
			{Object.values(INDEXES_BY_CHORD_CLASS).map((indexes) => {
				const chordSpelling = indexes.map(
					(index) => intervalsOverTwoOctaves[index]
				);
				return (
					<div
						key={_.uniqueId()}
						onClick={() =>
							playChord({
								audioCtx,
								durationInSeconds,
								keyNumbers: indexes.map(
									(index) => keyNumbersOverTwoOctaves[index]
								),
								oscillatorType: OSCILLATOR_TYPES[oscillatorTypeIndex],
							})
						}
					>
						{romanNumeral}&nbsp;
						<span className="normal-case">
							{CHORD_NAME_BY_INTERVALS[chordSpelling.join(",")] ?? "?"}
						</span>
					</div>
				);
			})}
		</td>
	);
};
