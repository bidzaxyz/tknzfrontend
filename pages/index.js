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
  const [mintAddress, setMintAddress] = useState("");
  const [toast, setToast] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  const connection = useMemo(() => new Connection(RPC_URL, FINALITY), []);

  useEffect(() => {
    fetch(`${API_BASE}/gm`).catch(() => {});
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const handleTokenize = async () => {
    try {
      if (!connected || !publicKey) {
        showToast("⚠️ Please connect your wallet first.");
        return;
      }

      const trimmed = text.trim();
      if (!trimmed) {
        showToast("✍️ Please enter some text to tokenize.");
        return;
      }

      setLoading(true);
      setMintStatus("🤖 TKNZ robots are preparing blocks for the chain...");
      setExplorerUrl("");

      const res = await fetch(`${API_BASE}/prepare-metadata`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet_address: publicKey.toBase58(),
          text_content: trimmed,
        }),
      });

      if (!res.ok) throw new Error(`Metadata API failed: ${await res.text()}`);
      const { metadata_uri, trimmed_name } = await res.json();

      setMintStatus("🔗 Metadata ready, awaiting wallet approval...");
      const mx = Metaplex.make(connection).use(walletAdapterIdentity(wallet));

      setMintStatus("🪙 Minting NFT... please confirm in your wallet");
const result = await mx.nfts().create({
  uri: metadata_uri,
  name: trimmed_name,
  sellerFeeBasisPoints: 0,
  isMutable: false,
});

      const mintAddr =
        result?.nft?.address?.toBase58?.() ||
        result?.nft?.mintAddress?.toBase58?.() ||
        result?.response?.mintAddress?.toBase58?.();

      const sig = result?.response?.signature || "";

      if (mintAddr) {
        setMintAddress(mintAddr);
        showToast("✅ NFT minted successfully!");
      } else {
        console.warn("Mint result structure unexpected:", result);
        showToast("⚠️ NFT minted, but details couldn’t be retrieved. Check your wallet.");
      }

      const url = sig
        ? `https://explorer.solana.com/tx/${sig}?cluster=mainnet`
        : "";


      setMintStatus("⌛ Waiting for Solana finalization...");
      await wait(1800);
      const finalized = await waitForFinalization(connection, sig);

      setMintStatus(
        finalized
          ? "✅ Finalized on Solana! Check your wallet."
          : "ℹ️ Submitted! If not visible yet, check again soon."
      );
      setExplorerUrl(url);
      showToast("✅ NFT minted successfully!");
    } catch (err) {
      console.error("❌ Minting failed:", err);

      const msg = err.message?.toLowerCase() || "";

      // Expanded detection for low-balance & simulation errors
      if (
        msg.includes("insufficient lamports") ||
        msg.includes("no record of a prior credit") ||
        msg.includes("insufficient funds") ||
        msg.includes("not enough") ||
        msg.includes("simulation failed") ||
        msg.includes("attempt to debit")
      ) {
        setShowPopup(true);
        setTimeout(() => setShowPopup(false), 5000);
        setMintStatus("❌ Not enough balance to mint.");
        return;
      }

      showToast("❌ Minting failed. Please try again later.");
      setMintStatus("❌ Minting failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>TKNZ — Tokenize Everything</title>
        <meta
          name="description"
          content="Tokenize any text into an immutable NFT on Solana."
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
        {/* Center Box */}
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

          <p style={{ color: "#aaa", fontSize: 13, marginTop: -6 }}>
            Network cost: ~0.02 SOL (covers rent & fees)
          </p>

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
              <a href={explorerUrl} target="_blank" rel="noreferrer" style={{ color: "#00d1ff" }}>
                Solana Explorer
              </a>
            </p>
          )}
          {mintAddress && (
            <a
              href={`/token/${mintAddress}`}
              style={{
                marginTop: 8,
                color: "#00ffcc",
                textDecoration: "none",
                fontWeight: 700,
              }}
            >
              🔗 View your token page
            </a>
          )}
        </div>

        {/* Global Popup */}
        {showPopup && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
            }}
          >
            <div
              style={{
                background: "#111",
                border: "1px solid #00c2a8",
                borderRadius: 12,
                padding: "24px 28px",
                textAlign: "center",
                maxWidth: "320px",
                color: "#fff",
                boxShadow: "0 0 20px rgba(0,0,0,0.6)",
              }}
            >
              <h3 style={{ color: "#00c2a8", marginBottom: 8 }}>💸 Insufficient Balance</h3>
              <p style={{ fontSize: 14, color: "#ccc", marginBottom: 16 }}>
                You don’t have enough SOL to mint.<br />
                Please top up at least <strong>0.02 SOL</strong> and try again.
              </p>
              <button
                onClick={() => setShowPopup(false)}
                style={{
                  background: "#00c2a8",
                  border: "none",
                  color: "#000",
                  padding: "8px 14px",
                  borderRadius: 8,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Toast */}
        {toast && (
          <div
            style={{
              position: "fixed",
              bottom: 80,
              background: "#00c2a8",
              color: "#0b0b0b",
              padding: "8px 16px",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              animation: "fadeInOut 2s ease",
            }}
          >
            {toast}
          </div>
        )}

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
