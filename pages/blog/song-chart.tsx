import { Typography } from "@mui/material";
import type { NextPage } from "next";
import Head from "next/head";

const SongChart: NextPage = () => {
  return (
    <>
      <Head>
        <title>Song Chart | Beaunus</title>
      </Head>
      <div className="flex flex-col gap-5 px-14 w-full">
        <div className="text-2xl font-semibold text-center text-cyan-700">
          Song Chart
        </div>
        <Typography>Hello</Typography>
      </div>
    </>
  );
};

export default SongChart;
