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
import { Icon } from "../components/Icon";
import { JobsSection } from "../components/JobsSection";
import { Segment } from "../components/Segment";
import * as Logos from "../images/logos";
import * as Photos from "../images/photos";

const Header: React.FC = () => (
  <header className="flex flex-row-reverse p-3 mb-8">
    <Image
      alt="Beaunus Logo"
      height={25}
      priority={true}
      src={Logos.BeaunusPixels}
      width={119.25}
    />
  </header>
);

const TitleSection: React.FC = () => (
  <Segment
    body={
      <div className="flex flex-col gap-5 items-center px-3 w-full">
        <div>
          <div className="text-4xl font-semibold">Beau Dobbin</div>
          <div className="text-2xl font-semibold text-cyan-700">
            Software Engineer
          </div>
        </div>
        <div className="flex flex-wrap gap-5 justify-around w-full">
          <Icon color="text-blue-700" icon={faTerminal} label="Code" />
          <Icon color="text-orange-500" icon={faHandshake} label="Education" />
          <Icon color="text-green-600" icon={faMusic} label="Music" />
          <Icon
            color="text-indigo-400"
            icon={faHeadphones}
            label="Engineering"
          />
        </div>
      </div>
    }
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
  />
);

const Footer: React.FC = () => (
  <footer className="flex flex-col shrink-0 gap-8 justify-evenly items-center py-16 px-5 even:mt-2 w-full even:bg-gray-100">
    <FontAwesomeIcon icon={faHandPeace} />
    <HighlightedLink href="mailto:beau@beaunus.com" label="beau@beaunus.com" />
    <div className="flex flex-wrap gap-8 justify-center">
      <HighlightedLink
        href="https://github.com/beaunus"
        label={<Image alt="Github" height={24} src={Logos.Github} width={89} />}
      />
      <HighlightedLink
        href="https://www.linkedin.com/in/beaunus/"
        label={
          <Image alt="Linkedin" height={24} src={Logos.LinkedIn} width={91} />
        }
      />
    </div>
  </footer>
);

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
    <Header />
    <div className="flex flex-col gap-20 items-center text-center">
      <TitleSection />
      <JobsSection />
      <Footer />
    </div>
  </>
);

export default Home;
