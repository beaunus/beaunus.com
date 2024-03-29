import {
	faHandshake,
	faHeadphones,
	faMusic,
	faTerminal,
} from "@fortawesome/free-solid-svg-icons";
import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import React from "react";

import { Icon } from "../components/Icon";
import { JobsSection } from "../components/JobsSection";
import { Segment } from "../components/Segment";
import * as Photos from "../images/photos";

const TitleSection: React.FC = () => (
	<Segment
		image={
			<Image
				alt="Beau Dobbin"
				className="rounded-full"
				height={200}
				priority={true}
				src={Photos.BeauDobbinPhoto}
				width={200}
			/>
		}
	>
		<div>
			<div className="text-4xl font-semibold">Beau Dobbin</div>
			<div className="text-2xl font-semibold text-cyan-700">
				Software Engineer
			</div>
		</div>
		<div className="flex flex-wrap gap-5 justify-around w-full max-w-md">
			<Icon color="text-blue-700" icon={faTerminal} label="Code" />
			<Icon color="text-orange-500" icon={faHandshake} label="Education" />
			<Icon color="text-green-600" icon={faMusic} label="Music" />
			<Icon color="text-indigo-400" icon={faHeadphones} label="Engineering" />
		</div>
	</Segment>
);

const Home: NextPage = () => (
	<>
		<Head>
			<title>Beaunus</title>
		</Head>
		<div className="flex flex-col grow gap-20 items-center text-center">
			<TitleSection />
			<JobsSection />
		</div>
	</>
);

export default Home;
