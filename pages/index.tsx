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

const Logo: FC<{ src: string; title: string }> = ({ title, src }) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img alt={title} className="h-6" src={src} title={title} />
);

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
          objectFit="contain"
          src="/img/beaunus_logo_pixels.png"
          width={119.25}
        />
      </header>
      <div className="flex flex-col grow shrink-0 gap-5 px-3">
        <div>
          <Image
            alt="Beau Dobbin"
            className="rounded-full"
            height={200}
            objectFit="contain"
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
          logoImage: { src: "/img/logos/octopus.jpeg" },
          techLogos: (
            <>
              <Logo src="/img/logos/typescript.svg" title="TypeScript" />
              <Logo src="/img/logos/node.png" title="NodeJS" />
              <Logo src="/img/logos/graph-ql.svg" title="GraphQL" />
              <Logo src="/img/logos/python.svg" title="Python" />
              <Logo
                src="/img/logos/react-testing-library.png"
                title="React Testing Library"
              />
              <Logo src="/img/logos/jest.svg" title="Jest" />
              <Logo src="/img/logos/react.png" title="React" />
              <Logo src="/img/logos/nextjs.svg" title="Next.js" />
              <Logo src="/img/logos/tailwind-css.svg" title="Tailwind CSS" />
              <Logo src="/img/logos/vercel.png" title="Vercel" />
              <Logo src="/img/logos/sentry.png" title="Sentry" />
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
          logoImage: { src: "/img/logos/code-chrysalis.png" },
          techLogos: (
            <>
              <Logo src="/img/logos/node.png" title="NodeJS" />
              <Logo src="/img/logos/express.png" title="ExpressJS" />
              <Logo src="/img/logos/react.png" title="React" />
              <Logo src="/img/logos/graph-ql.svg" title="GraphQL" />
              <Logo src="/img/logos/html.png" title="HTML" />
              <Logo src="/img/logos/css.png" title="CSS" />
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
          logoImage: { src: "/img/logos/basal.png" },
          techLogos: (
            <>
              <Logo src="/img/logos/typescript.svg" title="TypeScript" />
              <Logo src="/img/logos/node.png" title="NodeJS" />
              <Logo src="/img/logos/graph-ql.svg" title="GraphQL" />
              <Logo
                src="/img/logos/google-cloud-logo.svg"
                title="Google Cloud Platform"
              />
              <Logo src="/img/logos/mongodb.png" title="MongoDB" />
              <Logo src="/img/logos/express.png" title="ExpressJS" />
              <Logo src="/img/logos/cypress-logo.webp" title="Cypress" />
              <Logo src="/img/logos/jest.svg" title="Jest" />
              <Logo src="/img/logos/react.png" title="React" />
              <Logo src="/img/logos/webpack.png" title="Webpack" />
              <Logo src="/img/logos/ant-design.svg" title="Ant Design" />
              <Logo
                src="/img/logos/ionicframework.png"
                title="Ionic Framework"
              />
              <Logo src="/img/logos/aws.png" title="Amazon Web Services" />
              <Logo src="/img/logos/redis.svg" title="Redis" />{" "}
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
            src: "/img/zehitomo-iphone.png",
            width: 190.81,
          },
          techLogos: (
            <>
              <Logo src="/img/logos/node.png" title="NodeJS" />
              <Logo src="/img/logos/typescript.svg" title="TypeScript" />
              <Logo src="/img/logos/mongodb.png" title="MongoDB" />
              <Logo src="/img/logos/express.png" title="ExpressJS" />
              <Logo src="/img/logos/react.png" title="React" />
              <Logo src="/img/logos/angularjs.png" title="AngularJS" />
              <Logo src="/img/logos/aws.png" title="Amazon Web Services" />
              <Logo src="/img/logos/redis.svg" title="Redis" />
              <Logo src="/img/logos/sentry.png" title="Sentry" />
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
            src: "/img/logos/six-degrees-of-kevin-bacon.png",
          },
          techLogos: (
            <>
              <Logo src="/img/logos/typescript.svg" title="TypeScript" />
              <Logo src="/img/logos/react.png" title="React" />
              <Logo src="/img/logos/aws.png" title="Amazon Web Services" />
              <Logo src="/img/logos/d3.svg" title="D3.JS" />
              <Logo
                src="/img/logos/themoviedb.svg"
                title="The Movie Database"
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
          logoImage: { height: 132.95, src: "/img/background_splash_bbq.jpg" },
          title: "Second Shift",
          url: "http://secondshiftmusic.com",
        },
        {
          content: <p>I ran an audio production company for a few years.</p>,
          logoImage: { height: 43.38, src: "/img/logos/beaunussound.png" },
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
            src: "/img/kelly-sikkema-S4eh9DWTId4-unsplash.jpg",
          },
          title: "Scales and Modes",
          url: "http://scales-and-modes.beaunus.com",
        },
      ].map(({ title, logoImage, url, content, techLogos }) => (
        <section
          className="flex flex-col gap-6 justify-evenly py-16 px-5 odd:mt-2 odd:bg-gray-100"
          key={_.uniqueId("section")}
        >
          <div>
            <Image
              alt={title}
              className="rounded-3xl"
              height={logoImage.height ?? 200}
              objectFit="contain"
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
              <Image
                alt="Github"
                className="rounded-3xl"
                height={24}
                objectFit="contain"
                src="/img/logos/github.png"
                title="Github"
                width="100%"
              />
            }
          />
          <Link
            href="https://www.linkedin.com/in/beaunus/"
            label={
              <Image
                alt="Linkedin"
                className="rounded-3xl"
                height={24}
                objectFit="contain"
                src="/img/logos/linkedin.png"
                title="Linkedin"
                width="100%"
              />
            }
          />
        </div>
      </footer>
    </div>
  </>
);

export default Home;
