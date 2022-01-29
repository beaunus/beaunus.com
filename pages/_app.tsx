import "../styles/globals.css";
import type { AppProps } from "next/app";
import React from "react";

// eslint-disable-next-line @typescript-eslint/naming-convention
function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default MyApp;
