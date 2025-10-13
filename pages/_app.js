import Head from "next/head";
import { useMemo } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import "@solana/wallet-adapter-react-ui/styles.css";
import "@/styles/globals.css";

export default function App({ Component, pageProps }) {
  const endpoint = "https://api.mainnet-beta.solana.com";
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  return (
    <>
      {/* ✅ Static SEO + OG + Twitter meta tags */}
      <Head>
        <title>TKNZ — Tokenize Everything</title>
        <meta
          name="description"
          content="Tokenize any text into an immutable NFT on the Solana blockchain. Fun, free, and forever on-chain."
        />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://tknzfun.com/" />
        <meta property="og:title" content="TKNZ — Tokenize Everything" />
        <meta
          property="og:description"
          content="Turn your words into on-chain collectibles. Free, immutable, and forever on Solana."
        />
        <meta
          property="og:image"
          content="https://tknzfun.com/images/ogimage.png"
        />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://tknzfun.com/" />
        <meta name="twitter:title" content="TKNZ — Tokenize Everything" />
        <meta
          name="twitter:description"
          content="Fun tokenizations platform that runs on Solana."
        />
        <meta
          name="twitter:image"
          content="https://tknzfun.com/images/ogimage.png"
        />

        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* ✅ App providers */}
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <Component {...pageProps} />
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </>
  );
}
