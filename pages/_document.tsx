import { Head, Html, Main, NextScript } from "next/document";
import React, { FC } from "react";

const Document: FC = () => (
  <Html lang="en">
    <Head>
      <meta
        content="Beau Dobbin is a software engineering leader based in Tokyo, Japan."
        name="description"
      />
      <meta content="width=device-width,initial-scale=1" name="viewport" />
    </Head>
    <body>
      <Main />
      <NextScript />
    </body>
  </Html>
);

export default Document;
