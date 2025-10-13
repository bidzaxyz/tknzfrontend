import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <title>TKNZ — Tokenize Everything</title>
        <meta name="title" content="TKNZ — Tokenize Everything" />
        <meta
          name="description"
          content="Tokenize any text into an immutable NFT on Solana blockchain."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://tknzfun.com/" />
        <meta property="og:title" content="TKNZ — Tokenize Everything" />
        <meta
          property="og:description"
          content="Turn your words into on-chain collectibles. Free, immutable, and forever on Solana."
        />
        <meta property="og:image" content="https://tknzfun.com/images/ogimage.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="TKNZ — Tokenize Everything" />
        <meta
          name="twitter:description"
          content="Fun tokenizations platform that runs on Solana."
        />
        <meta name="twitter:image" content="https://tknzfun.com/images/ogimage.png" />
        <link rel="icon" href="/images/TKNZlogo.png" />
        <link rel="icon" href="/favicon.ico" />

      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
