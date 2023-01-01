import {
  faHandPeace,
  faHandshake,
  faHeadphones,
  faMusic,
  faTerminal,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import React from "react";

import { HighlightedLink } from "../components/HighlightedLink";
import { JobsSection } from "../components/JobsSection";
import * as Logos from "../images/logos";
import * as Photos from "../images/photos";

const Home: NextPage = () => (
  <>
    <Head>
      <title>Beaunus</title>
      <meta
        content="Beau Dobbin is a software engineering leader based in Tokyo, Japan."
        name="description"
      />
      <meta content="width=device-width,initial-scale=1" name="viewport" />
    </Head>
    <div className="flex flex-col gap-2 text-center">
      <header className="flex flex-row-reverse p-3 mb-8">
        <Image
          alt="Beaunus Logo"
          height={25}
          priority={true}
          src={Logos.BeaunusPixels}
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
            src={Photos.BeauDobbinPhoto}
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
      <JobsSection />
      <footer className="flex flex-col shrink-0 gap-8 justify-evenly items-center py-16 px-5 odd:mt-2 odd:bg-gray-100">
        <FontAwesomeIcon icon={faHandPeace} />
        <HighlightedLink
          href="mailto:beau@beaunus.com"
          label="beau@beaunus.com"
        />
        <div className="flex flex-wrap gap-8 justify-center">
          <HighlightedLink
            href="https://github.com/beaunus"
            label={
              <Image alt="Github" height={24} src={Logos.Github} width={89} />
            }
          />
          <HighlightedLink
            href="https://www.linkedin.com/in/beaunus/"
            label={
              <Image
                alt="Linkedin"
                height={24}
                src={Logos.LinkedIn}
                width={91}
              />
            }
          />
        </div>
      </footer>
    </div>
  </>
);

export default Home;
