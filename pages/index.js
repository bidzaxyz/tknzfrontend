import Head from "next/head";
import Script from "next/script";
import { useEffect, useMemo, useState } from "react";
import {
  ConnectionProvider,
  WalletProvider,
  useWallet,
} from "@solana/wallet-adapter-react";
import {
  WalletModalProvider,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import "@solana/wallet-adapter-react-ui/styles.css";

import { Connection } from "@solana/web3.js";
import { Metaplex, walletAdapterIdentity } from "@metaplex-foundation/js";

const RPC_URL =
  process.env.NEXT_PUBLIC_RPC_URL ||
  "https://rpc.helius.xyz/?api-key=YOUR_API_KEY";
const API_BASE =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "https://tknzbackend.onrender.com";
const FINALITY = "finalized";

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitForFinalization(connection, sig, { tries = 15, delay = 2000 } = {}) {
  for (let i = 0; i < tries; i++) {
    try {
      const { value } = await connection.getSignatureStatuses([sig]);
      if (value?.[0]?.confirmationStatus === "finalized") return true;
    } catch {}
    await wait(delay);
  }
  return false;
}

function TokenizeClient() {
  const wallet = useWallet();
  const { connected, publicKey } = wallet;

  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [explorerUrl, setExplorerUrl] = useState("");
  const [mintStatus, setMintStatus] = useState("");

  const connection = useMemo(() => new Connection(RPC_URL, FINALITY), []);

  useEffect(() => {
    fetch(`${API_BASE}/gm`).catch(() => {});
  }, []);

  const handleTokenize = async () => {
    try {
      if (!connected || !publicKey) {
        alert("Please connect your Phantom wallet first.");
        return;
      }

      const trimmed = text.trim();
      if (!trimmed) {
        alert("Please enter some text to tokenize.");
        return;
      }

      setLoading(true);
      setMintStatus("🤖 TKNZ robots are preparing blocks for the chain...");
      setExplorerUrl("");

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 60000);

      const res = await fetch(`${API_BASE}/prepare-metadata`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          wallet_address: publicKey.toBase58(),
          text_content: trimmed,
        }),
      }).finally(() => clearTimeout(timeout));

      if (!res.ok) throw new Error(`Metadata API failed: ${await res.text()}`);
      const { metadata_uri, trimmed_name } = await res.json();
      if (!metadata_uri || !trimmed_name)
        throw new Error("Invalid metadata response.");

      setMintStatus("🔗 Metadata ready, awaiting wallet approval...");
      const mx = Metaplex.make(connection).use(walletAdapterIdentity(wallet));

      setMintStatus("🪙 Minting NFT... please confirm in Phantom");
      const { response } = await mx.nfts().create({
        uri: metadata_uri,
        name: trimmed_name,
        sellerFeeBasisPoints: 0,
        isMutable: false,
      });

      const sig = response.signature;
      const url = `https://explorer.solana.com/tx/${sig}?cluster=mainnet`;

      setMintStatus("⌛ Waiting for Solana finalization...");
      await wait(1800);
      const finalized = await waitForFinalization(connection, sig);

      if (finalized)
        setMintStatus("✅ Finalized on Solana! Check your wallet.");
      else
        setMintStatus("ℹ️ Submitted! If not visible yet, check again soon.");

      setExplorerUrl(url);
    } catch (err) {
      const msg = String(err?.message || err);
      console.error("❌ Minting failed:", err);

      if (msg.includes("already been processed")) {
        setMintStatus("✅ Transaction already confirmed!");
        alert("NFT minted successfully (duplicate TX ignored).");
        return;
      } else if (msg.includes("AbortError")) {
        setMintStatus("⚠️ Backend took too long to respond. Try again shortly.");
        alert("Backend may still be waking up — please try again in 10 seconds.");
        return;
      }

      setMintStatus("❌ Minting failed.");
      alert(`Minting failed: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>TKNZ — Tokenize Everything</title>
        <meta name="title" content="TKNZ — Tokenize Everything" />
        <meta
          name="description"
          content="Turn any text into an immutable Token on Solana blockchain."
        />
      </Head>

      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-2GPFP7E7CP"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-2GPFP7E7CP');
        `}
      </Script>

      {/* ✅ Main layout */}
      <div
        style={{
          fontFamily: "Inter, sans-serif",
          minHeight: "100vh",
          background: "#343541",
          color: "#fff",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
          padding: "24px 0",
        }}
      >
        {/* Center box */}
        <div
          style={{
            width: 360,
            maxWidth: "90vw",
            display: "flex",
            flexDirection: "column",
            gap: 16,
            alignItems: "center",
            background: "#111",
            borderRadius: 12,
            padding: 20,
            boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
          }}
        >
          <img
            src="/images/TKNZlogo.png"
            alt="TKNZ Logo"
            style={{
              width: 64,
              height: 64,
              borderRadius: "12px",
              alignSelf: "flex-start",
              marginBottom: 4,
            }}
          />

          <div style={{ alignSelf: "flex-end" }}>
            <WalletMultiButton />
          </div>

          <h1 style={{ fontSize: 22, fontWeight: 700, marginTop: 4 }}>
            Tokenize Text on Solana
          </h1>
          <p style={{ color: "#aaa", marginTop: -6, textAlign: "center" }}>
            Connect wallet, enter text, and mint an immutable token forever stored on Solana.
          </p>

          <textarea
            placeholder="Enter text to tokenize..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            style={{
              width: "100%",
              height: 120,
              padding: 12,
              borderRadius: 10,
              border: "1px solid #222",
              outline: "none",
              resize: "vertical",
              backgroundColor: "#161616",
              color: "#fff",
              fontSize: 14,
            }}
          />

          <button
            onClick={handleTokenize}
            disabled={loading}
            style={{
              width: "100%",
              backgroundColor: loading ? "#444" : "#00c2a8",
              color: "#0b0b0b",
              padding: "12px 16px",
              borderRadius: 10,
              border: "none",
              cursor: loading ? "default" : "pointer",
              fontWeight: 800,
              letterSpacing: 0.3,
            }}
          >
            {loading ? "Minting..." : "Tokenize"}
          </button>

          <a
            href="https://x.com/tknzfuncom"
            target="_blank"
            rel="noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              color: "#1DA1F2",
              marginTop: 18,
              textDecoration: "none",
              fontSize: 14,
            }}
          >
            <img
              src="/images/twitter.svg"
              alt="Twitter"
              style={{ width: 18, height: 18 }}
            />
            <span>Follow @tknzfuncom</span>
          </a>

          {mintStatus && (
            <p style={{ color: "#00d1ff", fontSize: 14, marginTop: 8 }}>
              {mintStatus}
            </p>
          )}

          {explorerUrl && (
            <p style={{ marginTop: 8, textAlign: "center" }}>
              ✅ View your transaction on{" "}
              <a
                href={explorerUrl}
                target="_blank"
                rel="noreferrer"
                style={{ color: "#00d1ff" }}
              >
                Solana Explorer
              </a>
            </p>
          )}
        </div>

        <footer
          style={{
            textAlign: "center",
            fontSize: 13,
            color: "#888",
            position: "absolute",
            bottom: 16,
            left: 0,
            right: 0,
          }}
        >
          Copyright © TKNZ FUN
        </footer>
      </div>
    </>
  );
}

function TokenizeApp() {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  if (!ready) return null;
  return <TokenizeClient />;
}

export default function HomePage() {
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  return (
    <ConnectionProvider endpoint={RPC_URL}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <TokenizeApp />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
