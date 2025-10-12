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

import { Connection, PublicKey } from "@solana/web3.js";
import { Metaplex, walletAdapterIdentity } from "@metaplex-foundation/js";

// ---- ENV (set these in .env.local on the frontend and in Render) ----
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL;           // e.g. Helius mainnet URL
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "";   // your FastAPI base, e.g. https://api.yourdomain.com

// Fallbacks (use only if env is missing; for prod you should provide RPC_URL)
const FINALITY = "finalized";

// Simple sleep
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// Poll for "finalized" with retries
async function waitForFinalization(connection, signature, {
  maxAttempts = 15,        // ~30s if 2s each
  delayMs = 2000,
} = {}) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const { value } = await connection.getSignatureStatuses([signature]);
      const status = value?.[0];
      if (status?.confirmationStatus === "finalized") {
        return { ok: true, status: "finalized" };
      }
    } catch (_) {
      // ignore transient RPC errors and retry
    }
    await wait(delayMs);
  }
  return { ok: false, status: "timeout" };
}

// =======================
// 🧠 Tokenize Client Component (PROD)
// =======================
function TokenizeClient() {
  const wallet = useWallet();
  const { connected, publicKey } = wallet;

  const [isReady, setIsReady] = useState(false);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [explorerUrl, setExplorerUrl] = useState("");
  const [mintStatus, setMintStatus] = useState("");

  // IMPORTANT: use your private RPC (Helius/QuickNode/Alchemy)
  const connection = useMemo(() => new Connection(RPC_URL, FINALITY), []);

  useEffect(() => setIsReady(true), []);
  if (!isReady) return null;

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
      setExplorerUrl("");
      setMintStatus("⏳ Uploading metadata to IPFS...");

      // 1) Upload metadata to backend (Pinata/IPFS)
      const res = await fetch(`${API_BASE}/prepare-metadata`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet_address: publicKey.toBase58(),
          text_content: trimmed,
        }),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(`Metadata API failed (${res.status}): ${msg}`);
      }

      const { metadata_uri, trimmed_name } = await res.json();
      if (!metadata_uri || !trimmed_name)
        throw new Error("Invalid metadata response from backend.");

      setMintStatus("🔗 Metadata ready, awaiting wallet approval...");

      // 2) Initialize Metaplex SDK with Phantom signer
      const mx = Metaplex.make(connection).use(walletAdapterIdentity(wallet));

      // 3) Mint immutable NFT (finalized confirmation flow)
      setMintStatus("🪙 Minting NFT... please confirm in Phantom");
      const { response } = await mx.nfts().create({
        uri: metadata_uri,
        name: trimmed_name,
        sellerFeeBasisPoints: 0,
        isMutable: false,
      });

      const sig = response.signature;
      const url = `https://explorer.solana.com/tx/${sig}?cluster=mainnet`;
      setMintStatus("🔍 Waiting for finalization on Solana...");
      // Short grace delay before we start polling (reduces “already processed” races)
      await wait(1800);

      // Manual confirmation loop for "finalized"
      const { ok } = await waitForFinalization(connection, sig, {
        maxAttempts: 15,
        delayMs: 2000,
      });

      if (!ok) {
        // Fallback: it may still be confirmed on a different RPC—treat as success and show Explorer.
        console.warn("Confirmation polling timed out; showing Explorer link.");
        setMintStatus("ℹ️ Submitted. If it doesn’t show yet, try again in a moment.");
      } else {
        setMintStatus("✅ Finalized on Solana!");
      }

      setExplorerUrl(url);
    } catch (err) {
      console.error("❌ Minting failed:", err);

      const msg = String(err?.message || err);

      // Treat known duplicates as success
      if (msg.includes("already been processed")) {
        setMintStatus("✅ Transaction already confirmed on Solana!");
        // We may not have the signature here; prompt user to check their wallet history.
        alert("NFT minted successfully (duplicate TX ignored). Check your wallet/Explorer.");
        return;
      }

      // Surface logs if available
      if (err.getLogs) {
        try {
          console.log("🔍 Transaction Logs:", await err.getLogs());
        } catch {}
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
          Connect wallet, enter text, mint as an NFT on Solana.
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
// Prevent SSR hydration issues
// =======================
function TokenizeApp() {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  if (!ready) return null;
  return <TokenizeClient />;
}

// =======================
// Export the page
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
