import _ from "lodash";
import React from "react";

import { AudioConfigContext } from "../../contexts/AudioConfigContext";
import { ScaleDirection } from "../../types";
import { playScale } from "../../utils/audio";
import {
	INTERVALS_OF_WHITE_KEYS,
	NOTE_NAMES,
	OSCILLATOR_TYPES,
} from "../../utils/constants";
import { rotateArray } from "../../utils/functions";

export const ModeTableHeader: React.FC<{
	mustContainByNoteIndex: boolean[];
	setMustContainByNoteIndex: React.Dispatch<React.SetStateAction<boolean[]>>;
}> = ({ mustContainByNoteIndex, setMustContainByNoteIndex }) => {
	const {
		audioCtx,
		durationInSeconds,
		numRepetitions,
		octave,
		oscillatorTypeIndex,
		startingMidiNumber,
	} = React.useContext(AudioConfigContext);

	return (
		<thead>
			<tr>
				<th />
				{_.range(0, 12).map((colIndex) => (
					<th key={_.uniqueId()}>
						{INTERVALS_OF_WHITE_KEYS.indexOf(colIndex) + 1 || null}
					</th>
				))}
			</tr>
			<tr>
				<th>
					<input
						checked={mustContainByNoteIndex.some(Boolean)}
						onChange={({ target: { checked } }) =>
							setMustContainByNoteIndex(new Array(12).fill(checked))
						}
						type="checkbox"
					/>
				</th>
				{rotateArray(mustContainByNoteIndex, startingMidiNumber % 12).map(
					(mustContain, noteIndex) => (
						<th key={_.uniqueId()}>
							<input
								checked={mustContain}
								onChange={(event) =>
									setMustContainByNoteIndex([
										...mustContainByNoteIndex.slice(
											0,
											(startingMidiNumber + noteIndex) % 12
										),
										event.target.checked,
										...mustContainByNoteIndex.slice(
											((startingMidiNumber + noteIndex) % 12) + 1
										),
									])
								}
								type="checkbox"
								value={noteIndex}
							/>
						</th>
					)
				)}
			</tr>
			<tr>
				<th />
				{rotateArray(NOTE_NAMES, startingMidiNumber % 12).map(
					(noteName, numHalfStepsFromStartingMidiNumber) => (
						<th
							className="cursor-pointer"
							key={_.uniqueId()}
							onClick={() =>
								playScale({
									audioCtx,
									durationInSeconds,
									keyNumbers: [
										startingMidiNumber +
											numHalfStepsFromStartingMidiNumber +
											12 * octave,
									],
									numRepetitions,
									oscillatorType: OSCILLATOR_TYPES[oscillatorTypeIndex],
									scaleDirection: ScaleDirection.up,
								})
							}
						>
							{noteName}
						</th>
					)
				)}
			</tr>
		</thead>
	);
};
