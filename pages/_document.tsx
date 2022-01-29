import { Head, Html, Main, NextScript } from "next/document";
import React, { FC } from "react";

const Document: FC = () => (
  <Html>
    <Head>
      <link
        href="https://fonts.googleapis.com/css2?family=Nunito&display=swap"
        rel="stylesheet"
      />
    </Head>
    <body>
      <Main />
      <NextScript />
    </body>
  </Html>
);

export default Document;
