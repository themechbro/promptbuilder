import {
  absoluteUrl,
  creatorAlias,
  creatorGithub,
  creatorLinkedIn,
  creatorName,
  creatorUrl,
  defaultDescription,
  repositoryUrl,
  siteName,
  siteShortName,
} from "../lib/seo";

export default function JsonLd() {
  const rootUrl = absoluteUrl("/");

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `${rootUrl}#creator`,
        name: creatorName,
        alternateName: creatorAlias,
        url: creatorUrl,
        sameAs: [creatorUrl, creatorGithub, creatorLinkedIn],
      },
      {
        "@type": "WebSite",
        "@id": `${rootUrl}#website`,
        name: siteName,
        alternateName: siteShortName,
        url: rootUrl,
        description: defaultDescription,
        publisher: {
          "@id": `${rootUrl}#creator`,
        },
        inLanguage: "en-US",
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${rootUrl}#app`,
        name: siteName,
        url: rootUrl,
        description: defaultDescription,
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Web",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        creator: {
          "@id": `${rootUrl}#creator`,
        },
        codeRepository: repositoryUrl,
        license: "https://opensource.org/licenses/MIT",
        keywords: [
          "prompt engineering",
          "prompt builder",
          "AI tools",
          "MCP server",
          "Claude Desktop",
          "prompt chaining",
          "LLM tools",
        ],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
