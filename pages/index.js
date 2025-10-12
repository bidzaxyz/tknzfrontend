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

// ========================
// ✅ Environment & defaults
// ========================
const RPC_URL =
  process.env.NEXT_PUBLIC_RPC_URL || "https://rpc.helius.xyz/?api-key=YOUR_API_KEY";
const API_BASE =
  process.env.NEXT_PUBLIC_BACKEND_URL || "https://tknzbackend.onrender.com";
const FINALITY = "finalized";

// Helper: delay + confirmation polling
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
async function waitForFinalization(connection, sig, { tries = 15, delay = 2000 } = {}) {
  for (let i = 0; i < tries; i++) {
    try {
      const { value } = await connection.getSignatureStatuses([sig]);
      const st = value?.[0];
      if (st?.confirmationStatus === "finalized") return true;
    } catch (_) {}
    await wait(delay);
  }
  return false;
}

// ========================
// 🧠 Main client component
// ========================
function TokenizeClient() {
  const wallet = useWallet();
  const { connected, publicKey } = wallet;

  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [explorerUrl, setExplorerUrl] = useState("");
  const [mintStatus, setMintStatus] = useState("");

  const connection = useMemo(() => new Connection(RPC_URL, FINALITY), []);

  // ✅ Hydration guard comes AFTER hooks
  if (typeof window === "undefined") return null;


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
      setMintStatus("⏳ Uploading metadata to IPFS...");

      // 1️⃣ Upload metadata to backend
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
      if (!metadata_uri || !trimmed_name)
        throw new Error("Invalid metadata response from backend.");

      console.log("✅ Metadata uploaded:", metadata_uri);
      setMintStatus("🔗 Metadata ready, awaiting wallet approval...");

      // 2️⃣ Initialize Metaplex SDK with Phantom
      const mx = Metaplex.make(connection).use(walletAdapterIdentity(wallet));

      // 3️⃣ Mint immutable NFT
      console.log("🪙 Minting NFT...");
      setMintStatus("🪙 Minting NFT... please confirm in Phantom");

      const { response } = await mx.nfts().create({
        uri: metadata_uri,
        name: trimmed_name,
        sellerFeeBasisPoints: 0,
        isMutable: false,
      });

      const sig = response.signature;
      const url = `https://explorer.solana.com/tx/${sig}?cluster=mainnet`;
      console.log("🔍 Waiting for finalization...");

      setMintStatus("⌛ Waiting for Solana finalization...");
      await wait(1800);
      const finalized = await waitForFinalization(connection, sig);

      if (finalized) {
        setMintStatus("✅ Finalized on Solana!");
      } else {
        setMintStatus(
          "ℹ️ Submitted! If not visible yet, check again in a moment."
        );
      }

      setExplorerUrl(url);
      console.log("✅ Minted NFT:", url);
    } catch (err) {
      console.error("❌ Minting failed:", err);
      const msg = String(err?.message || err);

      // Treat known race condition as success
      if (msg.includes("already been processed")) {
        setMintStatus("✅ Transaction already confirmed!");
        alert("NFT minted successfully (duplicate TX ignored).");
        return;
      }

      setMintStatus("❌ Minting failed.");
      alert(`Minting failed: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  // =======================
  // UI
  // =======================
  return (
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
        <div style={{ alignSelf: "flex-end" }}>
          <WalletMultiButton />
        </div>

        <h1 style={{ fontSize: 22, fontWeight: 700, marginTop: 4 }}>
          🧠 Tokenized Text
        </h1>
        <p style={{ color: "#aaa", marginTop: -6, textAlign: "center" }}>
          Connect wallet, enter text, and mint an NFT on Solana.
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
  );
}

// =======================
// ✅ Client hydration guard
// =======================
function TokenizeApp() {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  if (!ready) return null;
  return <TokenizeClient />;
}

// =======================
// ✅ Page export
// =======================
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
