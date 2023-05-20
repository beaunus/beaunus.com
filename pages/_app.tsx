import { config } from "@fortawesome/fontawesome-svg-core";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Nunito } from "@next/font/google";
import type { AppProps } from "next/app";
import Head from "next/head";
import Script from "next/script";
import "../styles/globals.scss";

import "@fortawesome/fontawesome-svg-core/styles.css";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";

config.autoAddCss = false;

const nunito = Nunito({ subsets: ["latin"] });

// eslint-disable-next-line @typescript-eslint/naming-convention
function MyApp({ Component, pageProps }: AppProps) {
	return (
		<>
			<Script
				dangerouslySetInnerHTML={{
					// eslint-disable-next-line @typescript-eslint/naming-convention
					__html: `window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}', {page_path: window.location.pathname, });`,
				}}
				id="gtag"
			/>
			{/* Google Tag Manager */}
			<Script
				dangerouslySetInnerHTML={{
					// eslint-disable-next-line @typescript-eslint/naming-convention
					__html: `window.dataLayer = window.dataLayer || [];(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}');`,
				}}
				id="gtm-script"
			/>
			<Head>
				<meta content="width=device-width,initial-scale=1" name="viewport" />
			</Head>
			<ThemeProvider
				theme={createTheme({
					breakpoints: {
						// eslint-disable-next-line sort-keys
						values: { xs: 0, sm: 640, md: 768, lg: 1024, xl: 1280 },
					},
				})}
			>
				<main
					className={`${nunito.className} flex flex-col justify-between h-screen`}
				>
					<Header />
					<div className="grow">
						<Component {...pageProps} />
					</div>
					<Footer />
				</main>
			</ThemeProvider>
		</>
	);
}

export default MyApp;
