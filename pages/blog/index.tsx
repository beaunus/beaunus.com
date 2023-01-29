import type { NextPage } from "next";
import Head from "next/head";
import React from "react";

const BlogIndex: NextPage = () => (
  <>
    <Head>
      <title>Blog | Beaunus</title>
    </Head>
    <div className="flex flex-col grow gap-2 text-center">
      <div className="flex flex-col gap-5 px-3">Blog</div>
    </div>
  </>
);

export default BlogIndex;
