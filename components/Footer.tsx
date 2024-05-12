import { faHandSpock } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import React from "react";

import { HighlightedLink } from "../components/HighlightedLink";
import * as Logos from "../images/logos";

export const Footer: React.FC = () => (
	<footer className="flex print:hidden flex-col shrink-0 gap-8 justify-evenly items-center py-16 px-5 mt-2 w-full bg-gray-100">
		<FontAwesomeIcon color="rgb(232,25,140)" icon={faHandSpock} />
		<HighlightedLink href="mailto:beau@beaunus.com">
			beau@beaunus.com
		</HighlightedLink>
		<div className="flex flex-wrap gap-8 justify-center">
			<HighlightedLink href="https://github.com/beaunus">
				<Image alt="Github" height={24} src={Logos.Github} width={24} />
			</HighlightedLink>
			<HighlightedLink href="https://www.linkedin.com/in/beaunus/">
				<Image alt="Linkedin" height={24} src={Logos.LinkedIn} width={24} />
			</HighlightedLink>
		</div>
	</footer>
);
