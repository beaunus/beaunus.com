import {
  faHandshake,
  faHeadphonesAlt,
  faMusic,
  faTerminal,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { NextPage } from "next";
import Head from "next/head";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Beaunus</title>
        <meta content="" name="description" />
        <meta content="width=device-width,initial-scale=1" name="viewport" />
      </Head>
      <header>
        <img className="m-3 h-7" src="img/beaunus_logo_pixels.png" />
      </header>
      <div>
        <img id="profile-photo" src="img/beau-dobbin-photo.jpg" />
        <h3>Beau Dobbin</h3>
        <h4>Software Engineer</h4>
        <div className="flex gap-x-5 justify-center">
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
          <img
            className="rounded-border"
            src="img/logos/octopus.jpeg"
            title="Octopus Energy"
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
          <img
            alt="TypeScript"
            className="h-6"
            src="img/logos/typescript.svg"
            title="TypeScript"
          />
          <img
            alt="NodeJS"
            className="h-6"
            src="img/logos/node.png"
            title="NodeJS"
          />
          <img
            alt="GraphQL"
            className="h-6"
            src="img/logos/graph-ql.svg"
            title="GraphQL"
          />
          <img
            alt="Python"
            className="h-6"
            src="img/logos/python.svg"
            title="Python"
          />
          <img
            alt="React Testing Library"
            className="h-6"
            src="img/logos/react-testing-library.png"
            title="React Testing Library"
          />
          <img
            alt="Jest"
            className="h-6"
            src="img/logos/jest.svg"
            title="Jest"
          />
          <img
            alt="React"
            className="h-6"
            src="img/logos/react.png"
            title="React"
          />
          <img
            alt="Next.js"
            className="h-6"
            src="img/logos/nextjs.svg"
            title="Next.js"
          />
          <img
            alt="Tailwind CSS"
            className="h-6"
            src="img/logos/tailwind-css.svg"
            title="Tailwind CSS"
          />
          <img
            alt="Vercel"
            className="h-6"
            src="img/logos/vercel.png"
            title="Vercel"
          />
          <img
            alt="Sentry"
            className="h-6"
            src="img/logos/sentry.png"
            title="Sentry"
          />
        </div>
      </section>
      <section>
        <div>
          <img
            alt="Code Chrysalis"
            src="img/logos/code-chrysalis.png"
            title="Code Chrysalis"
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
          <img
            alt="NodeJS"
            className="h-6"
            src="img/logos/node.png"
            title="NodeJS"
          />
          <img
            alt="ExpressJS"
            className="h-6"
            src="img/logos/express.png"
            title="ExpressJS"
          />
          <img
            alt="React"
            className="h-6"
            src="img/logos/react.png"
            title="React"
          />
          <img
            alt="GraphQL"
            className="h-6"
            src="img/logos/graph-ql.svg"
            title="GraphQL"
          />
          <img
            alt="HTML"
            className="h-6"
            src="img/logos/html.png"
            title="HTML"
          />
          <img alt="CSS" className="h-6" src="img/logos/css.png" title="CSS" />
        </div>
      </section>
      <section>
        <div>
          <img className="rounded-border" src="img/logos/basal.png" />
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
          <img
            alt="TypeScript"
            className="h-6"
            src="img/logos/typescript.svg"
            title="TypeScript"
          />
          <img
            alt="NodeJS"
            className="h-6"
            src="img/logos/node.png"
            title="NodeJS"
          />
          <img
            alt="GraphQL"
            className="h-6"
            src="img/logos/graph-ql.svg"
            title="GraphQL"
          />
          <img
            alt="Google Cloud Platform"
            className="h-6"
            src="img/logos/google-cloud-logo.svg"
            title="Google Cloud Platform"
          />
          <img
            alt="MongoDB"
            className="h-6"
            src="img/logos/mongodb.png"
            title="MongoDB"
          />
          <img
            alt="ExpressJS"
            className="h-6"
            src="img/logos/express.png"
            title="ExpressJS"
          />
          <img
            alt="Cypress"
            className="h-6"
            src="img/logos/cypress-logo.webp"
            title="Cypress"
          />
          <img
            alt="Jest"
            className="h-6"
            src="img/logos/jest.svg"
            title="Jest"
          />
          <img
            alt="React"
            className="h-6"
            src="img/logos/react.png"
            title="React"
          />
          <img
            alt="Webpack"
            className="h-6"
            src="img/logos/webpack.png"
            title="Webpack"
          />
          <img
            alt="Ant Design"
            className="h-6"
            src="img/logos/ant-design.svg"
            title="Ant Design"
          />
          <img
            alt="Ionic Framework"
            className="h-6"
            src="img/logos/ionicframework.png"
            title="Ionic Framework"
          />
          <img
            alt="Amazon Web Services"
            className="h-6"
            src="img/logos/aws.png"
            title="Amazon Web Services"
          />
          <img
            alt="Redis"
            className="h-6"
            src="img/logos/redis.svg"
            title="Redis"
          />
        </div>
      </section>
      <section>
        <div>
          <img alt="Zehitomo" src="img/zehitomo-iphone.png" title="Zehitomo" />
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
          <img
            alt="NodeJS"
            className="h-6"
            src="img/logos/node.png"
            title="NodeJS"
          />
          <img
            alt="TypeScript"
            className="h-6"
            src="img/logos/typescript.svg"
            title="TypeScript"
          />
          <img
            alt="MongoDB"
            className="h-6"
            src="img/logos/mongodb.png"
            title="MongoDB"
          />
          <img
            alt="ExpressJS"
            className="h-6"
            src="img/logos/express.png"
            title="ExpressJS"
          />
          <img
            alt="React"
            className="h-6"
            src="img/logos/react.png"
            title="React"
          />
          <img
            alt="AngularJS"
            className="h-6"
            src="img/logos/angularjs.png"
            title="AngularJS"
          />
          <img
            alt="Amazon Web Services"
            className="h-6"
            src="img/logos/aws.png"
            title="Amazon Web Services"
          />
          <img
            alt="Redis"
            className="h-6"
            src="img/logos/redis.svg"
            title="Redis"
          />
          <img
            alt="Sentry"
            className="h-6"
            src="img/logos/sentry.png"
            title="Sentry"
          />
        </div>
      </section>
      <section>
        <div>
          <img
            alt="Six Degrees of Kevin Bacon"
            className="rounded-border"
            src="img/logos/six-degrees-of-kevin-bacon.png"
            title="Six Degrees of Kevin Bacon"
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
          <img
            alt="TypeScript"
            className="h-6"
            src="img/logos/typescript.svg"
            title="TypeScript"
          />
          <img
            alt="React"
            className="h-6"
            src="img/logos/react.png"
            title="React"
          />
          <img
            alt="Amazon Web Services"
            className="h-6"
            src="img/logos/aws.png"
            title="Amazon Web Services"
          />
          <img
            alt="D3.JS"
            className="h-6"
            src="img/logos/d3.svg"
            title="D3.JS"
          />
          <img
            alt="The Movie Database"
            className="h-6"
            src="img/logos/themoviedb.svg"
            title="The Movie Database"
          />
        </div>
      </section>
      <section>
        <div>
          <img
            className="rounded"
            src="img/background_splash_bbq.jpg"
            title="Second Shift"
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
          <img
            alt="Beaunus Sound"
            src="img/logos/beaunussound.png"
            title="Beaunus Sound"
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
            <img
              alt="Scales and Modes"
              src="img/kelly-sikkema-S4eh9DWTId4-unsplash.jpg"
              title="Scales and Modes"
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
        <i aria-hidden="true" className="far fa-hand-peace"></i>
        <p>
          <a href="mailto:beau@beaunus.com">beau@beaunus.com</a>
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <a href="https://github.com/beaunus">
            <img className="h-6" src="img/logos/github.png" />
          </a>
          <a href="https://www.linkedin.com/in/beaunus/">
            <img className="h-6" src="img/logos/linkedin.png" />
          </a>
        </div>
      </section>
    </>
  );
};

export default Home;
