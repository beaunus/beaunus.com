import type { NextPage } from "next";
import Head from "next/head";
import React from "react";

import { HighlightedLink } from "../../components/HighlightedLink";
import { Segment } from "../../components/Segment";

const BlogIndex: NextPage = () => (
  <>
    <Head>
      <title>Blog | Beaunus</title>
    </Head>
    <div className="flex flex-col grow gap-2">
      <div className="text-2xl font-semibold text-center text-cyan-700">
        Blog
      </div>
      <Segment
        body={
          <div className="flex gap-5 items-center">
            <div className="text-xl font-semibold text-purple-800 whitespace-nowrap">
              <HighlightedLink href="/blog/poisson" label="Poisson Process" />
            </div>
            <div className="">
              Given that it is raining today, which day is it most likely to
              rain again?
            </div>
          </div>
        }
      />
    </div>
  </>
);

export default BlogIndex;
