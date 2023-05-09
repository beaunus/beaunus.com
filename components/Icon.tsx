import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

export const Icon: React.FC<{
	color: string;
	icon: IconProp;
	label: string;
}> = ({ color, icon, label }) => (
	<div className="flex gap-2 items-center">
		<FontAwesomeIcon className={color} icon={icon} />
		<div>{label}</div>
	</div>
);
