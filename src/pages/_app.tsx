import type { AppProps } from "next/app";
import "../common/globals.css";

export default ({ Component, pageProps }: AppProps) => {
  return <Component {...pageProps} />;
};
