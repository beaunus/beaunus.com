import _ from "lodash";
import type { NextPage } from "next";
import React from "react";

import { ModeTable } from "../../components/scales-and-modes/ModeTable";
import { Settings } from "../../components/scales-and-modes/Settings";
import { AudioConfigContext } from "../../contexts/AudioConfigContext";
import {
	OSCILLATOR_TYPES,
	ModeCategoryName,
	MODES_BY_CATEGORY_NAME,
} from "../../utils/constants";
import { areRotations } from "../../utils/functions";

const ScalesAndModes: NextPage = () => {
	const [durationInSeconds, setDurationInSeconds] = React.useState(0.25);
	const [startingMidiNumber, setStartingMidiNumber] = React.useState(0);
	const [octave, setOctave] = React.useState(5);
	const [oscillatorTypeIndex, setOscillatorTypeIndex] = React.useState(
		OSCILLATOR_TYPES.indexOf("sine")
	);
	const [numRepetitions, setNumRepetitions] = React.useState(1);
	const [isEnabledByModeCategoryName, setIsEnabledByModeCategoryName] =
		React.useState<Record<ModeCategoryName, boolean>>({
			diatonic: true,
			pentatonic: false,
		});
	const [audioCtx, setAudioCtx] = React.useState<AudioContext>();

	function activateAudio() {
		if (!audioCtx) setAudioCtx(new window.AudioContext());
	}

	return (
		<AudioConfigContext.Provider
			value={{
				/* eslint-disable sort-keys */
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
				audioCtx,
				setAudioCtx,
				/* eslint-enable sort-keys */
			}}
		>
			<div className="bg-slate-100" onClick={activateAudio}>
				<Settings />
				<ModeTable
					modeSets={_.uniqWith(
						Object.entries(isEnabledByModeCategoryName)
							.filter(([, isEnabled]) => isEnabled)
							.flatMap(
								([modeCategoryName]) =>
									MODES_BY_CATEGORY_NAME[modeCategoryName as ModeCategoryName]
							),
						(a, b) => areRotations(a.baseIntervals, b.baseIntervals)
					)}
				/>
			</div>
		</AudioConfigContext.Provider>
	);
};

export default ScalesAndModes;
