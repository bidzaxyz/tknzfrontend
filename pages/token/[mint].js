import Head from "next/head";
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
  const [copied, setCopied] = useState(false);

  const connection = useMemo(() => new Connection(RPC_URL, FINALITY), []);

  const shorten = (str) => (str ? `${str.slice(0, 4)}...${str.slice(-4)}` : "Unknown");
  const copyToClipboard = (value) => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (!mint) return;

    const fetchNFT = async () => {
      try {
        setLoading(true);
        const mx = Metaplex.make(connection);
        const mintKey = new PublicKey(mint);
        const nft = await mx.nfts().findByMint({ mintAddress: mintKey });
        const meta = await fetch(nft.uri).then((r) => r.json());

        const sigs = await connection.getSignaturesForAddress(mintKey, { limit: 1 });
        const blockTime =
          sigs?.[0]?.blockTime
            ? new Date(sigs[0].blockTime * 1000).toLocaleString()
            : "Unknown";

        const owner = nft.updateAuthorityAddress?.toBase58() || "Unknown";
        const creators = nft.creators?.map((c) => c.address.toBase58()) || [];
        const tokenizedBy = creators[0] || owner;

        setNftData({
          name: nft.name,
          symbol: nft.symbol,
          image: meta.image,
          description: meta.description,
          uri: nft.uri,
          mint,
          owner,
          creators,
          tokenizedBy,
          createdAt: blockTime,
          isMutable: nft.isMutable,
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

  const title = nftData?.name || "TKNZ — Tokenized NFT";
  const desc = nftData?.description || "View this tokenized text NFT on Solana via TKNZ.";
  const image = nftData?.image || "https://tknzfun.com/images/ogimage.png";
  const url = `https://tknzfun.com/token/${mint || ""}`;

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={desc} />
        <meta property="og:image" content={image} />
      </Head>

      <div style={styles.page}>
        <div style={styles.card}>
          <div style={styles.headerRow}>
            <img src="/images/TKNZlogo.png" alt="TKNZ Logo" style={styles.logo} />
          </div>

          {loading && (
            <div style={styles.loaderWrap}>
              <div style={styles.spinner}></div>
              <p style={styles.loading}>Loading token data...</p>
            </div>
          )}

          {!loading && error && <p style={styles.error}>{error}</p>}

          {!loading && !error && nftData && (
            <>
              <div style={styles.contentRow}>
                {/* Image left */}
                <div style={styles.imageWrap}>
                  <img src={nftData.image} alt={nftData.name} style={styles.image} />
                </div>

                {/* Text right */}
                <div style={styles.details}>
                  <h1 style={styles.title}>{nftData.name}</h1>
                  <p style={styles.desc}>{nftData.description}</p>

                  <div style={styles.info}>
                    <InfoLine label="Mint" value={nftData.mint} shorten copy />
                    <InfoLine label="Owner" value={nftData.owner} shorten copy />
                    <InfoLine label="Tokenized by" value={nftData.tokenizedBy} shorten copy />
                    <p><strong>Created at:</strong> {nftData.createdAt}</p>
                    <p>
                      <strong>Editable:</strong>{" "}
                      {nftData.isMutable ? "Yes" : "No — Immutable"}
                    </p>
                    <div style={styles.chain}>
                      <img src="/images/solana-logo.svg" alt="Solana" style={styles.solIcon} />
                      <span>Solana</span>
                    </div>
                  </div>

                  <a
                    href={`https://explorer.solana.com/address/${nftData.mint}?cluster=mainnet`}
                    target="_blank"
                    rel="noreferrer"
                    style={styles.link}
                  >
                    View on Solana Explorer
                  </a>
                </div>
              </div>

              {/* Follow section centered below */}
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
            </>
          )}
        </div>

        {copied && <div style={styles.toast}>Address copied ✅</div>}
        <footer style={styles.footer}>Copyright © TKNZ FUN</footer>
      </div>
    </>
  );

  function InfoLine({ label, value, shorten: sh, copy }) {
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

/* ---------- Styles ---------- */
const styles = {
  page: {
    fontFamily: "Inter, sans-serif",
    background: "#343541",
    color: "#fff",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    position: "relative",
  },
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
  },
  imageWrap: { flex: "0 0 45%", display: "flex", justifyContent: "center" },
  image: {
    width: "100%",
    borderRadius: 12,
    background: "#161616",
    objectFit: "cover",
  },
  details: {
    flex: "1",
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
  info: { fontSize: 12, color: "#ccc", display: "flex", flexDirection: "column", gap: 4 },
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
  loaderWrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 10,
    padding: "24px 0",
  },
  spinner: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    border: "3px solid #222",
    borderTop: "3px solid #00d1ff",
    animation: "spin 1s linear infinite",
  },
  loading: { color: "#00d1ff", fontSize: 15 },
  error: { color: "#ff5252", fontSize: 14, textAlign: "center" },
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
  footer: {
    position: "absolute",
    bottom: 16,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 13,
    color: "#888",
  },
};

/* Spinner keyframes + responsive */
if (typeof document !== "undefined") {
  const id = "tknz-spinner-style";
  if (!document.getElementById(id)) {
    const style = document.createElement("style");
    style.id = id;
    style.innerHTML = `
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      @keyframes fadeInOut {
        0% { opacity: 0; transform: translateY(10px); }
        20% { opacity: 1; transform: translateY(0); }
        80% { opacity: 1; }
        100% { opacity: 0; transform: translateY(10px); }
      }
      @media (max-width: 700px) {
        .contentRow { flex-direction: column !important; }
      }
    `;
    document.head.appendChild(style);
  }
}
