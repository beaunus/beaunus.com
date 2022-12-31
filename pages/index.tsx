import {
  faHandPeace,
  faHandshake,
  faHeadphones,
  faMusic,
  faTerminal,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import _ from "lodash";
import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import React, { FC, ReactNode } from "react";

import LogoAngularJS from "../images/logos/angularjs.png";
import LogoAntDesign from "../images/logos/ant-design.svg";
import LogoAmazonWebServices from "../images/logos/aws.png";
import LogoBasal from "../images/logos/basal.png";
import LogoBeaunusSound from "../images/logos/beaunussound.png";
import LogoCodeChrysalis from "../images/logos/code-chrysalis.png";
import LogoCSS from "../images/logos/css.png";
import LogoCypress from "../images/logos/cypress-logo.webp";
import LogoD3 from "../images/logos/d3.svg";
import LogoExpressJS from "../images/logos/express.png";
import LogoGithub from "../images/logos/github.png";
import LogoGoogleCloudPlatform from "../images/logos/google-cloud-logo.svg";
import LogoGraphQL from "../images/logos/graph-ql.svg";
import LogoHTML from "../images/logos/html.png";
import LogoIonic from "../images/logos/ionicframework.png";
import LogoJest from "../images/logos/jest.svg";
import LogoLinkedIn from "../images/logos/linkedin.png";
import LogoMongoDB from "../images/logos/mongodb.png";
import LogoNextJS from "../images/logos/nextjs.svg";
import LogoNode from "../images/logos/node.png";
import LogoOctopusEnergy from "../images/logos/octopus.jpeg";
import LogoPython from "../images/logos/python.svg";
import LogoReactTestingLibrary from "../images/logos/react-testing-library.png";
import LogoReact from "../images/logos/react.png";
import LogoRedis from "../images/logos/redis.svg";
import LogoSentry from "../images/logos/sentry.png";
import LogoSixDegreesOfKevinBacon from "../images/logos/six-degrees-of-kevin-bacon.png";
import LogoTailwindCSS from "../images/logos/tailwind-css.svg";
import LogoTheMovieDB from "../images/logos/themoviedb.svg";
import LogoTypeScript from "../images/logos/typescript.svg";
import LogoVercel from "../images/logos/vercel.png";
import LogoWebpack from "../images/logos/webpack.png";

const Link: FC<{ href: string; label: ReactNode }> = ({ href, label }) => (
  <a
    className="hover:bg-cyan-100 border-b-2 border-b-cyan-100 transition duration-75 ease-in-out"
    href={href}
  >
    {label}
  </a>
);

const Home: NextPage = () => (
  <>
    <Head>
      <title>Beaunus</title>
      <meta content="" name="description" />
      <meta content="width=device-width,initial-scale=1" name="viewport" />
    </Head>
    <div className="flex flex-col gap-2 text-center">
      <header className="flex flex-row-reverse p-3 mb-8">
        <Image
          alt="Beaunus Logo"
          height={25}
          priority={true}
          src="/img/beaunus_logo_pixels.png"
          width={119.25}
        />
      </header>
      <div className="flex flex-col grow shrink-0 gap-5 items-center px-3">
        <div>
          <Image
            alt="Beau Dobbin"
            className="rounded-full"
            height={200}
            priority={true}
            src="/img/beau-dobbin-photo.jpg"
            width={200}
          />
        </div>
        <div>
          <div className="text-4xl font-semibold">Beau Dobbin</div>
          <div className="text-2xl font-semibold text-cyan-700">
            Software Engineer
          </div>
        </div>
        <div className="flex flex-wrap gap-5 justify-center">
          <div className="flex gap-2 items-center">
            <FontAwesomeIcon className="text-blue-700" icon={faTerminal} />
            <div>Code</div>
          </div>
          <div className="flex gap-2 items-center">
            <FontAwesomeIcon className="text-green-800" icon={faHandshake} />
            <div>Education</div>
          </div>
          <div className="flex gap-2 items-center">
            <FontAwesomeIcon className="text-amber-500" icon={faMusic} />
            <div>Music</div>
          </div>
          <div className="flex gap-2 items-center">
            <FontAwesomeIcon className="text-red-600" icon={faHeadphones} />
            <div>Audio Engineering</div>
          </div>
        </div>
      </div>
      {[
        {
          content: (
            <p>
              I am a senior frontend developer at Octopus Energy, an energy
              company that provides Japanese households with electricity from
              sustainable sources.
            </p>
          ),
          logoImage: { isRounded: true, src: LogoOctopusEnergy },
          techLogos: (
            <>
              <Image
                alt="TypeScript"
                height={24}
                src={LogoTypeScript}
                width={98}
              />
              <Image alt="NodeJS" height={24} src={LogoNode} width={89} />
              <Image alt="GraphQL" height={24} src={LogoGraphQL} width={88} />
              <Image alt="Python" height={24} src={LogoPython} width={81} />
              <Image
                alt="React Testing Library"
                height={24}
                src={LogoReactTestingLibrary}
                width={24}
              />
              <Image alt="Jest" height={24} src={LogoJest} width={22} />
              <Image alt="React" height={24} src={LogoReact} width={71} />
              <Image alt="Next.js" height={24} src={LogoNextJS} width={40} />
              <Image
                alt="Tailwind CSS"
                height={24}
                src={LogoTailwindCSS}
                width={102}
              />
              <Image alt="Vercel" height={24} src={LogoVercel} width={106} />
              <Image alt="Sentry" height={24} src={LogoSentry} width={100} />
            </>
          ),
          title: "Octopus Energy",
          url: "https://octopusenergy.co.jp",
        },
        {
          content: (
            <>
              <p>
                I am an instructor for Immersive Part-time, an advanced
                JavaScript course that trains engineers to become professional
                software engineering leaders.
              </p>
              <p>
                I am a lead instructor and core curriculum contributor for
                Foundations, a JavaScript / HTML / CSS course that prepares
                absolute beginners for an advanced programming bootcamp.
              </p>
            </>
          ),
          logoImage: { isRounded: true, src: LogoCodeChrysalis },
          techLogos: (
            <>
              <Image alt="NodeJS" height={24} src={LogoNode} width={89} />
              <Image
                alt="ExpressJS"
                height={24}
                src={LogoExpressJS}
                width={88}
              />
              <Image alt="React" height={24} src={LogoReact} width={71} />
              <Image alt="GraphQL" height={24} src={LogoGraphQL} width={88} />
              <Image alt="HTML" height={24} src={LogoHTML} width={17} />
              <Image alt="CSS" height={24} src={LogoCSS} width={17} />
            </>
          ),
          title: "Code Chrysalis",
          url: "https://www.codechrysalis.io",
        },
        {
          content: (
            <p>
              I was a senior full-stack engineer and team lead at Basal, a
              software development center based in Tokyo.
            </p>
          ),
          logoImage: { isRounded: true, src: LogoBasal },
          techLogos: (
            <>
              <Image
                alt="TypeScript"
                height={24}
                src={LogoTypeScript}
                width={98}
              />
              <Image alt="NodeJS" height={24} src={LogoNode} width={89} />
              <Image alt="GraphQL" height={24} src={LogoGraphQL} width={88} />
              <Image
                alt="Google Cloud Platform"
                height={24}
                src={LogoGoogleCloudPlatform}
                width={155}
              />
              <Image alt="MongoDB" height={24} src={LogoMongoDB} width={88} />
              <Image
                alt="ExpressJS"
                height={24}
                src={LogoExpressJS}
                width={88}
              />
              <Image alt="Cypress" height={24} src={LogoCypress} width={72} />
              <Image alt="Jest" height={24} src={LogoJest} width={22} />
              <Image alt="React" height={24} src={LogoReact} width={71} />
              <Image alt="Webpack" height={24} src={LogoWebpack} width={84} />
              <Image
                alt="Ant Design"
                height={24}
                src={LogoAntDesign}
                width={24}
              />
              <Image
                alt="Ionic Framework"
                height={24}
                src={LogoIonic}
                width={71}
              />
              <Image
                alt="Amazon Web Services"
                height={24}
                src={LogoAmazonWebServices}
                width={55}
              />
              <Image alt="Redis" height={24} src={LogoRedis} width={72} />
            </>
          ),
          title: "Basal",
          url: "https://basal.dev",
        },
        {
          content: (
            <p>
              I was a full-stack developer at Zehitomo, a local services
              marketplace that is enabling freelance professionals throughout
              Japan.
            </p>
          ),
          logoImage: {
            height: 400,
            isRounded: true,
            src: "/img/zehitomo-iphone.png",
            width: 190.81,
          },
          techLogos: (
            <>
              <Image alt="NodeJS" height={24} src={LogoNode} width={89} />
              <Image
                alt="TypeScript"
                height={24}
                src={LogoTypeScript}
                width={98}
              />
              <Image alt="MongoDB" height={24} src={LogoMongoDB} width={88} />
              <Image
                alt="ExpressJS"
                height={24}
                src={LogoExpressJS}
                width={88}
              />
              <Image alt="React" height={24} src={LogoReact} width={71} />
              <Image
                alt="AngularJS"
                height={24}
                src={LogoAngularJS}
                width={85}
              />
              <Image
                alt="Amazon Web Services"
                height={24}
                src={LogoAmazonWebServices}
                width={55}
              />
              <Image alt="Redis" height={24} src={LogoRedis} width={72} />
              <Image alt="Sentry" height={24} src={LogoSentry} width={100} />
            </>
          ),
          title: "Zehitomo",
          url: "https://www.zehitomo.com",
        },
        {
          content: (
            <p>
              I created a way to visualize the game,&nbsp;
              <Link
                href="https://en.wikipedia.org/wiki/Six_Degrees_of_Kevin_Bacon"
                label="Six Degrees of Kevin Bacon"
              />
              .
            </p>
          ),
          logoImage: {
            height: 153.2,
            isRounded: true,
            src: LogoSixDegreesOfKevinBacon,
          },
          techLogos: (
            <>
              <Image
                alt="TypeScript"
                height={24}
                src={LogoTypeScript}
                width={98}
              />
              <Image alt="React" height={24} src={LogoReact} width={71} />
              <Image
                alt="Amazon Web Services"
                height={24}
                src={LogoAmazonWebServices}
                width={55}
              />
              <Image alt="D3.JS" height={24} src={LogoD3} width={25} />
              <Image
                alt="The Movie Database"
                height={24}
                src={LogoTheMovieDB}
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
                I played guitar and wrote songs in a rock band with my best
                friends for about 10 years.
              </p>
              <p>
                I co-produced and engineered most of our self-made recordings.
              </p>
            </>
          ),
          logoImage: {
            height: 132.95,
            isRounded: true,
            src: "/img/background_splash_bbq.jpg",
          },
          title: "Second Shift",
          url: "http://secondshiftmusic.com",
        },
        {
          content: <p>I ran an audio production company for a few years.</p>,
          logoImage: {
            height: 43.38,
            src: LogoBeaunusSound,
          },
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
          logoImage: {
            height: 300,
            isRounded: true,
            src: "/img/kelly-sikkema-S4eh9DWTId4-unsplash.jpg",
          },
          title: "Scales and Modes",
          url: "http://scales-and-modes.beaunus.com",
        },
      ].map(({ title, logoImage, url, content, techLogos }) => (
        <section
          className="flex flex-col gap-6 justify-evenly items-center py-16 px-5 odd:mt-2 odd:bg-gray-100"
          key={_.uniqueId("section")}
        >
          <div>
            <Image
              alt={title}
              className={logoImage.isRounded ? "rounded-3xl" : ""}
              height={logoImage.height ?? 200}
              src={logoImage.src}
              title={title}
              width={logoImage.width ?? 200}
            />
          </div>
          <div>
            <div className="text-2xl font-semibold text-cyan-700">{title}</div>
            <div className="text-xl font-semibold text-purple-800">
              <Link href={url} label={url.replace(/https?:\/\//, "")} />
            </div>
          </div>
          {content}
          <div className="flex flex-wrap gap-5 justify-center">{techLogos}</div>
        </section>
      ))}
      <footer className="flex flex-col shrink-0 gap-8 justify-evenly items-center py-16 px-5 odd:mt-2 odd:bg-gray-100">
        <FontAwesomeIcon icon={faHandPeace} />
        <Link href="mailto:beau@beaunus.com" label="beau@beaunus.com" />
        <div className="flex flex-wrap gap-8 justify-center">
          <Link
            href="https://github.com/beaunus"
            label={
              <Image alt="Github" height={24} src={LogoGithub} width={89} />
            }
          />
          <Link
            href="https://www.linkedin.com/in/beaunus/"
            label={
              <Image alt="Linkedin" height={24} src={LogoLinkedIn} width={91} />
            }
          />
        </div>
      </footer>
    </div>
  </>
);

export default Home;
