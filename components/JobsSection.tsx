import Image from "next/image";
import React from "react";

import * as Logos from "../images/logos";
import * as Photos from "../images/photos";

import { HighlightedLink } from "./HighlightedLink";
import { Segment } from "./Segment";

const jobs = [
	{
		content: (
			<p>
				I am the Front-end lead for APAC at Octopus Energy, an energy company
				that provides Japanese households with electricity from sustainable
				sources.
			</p>
		),
		logoImage: { isRounded: true, src: Logos.OctopusEnergy },
		techLogos: (
			<>
				<Image alt="TypeScript" className="w-auto h-6" src={Logos.TypeScript} />
				<Image alt="NodeJS" className="w-auto h-6" src={Logos.Node} />
				<Image alt="GraphQL" className="w-auto h-6" src={Logos.GraphQL} />
				<Image alt="Python" className="w-auto h-6" src={Logos.Python} />
				<Image
					alt="React Testing Library"
					className="w-auto h-6"
					src={Logos.ReactTestingLibrary}
				/>
				<Image alt="Jest" className="w-auto h-6" src={Logos.Jest} />
				<Image alt="Cypress" className="w-auto h-6" src={Logos.Cypress} />
				<Image alt="React" className="w-auto h-6" src={Logos.React} />
				<Image alt="Next.js" className="w-auto h-6" src={Logos.NextJS} />
				<Image
					alt="Tailwind CSS"
					className="w-auto h-6"
					src={Logos.TailwindCSS}
				/>
				<Image alt="XState" className="w-auto h-6" src={Logos.XState} />
				<Image alt="Vercel" className="w-auto h-6" src={Logos.Vercel} />
				<Image alt="Sentry" className="w-auto h-6" src={Logos.Sentry} />
				<Image alt="Datadog" className="w-auto h-6" src={Logos.Datadog} />
				<Image alt="Figma" className="w-auto h-6" src={Logos.Figma} />
				<Image alt="Notion" className="w-auto h-6" src={Logos.Notion} />
			</>
		),
		title: "Octopus Energy",
		url: "https://octopusenergy.co.jp",
	},
	{
		content: (
			<>
				<p>
					I am an instructor for Immersive Part-time, an advanced JavaScript
					course that trains engineers to become professional software
					engineering leaders.
				</p>
				<p>
					I was a lead instructor and core curriculum contributor for
					Foundations, a JavaScript / HTML / CSS course that prepares absolute
					beginners for an advanced programming bootcamp.
				</p>
			</>
		),
		logoImage: { isRounded: true, src: Logos.CodeChrysalis },
		techLogos: (
			<>
				<Image alt="NodeJS" className="w-auto h-6" src={Logos.Node} />
				<Image alt="ExpressJS" className="w-auto h-6" src={Logos.ExpressJS} />
				<Image alt="React" className="w-auto h-6" src={Logos.React} />
				<Image alt="GraphQL" className="w-auto h-6" src={Logos.GraphQL} />
				<Image alt="HTML" className="w-auto h-6" src={Logos.HTML} />
				<Image alt="CSS" className="w-auto h-6" src={Logos.CSS} />
			</>
		),
		title: "Code Chrysalis",
		url: "https://www.codechrysalis.io",
	},
	{
		content: (
			<p>
				I was a senior full-stack engineer and team lead at Basal, a software
				development center based in Tokyo.
			</p>
		),
		logoImage: { isRounded: true, src: Logos.Basal },
		techLogos: (
			<>
				<Image alt="TypeScript" className="w-auto h-6" src={Logos.TypeScript} />
				<Image alt="NodeJS" className="w-auto h-6" src={Logos.Node} />
				<Image alt="GraphQL" className="w-auto h-6" src={Logos.GraphQL} />
				<Image
					alt="Google Cloud Platform"
					className="w-auto h-6"
					src={Logos.GoogleCloudPlatform}
				/>
				<Image alt="MongoDB" className="w-auto h-6" src={Logos.MongoDB} />
				<Image alt="ExpressJS" className="w-auto h-6" src={Logos.ExpressJS} />
				<Image alt="Cypress" className="w-auto h-6" src={Logos.Cypress} />
				<Image alt="Jest" className="w-auto h-6" src={Logos.Jest} />
				<Image alt="React" className="w-auto h-6" src={Logos.React} />
				<Image alt="Webpack" className="w-auto h-6" src={Logos.Webpack} />
				<Image alt="Ant Design" className="w-auto h-6" src={Logos.AntDesign} />
				<Image alt="Ionic Framework" className="w-auto h-6" src={Logos.Ionic} />
				<Image
					alt="Amazon Web Services"
					className="w-auto h-6"
					src={Logos.AmazonWebServices}
				/>
				<Image alt="Redis" className="w-auto h-6" src={Logos.Redis} />
			</>
		),
		title: "Basal",
		url: "https://basal.dev",
	},
	{
		content: (
			<p>
				I was a full-stack developer at Zehitomo, a local services marketplace
				that is enabling freelance professionals throughout Japan.
			</p>
		),
		logoImage: {
			height: 400,
			isRounded: true,
			src: Photos.ZehitomoIPhone,
			width: 190.81,
		},
		techLogos: (
			<>
				<Image alt="NodeJS" className="w-auto h-6" src={Logos.Node} />
				<Image alt="TypeScript" className="w-auto h-6" src={Logos.TypeScript} />
				<Image alt="MongoDB" className="w-auto h-6" src={Logos.MongoDB} />
				<Image alt="ExpressJS" className="w-auto h-6" src={Logos.ExpressJS} />
				<Image alt="React" className="w-auto h-6" src={Logos.React} />
				<Image alt="AngularJS" className="w-auto h-6" src={Logos.AngularJS} />
				<Image
					alt="Amazon Web Services"
					className="w-auto h-6"
					src={Logos.AmazonWebServices}
				/>
				<Image alt="Redis" className="w-auto h-6" src={Logos.Redis} />
				<Image alt="Sentry" className="w-auto h-6" src={Logos.Sentry} />
			</>
		),
		title: "Zehitomo",
		url: "https://www.zehitomo.com",
	},
	{
		content: (
			<p>
				I created a way to visualize the game,&nbsp;
				<HighlightedLink href="https://en.wikipedia.org/wiki/Six_Degrees_of_Kevin_Bacon">
					Six Degrees of Kevin Bacon
				</HighlightedLink>
				.
			</p>
		),
		logoImage: {
			height: 153.2,
			isRounded: true,
			src: Logos.SixDegreesOfKevinBacon,
		},
		techLogos: (
			<>
				<Image alt="TypeScript" className="w-auto h-6" src={Logos.TypeScript} />
				<Image alt="React" className="w-auto h-6" src={Logos.React} />
				<Image
					alt="Amazon Web Services"
					className="w-auto h-6"
					src={Logos.AmazonWebServices}
				/>
				<Image alt="D3.JS" className="w-auto h-6" src={Logos.D3} />
				<Image
					alt="The Movie Database"
					className="w-auto h-6"
					src={Logos.TheMovieDB}
				/>
			</>
		),
		title: "Six Degrees of Kevin Bacon",
		url: "http://six-degrees-of-kevin-bacon.beaunus.com",
	},
	{
		content: (
			<>
				<p>
					I played guitar and wrote songs in a rock band with my best friends
					for about 10 years.
				</p>
				<p>I co-produced and engineered most of our self-made recordings.</p>
			</>
		),
		logoImage: {
			height: 132.95,
			isRounded: true,
			src: Photos.SecondShiftBBQ,
		},
		title: "Second Shift",
		url: "http://secondshiftmusic.com",
	},
	{
		content: <p>I ran an audio production company for a few years.</p>,
		logoImage: { height: 43.38, src: Logos.BeaunusSound },
		title: "Beaunus Sound",
		url: "http://beaunussound.com",
	},
	{
		content: (
			<p>
				A WIP project to explore the tonality and <i>mood</i> of different
				musical scales.
			</p>
		),
		logoImage: { height: 300, isRounded: true, src: Photos.BoyPiano },
		title: "Scales and Modes",
		url: "/blog/scales-and-modes",
	},
];

export const JobsSection = () => (
	<>
		{jobs.map(({ title, logoImage, url, content, techLogos }, index) => (
			<Segment
				image={
					<Image
						alt={title}
						className={`min-w-[200px] ${
							logoImage.isRounded ? "rounded-3xl" : ""
						}`}
						height={logoImage.height ?? 200}
						src={logoImage.src}
						title={title}
					/>
				}
				key={`job-${index}`}
			>
				<div className="flex flex-col gap-8">
					<div>
						<div className="text-2xl font-semibold text-cyan-700">{title}</div>
						<div className="text-xl font-semibold text-purple-800">
							<HighlightedLink href={url}>
								{url.replace(/https?:\/\//, "")}
							</HighlightedLink>
						</div>
					</div>
					<div className="flex flex-col gap-4">{content}</div>
					<div className="flex flex-wrap gap-5 justify-center">{techLogos}</div>
				</div>
			</Segment>
		))}
	</>
);
