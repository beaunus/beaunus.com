import { Head, Html, Main, NextScript } from "next/document";
import React, { FC } from "react";

const Document: FC = () => (
  <Html lang="en">
    <Head>
      <meta
        content="Beau Dobbin is a software engineering leader based in Tokyo, Japan."
        name="description"
      />
    </Head>
    <body>
      <Main />
      <NextScript />
    </body>
  </Html>
);

export default Document;
