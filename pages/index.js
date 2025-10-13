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

import {
  Connection,
  SystemProgram,
  Transaction,
  LAMPORTS_PER_SOL,
  PublicKey,
} from "@solana/web3.js";
import { Metaplex, walletAdapterIdentity } from "@metaplex-foundation/js";
import SiteFooter from "../components/SiteFooter";
import GA from "../components/GA";
import Link from "next/link";


const RPC_URL =
  process.env.NEXT_PUBLIC_RPC_URL ||
  "https://rpc.helius.xyz/?api-key=YOUR_API_KEY";
const API_BASE =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "https://tknzbackend.onrender.com";
const FINALITY = "finalized";

// ✅ Fee wallet from environment variable (set in Netlify)
let FEE_WALLET;
if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_FEE_WALLET) {
  try {
    const { PublicKey } = require("@solana/web3.js");
    FEE_WALLET = new PublicKey(process.env.NEXT_PUBLIC_FEE_WALLET);
  } catch (e) {
    console.error("Failed to load PublicKey:", e);
  }
}

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
  const { connected, publicKey, sendTransaction } = wallet;

  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [explorerUrl, setExplorerUrl] = useState("");
  const [mintStatus, setMintStatus] = useState("");
  const [mintAddress, setMintAddress] = useState("");
  const [toast, setToast] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  const connection = useMemo(() => new Connection(RPC_URL, FINALITY), []);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    fetch(`${API_BASE}/gm`).catch(() => {});
    return () => {
      document.body.style.overflow = "";
    };
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
      setMintStatus("🤖 TKNZFUN robots are preparing blocks for the chain...");
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

      setMintStatus("🔗 Metadata ready, building combined transaction...");
      const mx = Metaplex.make(connection).use(walletAdapterIdentity(wallet));

      // Build the NFT creation builder
      const builder = await mx
        .nfts()
        .builders()
        .create({
          uri: metadata_uri,
          name: trimmed_name,
          sellerFeeBasisPoints: 0,
          isMutable: false,
        });

      // ✅ Create fee transfer instruction first
      const feeInstruction = SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: FEE_WALLET,
        lamports: 0.01 * LAMPORTS_PER_SOL,
      });

      // ✅ Prepend fee instruction to builder
      builder.prependInstruction(feeInstruction);

      // ✅ Build final transaction correctly
      const transaction = await builder.toTransaction(connection);

      // ✅ Set payer and blockhash
      transaction.feePayer = publicKey;
      transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

      setMintStatus("🪙 Minting NFT... please confirm in your wallet");
      const sig = await sendTransaction(transaction, connection);


      setMintStatus("⌛ Waiting for Solana finalization...");
      const finalized = await waitForFinalization(connection, sig);
      const url = `https://explorer.solana.com/tx/${sig}?cluster=mainnet`;

      if (finalized) {
        showToast("✅ NFT minted successfully!");
        setMintStatus("✅ Finalized on Solana! Check your wallet.");
      } else {
        setMintStatus("ℹ️ Submitted! If not visible yet, check again soon.");
      }

      setExplorerUrl(url);
      setMintAddress(nft.address.toBase58());
    } catch (err) {
      console.error("❌ Minting failed:", err);
      const msg = err.message?.toLowerCase() || "";
      if (
        msg.includes("insufficient") ||
        msg.includes("not enough") ||
        msg.includes("attempt to debit")
      ) {
        setShowPopup(true);
        setTimeout(() => setShowPopup(false), 5000);
        setMintStatus("❌ Not enough balance to mint.");
        return;
      }
      setMintStatus("❌ Minting failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>TKNZFUN — Tokenize Everything</title>
        <meta
          name="description"
          content="Tokenize any text into an immutable NFT on Solana."
        />
      </Head>

      <GA />

      <div
        style={{
          fontFamily: "Inter, sans-serif",
          background: "#343541",
          color: "#fff",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
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
            marginTop: 100,
          }}
        >
          <Link href="/" style={{ display: "inline-block", alignSelf: "flex-start" }}>
            <img
              src="/images/TKNZlogo.png"
              alt="TKNZFUN Logo"
              style={{
                width: 64,
                height: 64,
                borderRadius: "12px",
                marginBottom: 4,
                cursor: "pointer",
              }}
            />
          </Link>
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

          {/* ✅ Updated total cost text */}
          <p style={{ color: "#aaa", fontSize: 13, marginTop: -6 }}>
            Total max cost: 0.03 SOL
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

          {mintStatus && (
            <p style={{ color: "#00d1ff", fontSize: 14, marginTop: 8 }}>{mintStatus}</p>
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

        <div
          style={{
            width: "100%",
            marginTop: "auto",
            display: "block",
            paddingBottom: 8,
          }}
        >
          <SiteFooter />
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
