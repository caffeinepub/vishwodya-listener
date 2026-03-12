import { useEffect } from "react";

interface SEOProps {
  title: string;
  description?: string;
  canonical?: string;
}

export function useSEO({ title, description, canonical }: SEOProps) {
  useEffect(() => {
    // Title
    document.title = title;

    // Description
    if (description) {
      let descTag = document.querySelector<HTMLMetaElement>(
        "meta[name='description']",
      );
      if (descTag) descTag.setAttribute("content", description);

      // OG
      let ogDesc = document.querySelector<HTMLMetaElement>(
        "meta[property='og:description']",
      );
      if (ogDesc) ogDesc.setAttribute("content", description);

      let twitterDesc = document.querySelector<HTMLMetaElement>(
        "meta[name='twitter:description']",
      );
      if (twitterDesc) twitterDesc.setAttribute("content", description);
    }

    // OG title
    let ogTitle = document.querySelector<HTMLMetaElement>(
      "meta[property='og:title']",
    );
    if (ogTitle) ogTitle.setAttribute("content", title);

    let twitterTitle = document.querySelector<HTMLMetaElement>(
      "meta[name='twitter:title']",
    );
    if (twitterTitle) twitterTitle.setAttribute("content", title);

    // Canonical
    if (canonical) {
      let canonicalTag = document.querySelector<HTMLLinkElement>(
        "link[rel='canonical']",
      );
      if (canonicalTag) canonicalTag.setAttribute("href", canonical);
    }
  }, [title, description, canonical]);
}
