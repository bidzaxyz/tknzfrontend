/* eslint-disable @next/next/no-html-link-for-pages */
import Link from "next/link";

export default function SiteFooter() {
  const styles = {
    wrap: {
      width: "100%",
      background: "transparent",
      color: "#888",
    },
    inner: {
      maxWidth: 980,
      margin: "0 auto",
      padding: "12px 16px",
      display: "grid",
      gridTemplateColumns: "1fr auto 1fr",
      alignItems: "center",
      gap: 8,
    },
    left: {
      justifySelf: "start",
      fontSize: 13,
      whiteSpace: "nowrap",
    },
    center: {
      justifySelf: "center",
      display: "flex",
      gap: 16,
      fontSize: 13,
    },
    link: {
      color: "inherit",
      textDecoration: "none",
      cursor: "pointer",
    },
    right: {
      justifySelf: "end",
      // reserved (empty) to balance the grid visually
    },
  };

  return (
    <footer style={styles.wrap}>
      <div style={styles.inner}>
        <div style={styles.left}>Copyright © TKNZ FUN</div>
        <nav style={styles.center}>
          <Link href="/privacy" style={styles.link}>
            <span className="footer-link">Privacy Policy</span>
          </Link>
          <Link href="/terms" style={styles.link}>
            <span className="footer-link">Terms of Use</span>
          </Link>
        </nav>
        <div style={styles.right} />
      </div>

      {/* hover underline only */}
      <style jsx>{`
        .footer-link:hover {
          text-decoration: underline;
        }
      `}</style>
    </footer>
  );
}
