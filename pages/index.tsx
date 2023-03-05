import {
  faHandshake,
  faHeadphones,
  faMusic,
  faTerminal,
} from "@fortawesome/free-solid-svg-icons";
import FS from "@isomorphic-git/lightning-fs";
import { Button } from "@mui/material";
import { globby } from "globby";
import micromatch from "micromatch";
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

const GitThing: React.FC = () => {
  const [state, setState] = React.useState<"idle" | "loading" | "loaded">(
    "idle"
  );

  const fs = new FS("testfs2");
  const pfs = fs.promises;

  const thing = async () => {
    // console.log(await pfs.readdir(myDir));
    const dir = "/rabbit";
    await pfs
      .mkdir(dir)
      .then((happy) => {
        console.log({ happy });
      })
      .catch((error) => {
        console.log({ error });
      });

    console.log(await pfs.readlink(dir));

    // Now it should not be empty...
    await pfs.readdir(dir);
  };

  React.useEffect(() => {
    thing();
  }, []);

  return (
    <>
      {state}
      <Button component="label" variant="contained">
        Upload
        <input
          hidden
          onChange={async (e) => {
            setState("loading");
            console.log({ e });
            console.log(e.target);
            const filesArray = Array.from(e.target.files || []);
            const gitIgnore = filesArray.find(
              (file) => file.name === ".gitignore"
            );

            const globsToIgnore =
              (await gitIgnore
                ?.text()
                .then((fileString) =>
                  fileString
                    .split("\n")
                    .filter((line) => line && !line.startsWith("#"))
                )) ?? [];

            const isMatch = micromatch.matcher("*", { ignore: globsToIgnore });

            const filesNotIgnored = filesArray.filter(({ name }) =>
              isMatch(name)
            );
            console.log({ filesArray, filesNotIgnored, gitIgnore });

            setState("loaded");

            for (let i = 0; i < filesNotIgnored.slice(0, 10).length; ++i) {
              const file = filesNotIgnored[i];
              await pfs
                .writeFile(file.webkitRelativePath, await file.text())
                .catch((e) => console.log({ e }));
            }

            console.log(await pfs.du("."));
          }}
          onClick={() => {
            setState("loading");
          }}
          onLoadedData={(x) => console.log({ x })}
          type="file"
          // @ts-expect-error Property 'webkitdirectory' does not exist on type 'DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>'.
          webkitdirectory="true"
        />
      </Button>
    </>
  );
};

const Home: NextPage = () => (
  <>
    <Head>
      <title>Beaunus</title>
    </Head>
    <div className="flex flex-col grow gap-20 items-center text-center">
      <GitThing />
      <TitleSection />
      <JobsSection />
    </div>
  </>
);

export default Home;
