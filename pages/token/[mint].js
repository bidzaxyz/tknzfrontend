import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { Connection, PublicKey } from "@solana/web3.js";
import { Metaplex } from "@metaplex-foundation/js";

const RPC_URL =
  process.env.NEXT_PUBLIC_RPC_URL ||
  "https://mainnet.helius-rpc.com/?api-key=029f8e0c-9b81-4d65-885f-e5dcb52f47ea";
const FINALITY = "finalized";

export default function TokenPage() {
  const router = useRouter();
  const { mint } = router.query;
  const [loading, setLoading] = useState(true);
  const [nftData, setNftData] = useState(null);
  const [error, setError] = useState("");

  const connection = useMemo(() => new Connection(RPC_URL, FINALITY), []);

  useEffect(() => {
    if (!mint) return;
console.log("Fetching NFT for mint:", mint);

    const fetchNFT = async () => {
      try {
        setLoading(true);
        const mx = Metaplex.make(connection);
        const mintKey = new PublicKey(mint);
        const nft = await mx.nfts().findByMint({ mintAddress: mintKey });
        const meta = await fetch(nft.uri).then((r) => r.json());
        setNftData({
          name: nft.name,
          symbol: nft.symbol,
          image: meta.image,
          description: meta.description,
          uri: nft.uri,
          mint: mint,
        });
      } catch (err) {
        console.error("Failed to fetch NFT:", err);
        setError("Could not load NFT. Check the mint address or try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchNFT();
  }, [mint, connection]);

  if (loading) {
    return (
      <div style={styles.page}>
        <p style={styles.loading}>⏳ Loading token data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.page}>
        <p style={styles.error}>{error}</p>
      </div>
    );
  }

  if (!nftData) {
    return (
      <div style={styles.page}>
        <p style={styles.error}>NFT not found.</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <img
          src={nftData.image}
          alt={nftData.name}
          style={styles.image}
        />
        <h1 style={styles.title}>{nftData.name}</h1>
        <p style={styles.desc}>{nftData.description || "No description available."}</p>

        <a
          href={`https://explorer.solana.com/address/${nftData.mint}?cluster=mainnet`}
          target="_blank"
          rel="noreferrer"
          style={styles.link}
        >
          View on Solana Explorer
        </a>
      </div>

      <footer style={styles.footer}>Copyright © TKNZ FUN</footer>
    </div>
  );
}

const styles = {
  page: {
    fontFamily: "Inter, sans-serif",
    minHeight: "100vh",
    background: "#343541",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
  },
  card: {
    background: "#111",
    borderRadius: 12,
    padding: 20,
    width: 360,
    maxWidth: "90vw",
    textAlign: "center",
    boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
  },
  image: {
    width: "100%",
    borderRadius: 10,
    marginBottom: 16,
  },
  title: { fontSize: 22, fontWeight: 700, marginBottom: 8 },
  desc: { fontSize: 14, color: "#aaa", marginBottom: 12 },
  link: {
    color: "#00d1ff",
    textDecoration: "none",
    fontWeight: 600,
  },
  loading: { color: "#00d1ff", fontSize: 16 },
  error: { color: "#ff5252", fontSize: 14 },
  footer: {
    marginTop: 24,
    fontSize: 13,
    color: "#888",
  },
};
