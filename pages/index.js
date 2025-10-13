import Head from "next/head";
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

  // ✅ Wake Render backend immediately
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

      // 1️⃣ Upload metadata with timeout (Render cold start)
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

      // 2️⃣ Initialize Metaplex SDK with Phantom signer
      const mx = Metaplex.make(connection).use(walletAdapterIdentity(wallet));

      // 3️⃣ Mint immutable NFT
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
      {/* ✅ SEO, OpenGraph, Twitter */}
      <Head>
        <title>TKNZ — Tokenize Everything</title>
        <meta name="title" content="TKNZ — Tokenize Everything" />
        <meta
          name="description"
          content="Platform for fun tokenizations activity on Solana Blockchain. Tokenize any text into an immutable NFT on the Solana blockchain that will be there forever."
        />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://tknz.bidza.xyz/" />
        <meta property="og:title" content="TKNZ — Tokenize Everything" />
        <meta
          property="og:description"
          content="Turn your words into on-chain collectibles. Free, immutable, and forever on Solana."
        />
        <meta property="og:image" content="/images/ogimage.png" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://tknz.bidza.xyz/" />
        <meta name="twitter:title" content="TKNZ — Tokenize Everything" />
        <meta
          name="twitter:description"
          content="Fun tokenizations platform that runs on Solana."
        />
        <meta name="twitter:image" content="/images/ogimage.png" />

        <link rel="icon" href="/images/TKNZlogo.png" />
      </Head>

      <div
        style={{
          fontFamily: "Inter, sans-serif",
          minHeight: "100vh",
          background: "#0a0a0a",
          color: "#fff",
          display: "grid",
          placeItems: "center",
          padding: 24,
        }}
      >
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
          {/* ✅ Logo top-left */}
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
            🧠 Tokenized Text
          </h1>
          <p style={{ color: "#aaa", marginTop: -6, textAlign: "center" }}>
            Connect wallet, enter text, mint an NFT on Solana.
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
