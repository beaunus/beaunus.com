import type { NextPage } from "next";
import Head from "next/head";
import React from "react";

import { Footer } from "../components/Footer";
import { Header } from "../components/Header";

const Blog: NextPage = () => (
  <>
    <Head>
      <title>Blog | Beaunus</title>
    </Head>
    <div className="flex flex-col gap-2 text-center">
      <Header />
      <div className="flex flex-col grow shrink-0 gap-5 px-3">Blog</div>
    </div>
    <Footer />
  </>
);

export default Blog;
