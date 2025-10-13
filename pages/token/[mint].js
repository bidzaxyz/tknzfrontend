import Head from "next/head";
import { Connection, PublicKey } from "@solana/web3.js";
import { Metaplex } from "@metaplex-foundation/js";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import GA from "../../components/GA";
import SiteFooter from "../../components/SiteFooter";
import Link from "next/link";

const RPC_URL =
  process.env.NEXT_PUBLIC_RPC_URL ||
  "https://mainnet.helius-rpc.com/?api-key=029f8e0c-9b81-4d65-885f-e5dcb52f47ea";

/* --- Server-side NFT metadata fetch for OG tags --- */
export async function getServerSideProps(context) {
  const { mint } = context.params;
  let nftData = null;

  try {
    const connection = new Connection(RPC_URL, "finalized");
    const mx = Metaplex.make(connection);
    const mintKey = new PublicKey(mint);
    const nft = await mx.nfts().findByMint({ mintAddress: mintKey });
    const meta = await fetch(nft.uri).then((r) => r.json());

    nftData = {
      name: nft.name,
      description: meta.description,
      image: meta.image,
      mint,
      tokenizedVia:
        meta?.attributes?.find((a) => a.trait_type === "Tokenized via")?.value ||
        "TKNZFUN",
    };
  } catch (err) {
    console.error("Metadata fetch failed:", err);
  }

  return { props: { nftData } };
}

export default function TokenPage({ nftData }) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [fullData, setFullData] = useState(nftData);

  const connection = useMemo(() => new Connection(RPC_URL, "finalized"), []);

  /* --- Client-side enrichment for extra fields --- */
  useEffect(() => {
    const fetchExtras = async () => {
      if (!nftData?.mint) return;
      try {
        const mx = Metaplex.make(connection);
        const mintKey = new PublicKey(nftData.mint);
        const nft = await mx.nfts().findByMint({ mintAddress: mintKey });
        const sigs = await connection.getSignaturesForAddress(mintKey, {
          limit: 1,
        });
        const blockTime =
          sigs?.[0]?.blockTime
            ? new Date(sigs[0].blockTime * 1000).toLocaleString()
            : "Unknown";

        const owner = nft.updateAuthorityAddress?.toBase58() || "Unknown";
        const creators = nft.creators?.map((c) => c.address.toBase58()) || [];

        setFullData({
          ...nftData,
          owner,
          creators,
          tokenizedBy: creators[0] || owner,
          createdAt: blockTime,
          isMutable: nft.isMutable,
        });
      } catch (e) {
        console.error("Failed to enrich NFT:", e);
      }
    };
    fetchExtras();
  }, [nftData, connection]);

  /* --- Helpers --- */
  const shorten = (str) =>
    str ? `${str.slice(0, 4)}...${str.slice(-4)}` : "Unknown";
  const copyToClipboard = (value) => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /* --- Metadata for OG / Twitter --- */
  const title = fullData?.name || "TKNZFUN — Tokenized NFT";
  const desc =
    fullData?.description ||
    "View this tokenized text NFT on Solana via TKNZFUN.";
  const image = fullData?.image || "https://tknzfun.com/images/ogimage.png";
  const url = `https://tknzfun.com/token/${fullData?.mint || ""}`;

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={desc} />

        {/* Open Graph Meta */}
        <meta property="og:type" content="article" />
        <meta property="og:url" content={url} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={desc} />
        <meta property="og:image" content={image} />
        <meta property="og:site_name" content="TKNZFUN" />

        {/* Twitter Card Meta */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@tknzfuncom" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={desc} />
        <meta name="twitter:image" content={image} />

        <link rel="canonical" href={url} />
      </Head>

      <GA />

      <div
        style={{
          fontFamily: "Inter, sans-serif",
          background: "#343541",
          color: "#fff",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          paddingTop: 60,
        }}
      >
        <div style={styles.card}>
          <div style={styles.headerRow}>
            <Link href="/" style={{ display: "inline-block" }}>
              <img
                src="/images/TKNZlogo.png"
                alt="TKNZFUN Logo"
                style={{ ...styles.logo, cursor: "pointer" }}
              />
            </Link>
          </div>
          {!fullData ? (
            <p style={styles.loading}>⏳ Loading token data...</p>

          ) : (
            <div style={styles.contentRow}>
              <img
                src={fullData.image}
                alt={fullData.name}
                style={styles.image}
              />
              <div style={styles.details}>
                <h1 style={styles.title}>{fullData.name}</h1>
                <p style={styles.desc}>{fullData.description}</p>

                <div style={styles.info}>
                  <Info label="Mint" value={fullData.mint} copy shorten />
                  <Info label="Owner" value={fullData.owner} copy shorten />
                  <Info
                    label="Tokenized by"
                    value={fullData.tokenizedBy}
                    copy
                    shorten
                  />
                  <p>
                    <strong>Tokenized via:</strong> {fullData.tokenizedVia}
                  </p>
                  <p>
                    <strong>Created at:</strong> {fullData.createdAt}
                  </p>
                  <p>
                    <strong>Editable:</strong>{" "}
                    {fullData.isMutable ? "Yes" : "No — Immutable"}
                  </p>
                  <div style={styles.chain}>
                    <img
                      src="/images/solana-logo.svg"
                      alt="Solana"
                      style={styles.solIcon}
                    />
                    <span>Solana</span>
                  </div>
                </div>

                <a
                  href={`https://explorer.solana.com/address/${fullData.mint}?cluster=mainnet`}
                  target="_blank"
                  rel="noreferrer"
                  style={styles.link}
                >
                  View on Solana Explorer
                </a>

                <div style={styles.shareRow}>
                  <button
                    onClick={() => copyToClipboard(window.location.href)}
                    style={styles.shareBtn}
                  >
                    📋 Copy Link
                  </button>
                  <a
                    href={`https://x.com/intent/tweet?text=${encodeURIComponent(
                      url
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    style={styles.shareBtn}
                  >
                    🐦 Share on X
                  </a>
                </div>
              </div>
            </div>
          )}

          <a
            href="https://x.com/tknzfuncom"
            target="_blank"
            rel="noreferrer"
            style={styles.follow}
          >
            <img
              src="/images/twitter.svg"
              alt="Twitter"
              style={{ width: 18, height: 18 }}
            />
            <span>Follow @tknzfuncom</span>
          </a>
        </div>

        {copied && <div style={styles.toast}>Link copied ✅</div>}

        {/* ✅ Footer section matching layout */}
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

  function Info({ label, value, shorten: sh, copy }) {
    const short = sh ? shorten(value) : value;
    return (
      <div style={styles.infoLine}>
        <strong>{label}:</strong> <span>{short}</span>
        {copy && (
          <button
            onClick={() => copyToClipboard(value)}
            style={styles.copyBtn}
            title="Copy full address"
          >
            📋
          </button>
        )}
      </div>
    );
  }
}

/* --- Styles --- */
const styles = {
  card: {
    background: "#111",
    borderRadius: 12,
    padding: 24,
    width: 760,
    maxWidth: "95vw",
    boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  headerRow: { width: "100%", display: "flex", justifyContent: "flex-start" },
  logo: { width: 56, height: 56, borderRadius: 10, marginBottom: 10 },
  contentRow: {
    display: "flex",
    flexDirection: "row",
    gap: 24,
    width: "100%",
    alignItems: "flex-start",
    flexWrap: "wrap",
  },
  image: {
    width: "45%",
    borderRadius: 12,
    background: "#161616",
    objectFit: "cover",
  },
  details: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    textAlign: "left",
  },
  title: { fontSize: 22, fontWeight: 700, marginBottom: 8 },
  desc: {
    fontSize: 14,
    color: "#aaa",
    lineHeight: 1.4,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    marginBottom: 12,
  },
  info: {
    fontSize: 12,
    color: "#ccc",
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  infoLine: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    wordBreak: "break-all",
  },
  copyBtn: {
    background: "none",
    border: "none",
    color: "#00d1ff",
    cursor: "pointer",
    fontSize: 12,
    padding: 0,
  },
  chain: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
    color: "#8bdcff",
  },
  solIcon: { width: 14, height: 14 },
  link: {
    color: "#00d1ff",
    textDecoration: "none",
    fontWeight: 600,
    marginTop: 12,
    fontSize: 13,
  },
  shareRow: { display: "flex", justifyContent: "center", gap: 10, marginTop: 12 },
  shareBtn: {
    background: "#1a1a1a",
    color: "#00d1ff",
    border: "1px solid #00d1ff",
    borderRadius: 8,
    padding: "6px 12px",
    fontSize: 13,
    cursor: "pointer",
    textDecoration: "none",
    fontWeight: 600,
  },
  follow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    color: "#1DA1F2",
    marginTop: 24,
    textDecoration: "none",
    fontSize: 14,
  },
  toast: {
    position: "fixed",
    bottom: 80,
    background: "#00c2a8",
    color: "#0b0b0b",
    padding: "8px 16px",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    animation: "fadeInOut 2s ease",
  },
};
