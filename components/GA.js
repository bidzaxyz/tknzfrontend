// components/GA.js
import Script from "next/script";

export default function GA() {
  return (
    <>
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-2GPFP7E7CP"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-2GPFP7E7CP');
        `}
      </Script>
    </>
  );
}
