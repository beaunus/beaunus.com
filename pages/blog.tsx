import type { NextPage } from "next";
import Head from "next/head";
import React from "react";

const Blog: NextPage = () => (
  <>
    <Head>
      <title>Blog | Beaunus</title>
    </Head>
    <div className="flex flex-col grow gap-2 text-center">
      <div className="flex flex-col grow shrink-0 gap-5 px-3">Blog</div>
    </div>
  </>
);

export default Blog;
