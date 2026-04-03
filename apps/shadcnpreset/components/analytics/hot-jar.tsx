"use client";
import Script from "next/script";
import { siteMetadata } from "@/data/site-meta-data";

export function HotJar() {
  const { analytics } = siteMetadata;

  if (
    process.env.NODE_ENV !== "production" ||
    !analytics.hotjarId ||
    !analytics.hotjarVersion
  ) {
    return null;
  }

  return (
    <Script id="hotjar">
      {`
        (function(h,o,t,j,a,r){
          h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
          h._hjSettings={hjid:${analytics.hotjarId},hjsv:${analytics.hotjarVersion}};
          a=o.getElementsByTagName('head')[0];
          r=o.createElement('script');r.async=1;
          r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
          a.appendChild(r);
        })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
      `}
    </Script>
  );
}
