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
        <Image alt="TypeScript" height={24} src={Logos.TypeScript} width={98} />
        <Image alt="NodeJS" height={24} src={Logos.Node} width={89} />
        <Image alt="GraphQL" height={24} src={Logos.GraphQL} width={88} />
        <Image alt="Python" height={24} src={Logos.Python} width={81} />
        <Image
          alt="React Testing Library"
          height={24}
          src={Logos.ReactTestingLibrary}
          width={24}
        />
        <Image alt="Jest" height={24} src={Logos.Jest} width={22} />
        <Image alt="Cypress" height={24} src={Logos.Cypress} width={72} />
        <Image alt="React" height={24} src={Logos.React} width={71} />
        <Image alt="Next.js" height={24} src={Logos.NextJS} width={40} />
        <Image
          alt="Tailwind CSS"
          height={24}
          src={Logos.TailwindCSS}
          width={102}
        />
        <Image alt="XState" height={24} src={Logos.XState} width={68} />
        <Image alt="Vercel" height={24} src={Logos.Vercel} width={106} />
        <Image alt="Sentry" height={24} src={Logos.Sentry} width={100} />
        <Image alt="Datadog" height={24} src={Logos.Datadog} width={94} />
        <Image alt="Figma" height={24} src={Logos.Figma} width={16} />
        <Image alt="Notion" height={24} src={Logos.Notion} width={24} />
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
        <Image alt="NodeJS" height={24} src={Logos.Node} width={89} />
        <Image alt="ExpressJS" height={24} src={Logos.ExpressJS} width={88} />
        <Image alt="React" height={24} src={Logos.React} width={71} />
        <Image alt="GraphQL" height={24} src={Logos.GraphQL} width={88} />
        <Image alt="HTML" height={24} src={Logos.HTML} width={17} />
        <Image alt="CSS" height={24} src={Logos.CSS} width={17} />
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
        <Image alt="TypeScript" height={24} src={Logos.TypeScript} width={98} />
        <Image alt="NodeJS" height={24} src={Logos.Node} width={89} />
        <Image alt="GraphQL" height={24} src={Logos.GraphQL} width={88} />
        <Image
          alt="Google Cloud Platform"
          height={24}
          src={Logos.GoogleCloudPlatform}
          width={155}
        />
        <Image alt="MongoDB" height={24} src={Logos.MongoDB} width={88} />
        <Image alt="ExpressJS" height={24} src={Logos.ExpressJS} width={88} />
        <Image alt="Cypress" height={24} src={Logos.Cypress} width={72} />
        <Image alt="Jest" height={24} src={Logos.Jest} width={22} />
        <Image alt="React" height={24} src={Logos.React} width={71} />
        <Image alt="Webpack" height={24} src={Logos.Webpack} width={84} />
        <Image alt="Ant Design" height={24} src={Logos.AntDesign} width={24} />
        <Image alt="Ionic Framework" height={24} src={Logos.Ionic} width={71} />
        <Image
          alt="Amazon Web Services"
          height={24}
          src={Logos.AmazonWebServices}
          width={55}
        />
        <Image alt="Redis" height={24} src={Logos.Redis} width={72} />
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
        <Image alt="NodeJS" height={24} src={Logos.Node} width={89} />
        <Image alt="TypeScript" height={24} src={Logos.TypeScript} width={98} />
        <Image alt="MongoDB" height={24} src={Logos.MongoDB} width={88} />
        <Image alt="ExpressJS" height={24} src={Logos.ExpressJS} width={88} />
        <Image alt="React" height={24} src={Logos.React} width={71} />
        <Image alt="AngularJS" height={24} src={Logos.AngularJS} width={85} />
        <Image
          alt="Amazon Web Services"
          height={24}
          src={Logos.AmazonWebServices}
          width={55}
        />
        <Image alt="Redis" height={24} src={Logos.Redis} width={72} />
        <Image alt="Sentry" height={24} src={Logos.Sentry} width={100} />
      </>
    ),
    title: "Zehitomo",
    url: "https://www.zehitomo.com",
  },
  {
    content: (
      <p>
        I created a way to visualize the game,&nbsp;
        <HighlightedLink
          href="https://en.wikipedia.org/wiki/Six_Degrees_of_Kevin_Bacon"
          label="Six Degrees of Kevin Bacon"
        />
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
        <Image alt="TypeScript" height={24} src={Logos.TypeScript} width={98} />
        <Image alt="React" height={24} src={Logos.React} width={71} />
        <Image
          alt="Amazon Web Services"
          height={24}
          src={Logos.AmazonWebServices}
          width={55}
        />
        <Image alt="D3.JS" height={24} src={Logos.D3} width={25} />
        <Image
          alt="The Movie Database"
          height={24}
          src={Logos.TheMovieDB}
          width={185}
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
    url: "http://scales-and-modes.beaunus.com",
  },
];

export const JobsSection = () => (
  <>
    {jobs.map(({ title, logoImage, url, content, techLogos }, index) => (
      <Segment
        body={
          <div className="flex flex-col gap-8">
            <div>
              <div className="text-2xl font-semibold text-cyan-700">
                {title}
              </div>
              <div className="text-xl font-semibold text-purple-800">
                <HighlightedLink
                  href={url}
                  label={url.replace(/https?:\/\//, "")}
                />
              </div>
            </div>
            <div className="flex flex-col gap-4">{content}</div>
            <div className="flex flex-wrap gap-5 justify-center">
              {techLogos}
            </div>
          </div>
        }
        image={
          <Image
            alt={title}
            className={` min-w-[200px] ${
              logoImage.isRounded ? "rounded-3xl" : ""
            }`}
            height={logoImage.height ?? 200}
            src={logoImage.src}
            title={title}
            width={logoImage.width ?? 200}
          />
        }
        key={`job-${index}`}
      />
    ))}
  </>
);
