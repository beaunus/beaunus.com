import _ from "lodash";
import React from "react";

import { ScaleDirection } from "../../types";

import { ScalePlayer } from "./ScalePlayer";

export const ModeTitleCell: React.FC<{
	brightness: number;
	indexRelativeToParent: number;
	keyNumbers: number[];
	modeNames: string[];
	parentModeNames: string[];
}> = ({
	brightness,
	indexRelativeToParent,
	keyNumbers,
	modeNames,
	parentModeNames,
}) => (
	<td
		className={`${brightness > 0 ? "bright" : "dark"} bg-fade-${Math.abs(
			brightness
		)}`}
	>
		{parentModeNames.map((name) => (
			<div className="font-bold" key={_.uniqueId()}>
				{name} {indexRelativeToParent + 1}
			</div>
		))}
		{modeNames.map((name) => (
			<div key={_.uniqueId()}>{name}</div>
		))}
		{
			<div key={_.uniqueId()}>
				{[ScaleDirection.up, ScaleDirection.down, ScaleDirection.upDown].map(
					(scaleDirection) => (
						<ScalePlayer
							key={_.uniqueId()}
							keyNumbers={keyNumbers}
							scaleDirection={scaleDirection}
						/>
					)
				)}
			</div>
		}
	</td>
);
