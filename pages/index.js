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
  useWalletModal,
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

// ✅ Custom Phantom-only button
function PhantomOnlyButton() {
  const { visible, setVisible } = useWalletModal();
  const wallet = useWallet();

  return (
    <button
      onClick={() => {
        // Only allow Phantom
        if (typeof window !== "undefined" && window.solana?.isPhantom) {
          setVisible(true);
        } else {
          alert("❌ Please install or use the Phantom wallet to continue.");
        }
      }}
      disabled={wallet.connecting}
      style={{
        background: "#00c2a8",
        color: "#111",
        border: "none",
        borderRadius: 10,
        padding: "10px 18px",
        fontWeight: 700,
        cursor: "pointer",
      }}
    >
      {wallet.connected ? "Connected ✅" : "Connect Phantom Wallet"}
    </button>
  );
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

      setMintStatus(
        finalized
          ? "✅ Finalized on Solana! Check your wallet."
          : "ℹ️ Submitted! If not visible yet, check again soon."
      );

      setExplorerUrl(url);
    } catch (err) {
      console.error("❌ Minting failed:", err);
      alert(`Minting failed: ${err.message || err}`);
      setMintStatus("❌ Minting failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>TKNZ — Tokenize Everything</title>
        <meta name="description" content="Tokenize any text into an immutable NFT on Solana." />
      </Head>

      <Script src="https://www.googletagmanager.com/gtag/js?id=G-2GPFP7E7CP" strategy="afterInteractive" />
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
        }}
      >
        <div
          style={{
            width: 360,
            maxWidth: "90vw",
            background: "#111",
            borderRadius: 12,
            padding: 20,
            boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
          }}
        >
          <img src="/images/TKNZlogo.png" alt="TKNZ Logo" style={{ width: 64, height: 64 }} />

          <PhantomOnlyButton />

          <h1 style={{ fontSize: 22, fontWeight: 700 }}>Tokenize Text on Solana</h1>
          <p style={{ color: "#aaa", textAlign: "center", marginTop: -6 }}>
            Connect your Phantom wallet, enter text, and mint a token forever on Solana.
          </p>

          <textarea
            placeholder="Enter text to tokenize..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            style={{
              width: "100%",
              height: 120,
              backgroundColor: "#161616",
              borderRadius: 10,
              border: "1px solid #222",
              color: "#fff",
              padding: 12,
            }}
          />

          <button
            onClick={handleTokenize}
            disabled={loading}
            style={{
              width: "100%",
              backgroundColor: loading ? "#444" : "#00c2a8",
              color: "#111",
              border: "none",
              borderRadius: 10,
              padding: "12px 16px",
              fontWeight: 800,
              cursor: loading ? "default" : "pointer",
            }}
          >
            {loading ? "Minting..." : "Tokenize"}
          </button>

          {mintStatus && <p style={{ color: "#00d1ff", fontSize: 14 }}>{mintStatus}</p>}

          {explorerUrl && (
            <p style={{ marginTop: 8, textAlign: "center" }}>
              ✅ View your transaction on{" "}
              <a href={explorerUrl} target="_blank" rel="noreferrer" style={{ color: "#00d1ff" }}>
                Solana Explorer
              </a>
            </p>
          )}
        </div>

        <footer
          style={{
            position: "absolute",
            bottom: 16,
            fontSize: 13,
            color: "#888",
            textAlign: "center",
            width: "100%",
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
