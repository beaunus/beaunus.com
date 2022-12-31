import "../styles/globals.css";
import { Nunito } from "@next/font/google";
import type { AppProps } from "next/app";
import React from "react";

const nunito = Nunito({ subsets: ["latin"] });

// eslint-disable-next-line @typescript-eslint/naming-convention
function MyApp({ Component, pageProps }: AppProps) {
  return (
    <main className={nunito.className}>
      <Component {...pageProps} />
    </main>
  );
}

export default MyApp;
