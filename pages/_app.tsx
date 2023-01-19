import "../styles/globals.css";
import { config } from "@fortawesome/fontawesome-svg-core";
import { Nunito } from "@next/font/google";
import type { AppProps } from "next/app";
import React from "react";

import "@fortawesome/fontawesome-svg-core/styles.css";
config.autoAddCss = false;

const nunito = Nunito({ subsets: ["latin"] });

// eslint-disable-next-line @typescript-eslint/naming-convention
function MyApp({ Component, pageProps }: AppProps) {
  return (
    <main
      className={`${nunito.className} flex flex-col justify-between h-screen`}
    >
      <Component {...pageProps} />
    </main>
  );
}

export default MyApp;
