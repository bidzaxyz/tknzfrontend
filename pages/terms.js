import Head from "next/head";
import Link from "next/link";
import GA from "../components/GA";
import SiteFooter from "../components/SiteFooter";

export default function TermsPage() {
  return (
    <>
      <Head>
        <title>TKNZFUN — Terms of Use</title>
        <meta
          name="description"
          content="Terms of Use outlining conditions for accessing and using the TKNZFUN Platform and tknzfun.com."
        />
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
        }}
      >
        {/* Clickable logo */}
        <Link href="/" style={{ position: "absolute", top: 16, left: 16 }}>
          <img
            src="/images/TKNZlogo.png"
            alt="TKNZFUN Logo"
            style={{
              width: 56,
              height: 56,
              borderRadius: 10,
              cursor: "pointer",
            }}
          />
        </Link>

        {/* Content box */}
        <div
          style={{
            maxWidth: 900,
            width: "90%",
            margin: "100px auto 40px",
            background: "#111",
            borderRadius: 12,
            padding: 28,
            boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
            lineHeight: 1.6,
          }}
        >
          <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 12 }}>
            Terms of Use
          </h1>
          <p style={{ color: "#aaa", marginBottom: 16 }}>
            <strong>Last Updated:</strong> 13 October 2025
          </p>

          <p style={{ color: "#ccc" }}>
            These Terms of Use (“Terms”) form a legally binding agreement
            between you (“you” or “your”) and TKNZFUN (“TKNZFUN”, “we”, “our”,
            or “us”). These Terms govern your access and use of tknzfun.com and
            related services, including the TKNZFUN Platform (collectively, the
            “Services”).
          </p>

          <p style={{ color: "#ccc", marginTop: 12 }}>
            By accessing or using the Services, you agree to these Terms. If you
            do not agree, do not use the Services.
          </p>

          <h2 style={sectionTitle}>1. Risk Warning</h2>
          <p style={sectionText}>
            TKNZFUN allows users to tokenize and mint items as NFTs on the
            Solana blockchain. These are user-generated digital assets, and
            their value may fluctuate significantly. You are solely responsible
            for understanding the risks of creating, buying, or holding NFTs or
            tokens.
          </p>
          <p style={sectionText}>
            TKNZFUN does not provide investment, financial, or legal advice and
            has no fiduciary duty to you. You are responsible for your own
            research and decisions.
          </p>

          <h2 style={sectionTitle}>2. Eligibility</h2>
          <p style={sectionText}>To use the Services, you must:</p>
          <ul style={listStyle}>
            <li>Be at least 18 years old and have full legal capacity;</li>
            <li>
              Not be a resident of a jurisdiction where using such services is
              illegal or restricted;
            </li>
            <li>Not appear on any sanctions or restricted-persons list.</li>
          </ul>
          <p style={sectionText}>
            We reserve the right to restrict or terminate access to anyone who
            violates these Terms or applicable laws.
          </p>

          <h2 style={sectionTitle}>3. Platform Use</h2>
          <p style={sectionText}>
            We provide the TKNZFUN Platform on an “as is” and “as available”
            basis. You agree not to:
          </p>
          <ul style={listStyle}>
            <li>Upload or distribute content that is unlawful, infringing, or fraudulent;</li>
            <li>Use the Services for market manipulation, scams, or misleading promotion;</li>
            <li>Interfere with platform operations or attempt unauthorized access;</li>
            <li>Create or distribute malware, phishing links, or exploit vulnerabilities.</li>
          </ul>
          <p style={sectionText}>
            Violating these conditions may result in termination or permanent
            restriction of access.
          </p>

          <h2 style={sectionTitle}>4. Fees</h2>
          <p style={sectionText}>
            TKNZFUN may charge blockchain-related fees (e.g., Solana network
            fees) or platform fees for minting or tokenization. Any applicable
            fees will be displayed before completing an action. We may adjust
            fees at any time by updating this document.
          </p>

          <h2 style={sectionTitle}>5. Transactions</h2>
          <p style={sectionText}>
            Transactions on TKNZFUN are executed via smart contracts on Solana.
            All actions you take—such as minting or transferring NFTs—are final
            once confirmed on the blockchain. TKNZFUN has no control over
            blockchain activity and cannot reverse or modify on-chain actions.
            Ensure your connected wallet holds sufficient SOL for transactions
            and fees.
          </p>

          <h2 style={sectionTitle}>6. Wallets</h2>
          <p style={sectionText}>
            You connect your Solana wallet (e.g., Phantom) to interact with the
            Platform. You are solely responsible for safeguarding your wallet,
            seed phrase, and private keys. TKNZFUN never requests private keys
            and is not liable for wallet loss, hacks, or mismanagement.
          </p>

          <h2 style={sectionTitle}>7. Intellectual Property</h2>
          <p style={sectionText}>
            All TKNZFUN branding, code, and platform design are our property.
          </p>
          <p style={sectionText}>
            Content and NFTs you create remain yours, but you grant TKNZFUN a
            non-exclusive, royalty-free license to display and distribute it for
            platform functionality and promotion.
          </p>
          <p style={sectionText}>
            You confirm that you have the right to upload or mint all content
            you use on TKNZFUN.
          </p>

          <h2 style={sectionTitle}>8. Privacy</h2>
          <p style={sectionText}>
            Our collection and use of personal data are governed by the{" "}
            <Link href="/privacy" style={{ color: "#00d1ff" }}>
              Privacy Notice
            </Link>
            . By using the Services, you acknowledge that your data may be
            processed as described there.
          </p>

          <h2 style={sectionTitle}>9. Limitation of Liability</h2>
          <p style={sectionText}>
            To the fullest extent permitted by law:
          </p>
          <ul style={listStyle}>
            <li>
              TKNZFUN is not liable for any losses, damages, or profits arising
              from your use of the Services or blockchain failures;
            </li>
            <li>
              All digital asset values are volatile and outside our control;
            </li>
            <li>
              We make no guarantees about uptime, performance, or the security
              of blockchain transactions;
            </li>
            <li>
              Our total liability, if any, shall not exceed the amount of fees
              you paid directly to TKNZFUN.
            </li>
          </ul>

          <h2 style={sectionTitle}>10. Indemnification</h2>
          <p style={sectionText}>
            You agree to indemnify and hold TKNZFUN harmless from any claims,
            damages, or liabilities arising from:
          </p>
          <ul style={listStyle}>
            <li>Your use of the Services;</li>
            <li>Your violation of these Terms or any applicable laws;</li>
            <li>
              Your creation or distribution of content or NFTs that infringe
              third-party rights.
            </li>
          </ul>

          <h2 style={sectionTitle}>11. Termination</h2>
          <p style={sectionText}>
            We may suspend or terminate access to the Platform at any time, with
            or without notice, for any reason, including suspected illegal
            activity, non-compliance, or platform abuse. Termination does not
            affect data already recorded on the blockchain.
          </p>

          <h2 style={sectionTitle}>12. Disclaimers</h2>
          <p style={sectionText}>
            The Services are experimental and provided for educational and
            creative purposes. You use the TKNZFUN Platform at your own risk. We
            do not guarantee uninterrupted operation, error-free performance, or
            future availability.
          </p>

          <h2 style={sectionTitle}>13. Governing Law and Dispute Resolution</h2>
          <p style={sectionText}>
            These Terms are governed by the laws of Georgia, unless otherwise
            required by applicable law. Any dispute shall be resolved through
            binding arbitration in Tbilisi, Georgia, conducted confidentially in
            English. You waive your right to participate in any class or
            representative action.
          </p>

          <h2 style={sectionTitle}>14. Amendments</h2>
          <p style={sectionText}>
            We may modify these Terms at any time by posting the updated version
            on tknzfun.com. Continued use after updates constitutes acceptance
            of the revised Terms.
          </p>

          <h2 style={sectionTitle}>15. Contact</h2>
          <p style={sectionText}>
            If you have questions, complaints, or feedback regarding these
            Terms, contact:
          </p>
          <p style={{ color: "#00d1ff" }}>📧 support@tknzfun.com</p>

          {/* Go Back button */}
          <div style={{ textAlign: "center", marginTop: 30 }}>
            <button
              onClick={() =>
                window.history.length > 1
                  ? window.history.back()
                  : (window.location.href = "/")
              }
              style={{
                background: "#00c2a8",
                border: "none",
                color: "#000",
                padding: "10px 18px",
                borderRadius: 8,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              ← Go Back
            </button>
          </div>
        </div>

        {/* Spacer above footer for clean layout */}
        <div style={{ height: 24 }} />
        <SiteFooter />
      </div>
    </>
  );
}

const sectionTitle = {
  fontSize: 18,
  fontWeight: 700,
  marginTop: 20,
  marginBottom: 8,
  color: "#fff",
};

const sectionText = { color: "#ccc", marginBottom: 12 };

const listStyle = {
  color: "#aaa",
  marginLeft: 20,
  marginBottom: 12,
  lineHeight: 1.6,
};
