import { Header } from "@/components/header";
import { SessionProvider } from "next-auth/react"
import "../../styles/globals.css";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps}: AppProps) {
  return (
    <SessionProvider session={pageProps.session}>
      <Header />
      <Component {...pageProps} />
    </SessionProvider>
  );
}
