import Head from "next/head";
import Link from "next/link";
import GA from "../components/GA";
import SiteFooter from "../components/SiteFooter";

export default function PrivacyPage() {
  return (
    <>
      <Head>
        <title>TKNZFUN — Privacy Notice</title>
        <meta
          name="description"
          content="Privacy Notice explaining how TKNZFUN collects, uses, and protects data on the TKNZFUN Platform."
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
            Privacy Notice
          </h1>
          <p style={{ color: "#aaa", marginBottom: 16 }}>
            <strong>Last Updated:</strong> 13 October 2025
          </p>

          <p style={{ color: "#ccc" }}>
            This Privacy Notice describes how TKNZFUN (“we”, “our”, or “us”)
            collects, uses, and protects information in connection with the
            TKNZFUN Platform and tknzfun.com (collectively, the “Services”).
            By using the Services, you agree to this Privacy Notice.
          </p>

          <p style={{ color: "#ccc", marginTop: 12 }}>
            We may update this Notice from time to time. Any significant
            updates will be posted here, with the updated date reflected above.
            If you disagree with changes, you should discontinue using the
            Services.
          </p>

          <p style={{ color: "#ccc", marginTop: 12 }}>
            Our Services are not directed to anyone under 18. If you believe a
            minor has provided us information, please contact us at{" "}
            <a
              href="mailto:support@tknzfun.com"
              style={{ color: "#00d1ff", textDecoration: "none" }}
            >
              support@tknzfun.com
            </a>
            , and we will remove it.
          </p>

          <h2 style={sectionTitle}>1. Personal Data Controller</h2>
          <p style={sectionText}>
            TKNZFUN acts as the controller of personal data collected through
            the Services. “Personal Data” refers to any information that can
            identify an individual directly or indirectly, such as wallet
            addresses, IP addresses, or device information.
          </p>

          <h2 style={sectionTitle}>2. Data We Collect</h2>
          <p style={sectionText}>
            We may collect the following types of data when you interact with
            TKNZFUN:
          </p>
          <ul style={listStyle}>
            <li>
              Wallet information: public wallet addresses and blockchain
              transactions.
            </li>
            <li>
              Transaction data: tokenized items, NFT creations, and minting
              history.
            </li>
            <li>
              Usage data: IP address, browser type, operating system, pages
              viewed, and interactions.
            </li>
            <li>
              Analytics data: anonymized data through cookies or tools like
              Google Analytics.
            </li>
            <li>
              Voluntary data: information you provide when contacting us for
              support.
            </li>
          </ul>
          <p style={sectionText}>
            We do not request or store your private keys, seed phrases, or
            passwords.
          </p>

          <h2 style={sectionTitle}>3. Cookies and Analytics</h2>
          <p style={sectionText}>
            We use cookies and similar technologies to enable key platform
            functions, track usage, and improve performance.
          </p>
          <ul style={listStyle}>
            <li>Essential cookies: required for site functionality.</li>
            <li>
              Analytics cookies: help us understand user activity and improve
              features.
            </li>
          </ul>
          <p style={sectionText}>
            You can control or delete cookies through your browser settings,
            but some parts of the site may not function properly if disabled.
          </p>

          <h2 style={sectionTitle}>4. How We Use Personal Data</h2>
          <p style={sectionText}>We process personal data to:</p>
          <ul style={listStyle}>
            <li>Operate, maintain, and improve the TKNZFUN Platform.</li>
            <li>Facilitate NFT minting and tokenization activities.</li>
            <li>Detect and prevent fraud or abuse.</li>
            <li>Comply with legal obligations and regulatory requests.</li>
            <li>Communicate with users regarding support or updates.</li>
          </ul>
          <p style={sectionText}>We do not sell personal data to third parties.</p>

          <h2 style={sectionTitle}>5. Legal Basis for Processing (EEA/UK)</h2>
          <p style={sectionText}>
            If you are located in the European Economic Area (EEA) or the
            United Kingdom, we process your Personal Data based on one or more
            of the following legal bases:
          </p>
          <ul style={listStyle}>
            <li>
              Consent: when you voluntarily provide information or accept
              cookies.
            </li>
            <li>
              Contractual necessity: when processing is required to provide the
              Services you use.
            </li>
            <li>
              Legal obligation: where processing is necessary to comply with
              applicable laws.
            </li>
            <li>
              Legitimate interests: including securing our platform, preventing
              fraud, and improving the Services.
            </li>
          </ul>

          <h2 style={sectionTitle}>6. Blockchain Data</h2>
          <p style={sectionText}>
            NFT and tokenization transactions are permanently recorded on the
            Solana blockchain, a public and immutable ledger. This means certain
            transaction data (e.g., wallet addresses, token IDs) cannot be
            modified or deleted by us. Users should exercise caution when
            transacting on the blockchain, as it may allow third parties to
            analyze or link data.
          </p>

          <h2 style={sectionTitle}>7. Data Sharing</h2>
          <p style={sectionText}>We may share limited data with:</p>
          <ul style={listStyle}>
            <li>
              Service providers: infrastructure, analytics, and security
              partners acting under our instructions.
            </li>
            <li>
              Regulatory authorities: when required by law or legal request.
            </li>
          </ul>
          <p style={sectionText}>
            These parties are bound by confidentiality and data protection
            obligations and may process data only for the purposes described
            here.
          </p>

          <h2 style={sectionTitle}>8. International Transfers</h2>
          <p style={sectionText}>
            Your data may be processed in countries outside of your
            jurisdiction, including those that may not offer the same level of
            data protection. Where required, we use safeguards such as Standard
            Contractual Clauses (SCCs) or equivalent legal mechanisms to ensure
            adequate protection of your information.
          </p>
          <p style={sectionText}>
            By using our Services, you consent to such international transfers.
          </p>

          <h2 style={sectionTitle}>9. Data Retention</h2>
          <p style={sectionText}>
            We retain data for as long as necessary to fulfill operational,
            legal, and security purposes. Blockchain-based data may remain
            publicly accessible indefinitely. Once retention periods expire, we
            delete or anonymize data where technically feasible.
          </p>

          <h2 style={sectionTitle}>10. Data Security</h2>
          <p style={sectionText}>
            We implement reasonable technical and organizational measures to
            protect your data. However, no method of transmission or storage is
            fully secure, and you acknowledge that blockchain transactions carry
            inherent transparency risks.
          </p>

          <h2 style={sectionTitle}>11. Your Rights</h2>
          <p style={sectionText}>
            Depending on your location, you may have rights to:
          </p>
          <ul style={listStyle}>
            <li>Access or correct your personal data.</li>
            <li>Request erasure (where applicable).</li>
            <li>Object to processing or withdraw consent.</li>
            <li>Receive a copy of your data in a portable format.</li>
          </ul>
          <p style={sectionText}>
            To exercise these rights, contact us at{" "}
            <a
              href="mailto:support@tknzfun.com"
              style={{ color: "#00d1ff", textDecoration: "none" }}
            >
              support@tknzfun.com
            </a>
            . We may need to verify your identity before responding.
          </p>

          <h2 style={sectionTitle}>12. Contact Us</h2>
          <p style={sectionText}>
            If you have questions or complaints regarding this Privacy Notice or
            our data practices, contact:
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

        {/* Spacer above footer for smooth layout */}
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
