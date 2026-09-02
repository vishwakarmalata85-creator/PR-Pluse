/**
 * MIRO PRICING DATA & 4-TIER FEATURE MATRIX
 * Compliant with DESIGN.md specifications
 */

export const PRICING_TIERS = [
  {
    id: "free",
    name: "Free",
    tagline: "For small teams and individuals getting started with visual collaboration.",
    priceMonthly: 0,
    priceAnnually: 0,
    period: "forever",
    buttonText: "Sign up free",
    buttonClass: "button-primary",
    highlight: false,
    enterpriseDark: false,
    keyFeatures: [
      "3 editable boards",
      "Premade template library (2,500+ templates)",
      "Core integrations (Slack, Zoom, MS Teams)",
      "Basic visual shapes, sticky notes & voting"
    ]
  },
  {
    id: "starter",
    name: "Starter",
    tagline: "For teams that need unlimited boards and full visual toolkits.",
    priceMonthly: 10,
    priceAnnually: 8,
    period: "per member / month",
    buttonText: "Start 14-day trial",
    buttonClass: "button-primary",
    highlight: false,
    enterpriseDark: false,
    keyFeatures: [
      "Unlimited editable boards",
      "Unlimited external board viewers & commenters",
      "Custom board templates",
      "High-res board export (PDF, PNG)",
      "Version history & board recovery"
    ]
  },
  {
    id: "business",
    name: "Business",
    tagline: "For fast-moving organizations requiring advanced AI, diagramming & security.",
    priceMonthly: 20,
    priceAnnually: 16,
    period: "per member / month",
    buttonText: "Start 14-day trial",
    buttonClass: "button-blue",
    highlight: true, // Featured lavender surface + blue border
    badgeTag: "MOST POPULAR",
    enterpriseDark: false,
    keyFeatures: [
      "Everything in Starter, plus:",
      "Miro AI Workflows & generative board synthesis",
      "Advanced diagramming (UML, BPMN 2.0, AWS/Azure icons)",
      "Single Sign-On (SSO / SAML 2.0 with Okta, Azure AD)",
      "Unlimited external Guests with full edit access"
    ]
  },
  {
    id: "enterprise",
    name: "Enterprise",
    tagline: "For global enterprises demanding enterprise-grade governance and compliance.",
    priceMonthly: "Custom",
    priceAnnually: "Custom",
    period: "custom volume pricing",
    buttonText: "Contact Sales",
    buttonClass: "button-on-dark",
    highlight: false,
    enterpriseDark: true, // Dark tier
    keyFeatures: [
      "Everything in Business, plus:",
      "Dedicated Enterprise Account Manager & 24/7 SLA",
      "Data Residency (US, EU, AP) & HIPAA / SOC2 Type II compliance",
      "Centralized Admin Hub & automated SCIM user provisioning",
      "Enterprise developer API & custom connector ecosystem"
    ]
  }
];

export const COMPARISON_SECTIONS = [
  {
    category: "Canvas & Boards",
    features: [
      { name: "Editable Boards", free: "3 boards", starter: "Unlimited", business: "Unlimited", enterprise: "Unlimited" },
      { name: "Pre-built Templates", free: "2,500+", starter: "2,500+", business: "2,500+ & Custom", enterprise: "2,500+ & Custom" },
      { name: "High-Resolution Export", free: "Standard PNG", starter: "High-res PDF & Vector", business: "High-res PDF & Vector", enterprise: "Full Data Export" },
      { name: "Infinite Canvas & Pan/Zoom", free: "✓", starter: "✓", business: "✓", enterprise: "✓" }
    ]
  },
  {
    category: "AI & Smart Diagramming",
    features: [
      { name: "Miro AI Copilot", free: "Limited credits", starter: "Standard access", business: "Unlimited Generative AI", enterprise: "Unlimited Enterprise AI" },
      { name: "Automated Workflow Synthesis", free: "—", starter: "—", business: "✓", enterprise: "✓" },
      { name: "Smart Diagramming Packs (AWS, Azure, UML)", free: "Basic", starter: "Standard", business: "Full Advanced Pack", enterprise: "Full Advanced Pack" },
      { name: "Mind Maps & Auto-Layout", free: "✓", starter: "✓", business: "✓", enterprise: "✓" }
    ]
  },
  {
    category: "Collaboration & External Sharing",
    features: [
      { name: "External Viewers & Commenters", free: "Limited", starter: "Unlimited", business: "Unlimited", enterprise: "Unlimited" },
      { name: "External Guests with Edit Rights", free: "—", starter: "Pay per seat", business: "Unlimited Free Guests", enterprise: "Unlimited Free Guests" },
      { name: "Interactive Voting & Timer Tool", free: "—", starter: "✓", business: "✓", enterprise: "✓" },
      { name: "Live Video & TalkTracks", free: "—", starter: "✓", business: "✓", enterprise: "✓" }
    ]
  },
  {
    category: "Security, Governance & Support",
    features: [
      { name: "SAML 2.0 Single Sign-On (SSO)", free: "—", starter: "—", business: "✓ (Okta, Azure, Google)", enterprise: "✓ Full IdP Integration" },
      { name: "SCIM Automated User Provisioning", free: "—", starter: "—", business: "—", enterprise: "✓" },
      { name: "SOC 2 Type II & HIPAA Compliance", free: "—", starter: "—", business: "SOC 2", enterprise: "SOC 2, HIPAA, ISO 27001" },
      { name: "Dedicated 24/7 SLA & CSM", free: "Community", starter: "Standard Support", business: "Priority Support", enterprise: "Dedicated CSM & 99.9% SLA" }
    ]
  }
];
