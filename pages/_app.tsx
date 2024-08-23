import React from "react";
import { ConfigProvider } from "antd";
import type { AppProps } from "next/app";
import { Inter } from "next/font/google";
import "@/styles/globals.css";

const inter = Inter({ subsets: ["latin"] });

const App = ({ Component, pageProps }: AppProps) => (
  <ConfigProvider>
    <style jsx global>{`
      html {
        font-family: ${inter.style.fontFamily};
      }
    `}</style>
    <Component {...pageProps} />
  </ConfigProvider>
);

export default App;
