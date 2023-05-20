import React from "react";

import { AudioConfigContext } from "../../contexts/AudioConfigContext";
import { ScaleDirection } from "../../types";
import { playScale } from "../../utils/audio";
import {
	OSCILLATOR_TYPES,
	LABEL_BY_SCALE_DIRECTION,
} from "../../utils/constants";

export const ScalePlayer: React.FC<{
	keyNumbers: number[];
	scaleDirection: ScaleDirection;
}> = ({ keyNumbers, scaleDirection }) => {
	const { audioCtx, durationInSeconds, numRepetitions, oscillatorTypeIndex } =
		React.useContext(AudioConfigContext);

	return (
		<span
			className="ml-1 cursor-pointer"
			onClick={() =>
				playScale({
					audioCtx,
					durationInSeconds,
					keyNumbers,
					numRepetitions,
					oscillatorType: OSCILLATOR_TYPES[oscillatorTypeIndex],
					scaleDirection,
				})
			}
		>
			{LABEL_BY_SCALE_DIRECTION[scaleDirection]}
		</span>
	);
};
