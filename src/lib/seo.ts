/**
 * SUPERCHARGED SEO & AI CRAWLER ENGINE FOR STRING PLATFORM
 * Automatically generates high-fidelity JSON-LD Structured Data,
 * Meta tags, Open Graph, and Twitter Cards to maximize Search Engine
 * and AI Web Crawler visibility (Google, Bing, GPTBot, ClaudeBot, Perplexity).
 */

interface SEOProductPayload {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  businessName: string;
  category?: string;
  inStock?: boolean;
}

interface SEOMarketplacePayload {
  companyName: string;
  address?: string;
  rating?: number;
  phone?: string;
  imageUrl?: string;
  category?: string;
}

/**
 * Injects a highly structured Product JSON-LD block into document head.
 * Feeds search engines with precise catalog details to trigger "Google Merchant" rich snippets.
 */
export function injectProductSchema(product: SEOProductPayload) {
  if (typeof window === "undefined") return;

  // Remove any pre-existing product schema script
  const existingScript = document.getElementById("string-seo-product-schema");
  if (existingScript) {
    existingScript.remove();
  }

  const schema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "image": product.imageUrl || "https://string-marketplace.vercel.app/string-logo.png",
    "description": product.description || `Buy ${product.name} on String - The premium local marketplace.`,
    "sku": product.id.slice(0, 8).toUpperCase(),
    "mpn": product.id,
    "brand": {
      "@type": "Brand",
      "name": product.businessName || "String Platform"
    },
    "offers": {
      "@type": "Offer",
      "url": window.location.href,
      "priceCurrency": "NGN",
      "price": product.price || 0,
      "priceValidUntil": new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      "itemCondition": "https://schema.org/NewCondition",
      "availability": product.inStock !== false ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "LocalBusiness",
        "name": product.businessName || "String Merchant"
      }
    }
  };

  const script = document.createElement("script");
  script.id = "string-seo-product-schema";
  script.type = "application/ld+json";
  script.innerHTML = JSON.stringify(schema);
  document.head.appendChild(script);
}

/**
 * Injects a LocalBusiness directory structured schema for the marketplace merchants directory.
 */
export function injectMarketplaceDirectorySchema(businesses: SEOMarketplacePayload[]) {
  if (typeof window === "undefined" || !businesses || businesses.length === 0) return;

  const existingScript = document.getElementById("string-seo-directory-schema");
  if (existingScript) {
    existingScript.remove();
  }

  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "numberOfItems": businesses.length,
    "itemListElement": businesses.map((biz, idx) => ({
      "@type": "ListItem",
      "position": idx + 1,
      "item": {
        "@type": "LocalBusiness",
        "name": biz.companyName,
        "image": biz.imageUrl || "https://string-marketplace.vercel.app/string-logo.png",
        "telephone": biz.phone || "+2340000000",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": biz.address || "Lagos, Nigeria",
          "addressLocality": "Lagos",
          "addressCountry": "NG"
        },
        "aggregateRating": biz.rating ? {
          "@type": "AggregateRating",
          "ratingValue": biz.rating,
          "bestRating": "5",
          "worstRating": "1",
          "ratingCount": "12"
        } : undefined
      }
    }))
  };

  const script = document.createElement("script");
  script.id = "string-seo-directory-schema";
  script.type = "application/ld+json";
  script.innerHTML = JSON.stringify(schema);
  document.head.appendChild(script);
}

/**
 * Supercharges page metadata (Keywords, Open Graph, Twitter Cards, robots guidelines) dynamically.
 */
export function updateMetaTags(
  title: string, 
  description: string, 
  keywords: string = "marketplace, string, ecommerce, lagos, buy local, custom goods, services, escrow, nigeria", 
  imageUrl: string = "https://string-marketplace.vercel.app/string-logo.png"
) {
  if (typeof window === "undefined") return;

  // 1. Update Title
  document.title = `${title} | String - High-Trust Escrow Marketplace`;

  // Helper to upsert meta tags
  const setMeta = (nameOrProperty: string, value: string, isProperty = false) => {
    let el = isProperty 
      ? document.querySelector(`meta[property="${nameOrProperty}"]`)
      : document.querySelector(`meta[name="${nameOrProperty}"]`);
      
    if (!el) {
      el = document.createElement("meta");
      if (isProperty) {
        el.setAttribute("property", nameOrProperty);
      } else {
        el.setAttribute("name", nameOrProperty);
      }
      document.head.appendChild(el);
    }
    el.setAttribute("content", value);
  };

  // 2. Standard Search Meta Tags
  setMeta("description", description);
  setMeta("keywords", keywords);
  setMeta("robots", "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1");
  setMeta("author", "String Platform");

  // 3. Open Graph (Facebook / LinkedIn / AI crawlers previews)
  setMeta("og:title", `${title} | String Marketplace`, true);
  setMeta("og:description", description, true);
  setMeta("og:image", imageUrl, true);
  setMeta("og:url", window.location.href, true);
  setMeta("og:type", "website", true);
  setMeta("og:site_name", "String", true);

  // 4. Twitter Cards
  setMeta("twitter:card", "summary_large_image");
  setMeta("twitter:title", `${title} | String Marketplace`);
  setMeta("twitter:description", description);
  setMeta("twitter:image", imageUrl);

  // 5. Canonical Link
  let canonical = document.querySelector("link[rel='canonical']");
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.setAttribute("rel", "canonical");
    document.head.appendChild(canonical);
  }
  canonical.setAttribute("href", window.location.href);
}
