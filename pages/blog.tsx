import type { NextPage } from "next";
import Head from "next/head";
import React from "react";

import { Footer } from "../components/Footer";
import { Header } from "../components/Header";

const Blog: NextPage = () => (
  <>
    <Head>
      <title>Blog | Beaunus</title>
      <meta content="" name="description" />
      <meta content="width=device-width,initial-scale=1" name="viewport" />
    </Head>
    <div className="flex flex-col gap-2 text-center">
      <Header />
      <div className="flex flex-col grow shrink-0 gap-5 px-3">Blog</div>
      <Footer />
    </div>
  </>
);

export default Blog;
