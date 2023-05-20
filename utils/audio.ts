import { ScaleDirection } from "../types";

import { keyNumberToFrequency } from "./functions";

export function playChord({
	audioCtx,
	durationInSeconds,
	keyNumbers,
	oscillatorType,
}: {
	audioCtx?: AudioContext;
	durationInSeconds: number;
	keyNumbers: number[];
	oscillatorType: OscillatorType;
}) {
	keyNumbers.forEach((keyNumber) =>
		playTone({ audioCtx, durationInSeconds, keyNumber, oscillatorType })
	);
}

export function playScale({
	audioCtx,
	durationInSeconds,
	keyNumbers,
	numRepetitions,
	oscillatorType,
	scaleDirection,
}: {
	audioCtx?: AudioContext;
	durationInSeconds: number;
	keyNumbers: number[];
	numRepetitions: number;
	oscillatorType: OscillatorType;
	scaleDirection: ScaleDirection;
}) {
	const allNotes: number[] =
		scaleDirection === ScaleDirection.up
			? Array(numRepetitions).fill(keyNumbers).flat()
			: scaleDirection === ScaleDirection.down
			? Array(numRepetitions).fill(keyNumbers.slice().reverse()).flat()
			: scaleDirection === ScaleDirection.upDown
			? Array(numRepetitions)
					.fill(
						[
							...keyNumbers.slice(0, keyNumbers.length - 1),
							...keyNumbers.slice().reverse(),
						].slice(0, (keyNumbers.length - 1) * 2)
					)
					.concat([keyNumbers[0]])
					.flat()
			: [];

	allNotes.forEach((keyNumber, index) =>
		setTimeout(
			() =>
				playTone({ audioCtx, durationInSeconds, keyNumber, oscillatorType }),
			index * durationInSeconds * 1000
		)
	);
}

function playTone({
	audioCtx,
	durationInSeconds,
	keyNumber,
	oscillatorType,
}: {
	audioCtx?: AudioContext;
	durationInSeconds: number;
	keyNumber: number;
	oscillatorType: OscillatorType;
}) {
	if (audioCtx) {
		const oscillator = audioCtx.createOscillator();
		oscillator.type = oscillatorType;
		const gainNode = audioCtx.createGain();
		gainNode.connect(audioCtx.destination);
		oscillator.connect(gainNode);

		gainNode.gain.setValueAtTime(0.15, 0);
		oscillator.frequency.setValueAtTime(keyNumberToFrequency(keyNumber), 0);
		gainNode.gain.setValueCurveAtTime(
			[0.15, 0],
			audioCtx.currentTime + durationInSeconds * (9 / 10),
			durationInSeconds * (1 / 10)
		);
		oscillator.start();
		oscillator.stop(audioCtx.currentTime + durationInSeconds);
	}
}
