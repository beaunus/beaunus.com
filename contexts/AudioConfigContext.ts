import React from "react";

import { ModeCategoryName, OSCILLATOR_TYPES } from "../utils/constants/music";

export const AudioConfigContext = React.createContext({
	/* eslint-disable @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars, sort-keys */
	durationInSeconds: 0.25,
	setDurationInSeconds: (newDurationInSeconds: number) => {},
	startingMidiNumber: 0,
	setStartingMidiNumber: (newStartingMidiNumber: number) => {},
	octave: 5,
	setOctave: (newOctave: number) => {},
	oscillatorTypeIndex: OSCILLATOR_TYPES.indexOf("sine"),
	setOscillatorTypeIndex: (newOscillatorTypeIndex: number) => {},
	numRepetitions: 1,
	setNumRepetitions: (newNumRepetitions: number) => {},
	isEnabledByModeCategoryName: { diatonic: true, pentatonic: false },
	setIsEnabledByModeCategoryName: (
		newIsEnabledByModeCategoryName: Record<ModeCategoryName, boolean>
	) => {},
	audioCtx: undefined as AudioContext | undefined,
	setAudioCtx: (newAudioCtx: AudioContext) => {},
	/* eslint-enable @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars, sort-keys */
});
