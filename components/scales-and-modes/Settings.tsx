import _ from "lodash";
import React, { useContext } from "react";

import { AudioConfigContext } from "../../contexts/AudioConfigContext";
import { NOTE_NAMES, OSCILLATOR_TYPES } from "../../utils/constants";

export const Settings: React.FC = () => {
	const {
		durationInSeconds,
		setDurationInSeconds,
		startingMidiNumber,
		setStartingMidiNumber,
		octave,
		setOctave,
		oscillatorTypeIndex,
		setOscillatorTypeIndex,
		numRepetitions,
		setNumRepetitions,
		isEnabledByModeCategoryName,
		setIsEnabledByModeCategoryName,
	} = useContext(AudioConfigContext);

	return (
		<table>
			<tbody>
				<tr>
					<td>
						<label htmlFor="durationInSeconds">durationInSeconds</label>
					</td>
					<td>
						<input
							id="durationInSeconds"
							name="durationInSeconds"
							onChange={(event) =>
								setDurationInSeconds(event.target.valueAsNumber)
							}
							step={0.25}
							type="number"
							value={durationInSeconds}
						/>
					</td>
				</tr>
				<tr>
					<td>
						<label htmlFor="startingNote">Choose a starting note:</label>
					</td>
					<td>
						<select
							id="startingNote"
							name="startingNote"
							onChange={(event) =>
								setStartingMidiNumber(Number(event.target.value))
							}
							value={startingMidiNumber}
						>
							{NOTE_NAMES.map((noteName, index) => (
								<option key={_.uniqueId()} value={index}>
									{noteName}
								</option>
							))}
						</select>
					</td>
				</tr>
				<tr>
					<td>
						<label htmlFor="octave">Choose an octave:</label>
					</td>
					<td>
						<input
							id="octave"
							max={9}
							min={0}
							name="octave"
							onChange={(event) => setOctave(Number(event.target.value))}
							type="number"
							value={octave}
						/>
					</td>
				</tr>
				<tr>
					<td>
						<label htmlFor="octave">Choose an oscillator type:</label>
					</td>
					<td>
						<select
							id="oscillatorTypeIndex"
							name="oscillatorTypeIndex"
							onChange={(event) =>
								setOscillatorTypeIndex(Number(event.target.value))
							}
							value={oscillatorTypeIndex}
						>
							{OSCILLATOR_TYPES.map((oscillatorType, index) => (
								<option key={_.uniqueId()} value={index}>
									{oscillatorType}
								</option>
							))}
						</select>
					</td>
				</tr>
				<tr>
					<td>
						<label htmlFor="num-repetitions">Num Repetitions:</label>
					</td>
					<td>
						<input
							id="num-repetitions"
							min={0}
							name="num-repetitions"
							onChange={(event) =>
								setNumRepetitions(Number(event.target.value))
							}
							type="number"
							value={numRepetitions}
						/>
					</td>
				</tr>
				<tr>
					<td>
						<label htmlFor="mode-category-name">Mode Categories:</label>
					</td>
					<td>
						{Object.entries(isEnabledByModeCategoryName).map(
							([modeCategoryName, isEnabled]) => (
								<div className="flex gap-2 items-center" key={_.uniqueId()}>
									<input
										checked={isEnabled}
										id="mode-category-name"
										key={_.uniqueId()}
										name="mode-category-name"
										onChange={(event) =>
											setIsEnabledByModeCategoryName({
												...isEnabledByModeCategoryName,
												[modeCategoryName]: event.target.checked,
											})
										}
										type="checkbox"
									/>
									{modeCategoryName}
								</div>
							)
						)}
					</td>
				</tr>
			</tbody>
		</table>
	);
};
