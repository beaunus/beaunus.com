import {
  faHandPeace,
  faHandshake,
  faHeadphonesAlt,
  faMusic,
  faTerminal,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { FC } from "react";

const Logo: FC<{ src: string; title: string }> = ({ title, src }) => (
  <Image
    alt={title}
    className="object-contain"
    height={25}
    src={src}
    title={title}
    width={100}
  />
);
const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Beaunus</title>
        <meta content="" name="description" />
        <meta content="width=device-width,initial-scale=1" name="viewport" />
      </Head>
      <header className="flex flex-row-reverse p-3 mb-8">
        <Image
          alt="Beaunus Logo"
          height={24}
          objectFit="contain"
          src="/img/beaunus_logo_pixels.png"
          width="100%"
        />
      </header>
      <div>
        <Image
          alt="Beau Dobbin"
          className="rounded-full"
          height={200}
          objectFit="contain"
          src="/img/beau-dobbin-photo.jpg"
          width={200}
        />
        <h3>Beau Dobbin</h3>
        <h4>Software Engineer</h4>
        <div className="flex flex-wrap gap-x-5 justify-center">
          <div>
            <FontAwesomeIcon className="mr-2 text-blue-600" icon={faTerminal} />
            <span>Code</span>
          </div>
          <div>
            <FontAwesomeIcon
              className="mr-2 text-green-600"
              icon={faHandshake}
            />
            <span>Education</span>
          </div>
          <div>
            <FontAwesomeIcon className="mr-2 text-orange-300" icon={faMusic} />
            <span>Music</span>
          </div>
          <div>
            <FontAwesomeIcon
              className="mr-2 text-red-500"
              icon={faHeadphonesAlt}
            />
            <span>Audio Engineering</span>
          </div>
        </div>
      </div>
      <section>
        <div>
          <Image
            alt="Octopus Energy"
            className="rounded-3xl"
            height={200}
            objectFit="contain"
            src="/img/logos/octopus.jpeg"
            title="Octopus Energy"
            width={200}
          />
        </div>
        <div>
          <h4>Octopus Energy</h4>
          <h5>
            <a href="https://octopusenergy.co.jp/">octopusenergy.co.jp</a>
          </h5>
          <p>
            I am a senior frontend developer at Octopus Energy, an energy
            company that provides Japanese households with electricity from
            sustainable sources.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 justify-center">
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
        </div>
      </section>
      <section>
        <div>
          <Image
            alt="Code Chrysalis"
            className="rounded-3xl"
            height={200}
            objectFit="contain"
            src="/img/logos/code-chrysalis.png"
            title="Code Chrysalis"
            width={200}
          />
        </div>
        <div>
          <h4>Code Chrysalis</h4>
          <h5>
            <a href="https://www.codechrysalis.io/">codechrysalis.io</a>
          </h5>
          <p>
            I am an instructor for Immersive Part-time, an advanced JavaScript
            course that trains engineers to become professional software
            engineering leaders.
          </p>
          <p>
            I am a lead instructor and core curriculum contributor for
            Foundations, a JavaScript / HTML / CSS course that prepares absolute
            beginners for an advanced programming bootcamp.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 justify-center">
          <Logo src="/img/logos/node.png" title="NodeJS" />
          <Logo src="/img/logos/express.png" title="ExpressJS" />
          <Logo src="/img/logos/react.png" title="React" />
          <Logo src="/img/logos/graph-ql.svg" title="GraphQL" />
          <Logo src="/img/logos/html.png" title="HTML" />
          <Logo src="/img/logos/css.png" title="CSS" />
        </div>
      </section>
      <section>
        <div>
          <Image
            alt="Basal"
            className="rounded-3xl"
            height={200}
            objectFit="contain"
            src="/img/logos/basal.png"
            title="Basal"
            width={200}
          />
        </div>
        <div>
          <h4>Basal</h4>
          <h5>
            <a href="https://basal.dev/">basal.dev</a>
          </h5>
          <p>
            I was a senior full-stack engineer and team lead at Basal, a
            software development center based in Tokyo.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 justify-center">
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
          <Logo src="/img/logos/ionicframework.png" title="Ionic Framework" />
          <Logo src="/img/logos/aws.png" title="Amazon Web Services" />
          <Logo src="/img/logos/redis.svg" title="Redis" />
        </div>
      </section>
      <section>
        <div>
          <Image
            alt="Zehitomo"
            className="rounded-3xl"
            height={200}
            objectFit="contain"
            src="/img/zehitomo-iphone.png"
            title="Zehitomo"
            width={200}
          />
        </div>
        <div>
          <h4>Zehitomo</h4>
          <h5>
            <a href="https://www.zehitomo.com/">zehitomo.com</a>
          </h5>
          <p>
            I was a full-stack developer at Zehitomo, a local services
            marketplace that is enabling freelance professionals throughout
            Japan.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 justify-center">
          <Logo src="/img/logos/node.png" title="NodeJS" />
          <Logo src="/img/logos/typescript.svg" title="TypeScript" />
          <Logo src="/img/logos/mongodb.png" title="MongoDB" />
          <Logo src="/img/logos/express.png" title="ExpressJS" />
          <Logo src="/img/logos/react.png" title="React" />
          <Logo src="/img/logos/angularjs.png" title="AngularJS" />
          <Logo src="/img/logos/aws.png" title="Amazon Web Services" />
          <Logo src="/img/logos/redis.svg" title="Redis" />
          <Logo src="/img/logos/sentry.png" title="Sentry" />
        </div>
      </section>
      <section>
        <div>
          <Image
            alt="Six Degrees of Kevin Bacon"
            className="rounded-3xl"
            height={200}
            objectFit="contain"
            src="/img/logos/six-degrees-of-kevin-bacon.png"
            title="Six Degrees of Kevin Bacon"
            width={200}
          />
        </div>
        <div>
          <h4>Six Degrees of Kevin Bacon</h4>
          <h5>
            <a href="http://six-degrees-of-kevin-bacon.beaunus.com/">
              six-degrees-of-kevin-bacon.beaunus.com
            </a>
          </h5>
          <p>
            I created a way to visualize the game,
            <a href="https://en.wikipedia.org/wiki/Six_Degrees_of_Kevin_Bacon">
              Six Degrees of Kevin Bacon
            </a>
            .
          </p>
        </div>
        <div className="flex flex-wrap gap-4 justify-center">
          <Logo src="/img/logos/typescript.svg" title="TypeScript" />
          <Logo src="/img/logos/react.png" title="React" />
          <Logo src="/img/logos/aws.png" title="Amazon Web Services" />
          <Logo src="/img/logos/d3.svg" title="D3.JS" />
          <Logo src="/img/logos/themoviedb.svg" title="The Movie Database" />
        </div>
      </section>
      <section>
        <div>
          <Image
            alt="Second Shift"
            className="rounded-3xl"
            height={200}
            objectFit="contain"
            src="/img/background_splash_bbq.jpg"
            title="Second Shift"
            width={200}
          />
        </div>
        <div>
          <h4>Second Shift</h4>
          <h5>
            <a href="http://secondshiftmusic.com/catalog/">
              secondshiftmusic.com
            </a>
          </h5>
          <p>
            I played guitar and wrote songs in a rock band with my best friends
            for about 10 years.
          </p>
          <p>I co-produced and engineered most of our self-made recordings.</p>
        </div>
      </section>
      <section>
        <div>
          <Image
            alt="Beaunus Sound"
            className="rounded-3xl"
            height={200}
            objectFit="contain"
            src="/img/logos/beaunussound.png"
            title="Beaunus Sound"
            width={200}
          />
        </div>
        <div>
          <h4>Beaunus Sound</h4>
          <h5>
            <a href="http://beaunussound.com/">beaunussound.com</a>
          </h5>
          <p>I ran an audio production company for a few years.</p>
        </div>
      </section>
      <section>
        <div>
          <a href="https://unsplash.com/photos/S4eh9DWTId4?utm_source=unsplash&utm_medium=referral&utm_content=creditShareLink">
            <Image
              alt="Scales and Modes"
              className="rounded-3xl"
              height={200}
              objectFit="contain"
              src="/img/kelly-sikkema-S4eh9DWTId4-unsplash.jpg"
              title="Scales and Modes"
              width={200}
            />
          </a>
        </div>
        <div>
          <h4>Scales and Modes</h4>
          <h5>
            <a href="http://scales-and-modes.beaunus.com/">
              scales-and-modes.beaunus.com
            </a>
          </h5>
          <p>
            A WIP project to explore the tonality and <i>mood</i> of different
            musical scales.
          </p>
        </div>
      </section>
      <section>
        <p>
          <FontAwesomeIcon icon={faHandPeace} />
        </p>
        <p>
          <a href="mailto:beau@beaunus.com">beau@beaunus.com</a>
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <a href="https://github.com/beaunus">
            <Image
              alt="Github"
              className="rounded-3xl"
              height={24}
              objectFit="contain"
              src="/img/logos/github.png"
              title="Github"
              width="100%"
            />
          </a>
          <a href="https://www.linkedin.com/in/beaunus/">
            <Image
              alt="Linkedin"
              className="rounded-3xl"
              height={24}
              objectFit="contain"
              src="/img/logos/linkedin.png"
              title="Linkedin"
              width="100%"
            />
          </a>
        </div>
      </section>
    </>
  );
};

export default Home;
