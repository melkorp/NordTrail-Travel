import HeroSection from "@/components/hero-section";

export default function HomePage() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "NordTrail Travel",
    url: "https://nord-trail-travel.vercel.app",
    description:
      "Информационный ресурс о северных и горных путешествиях. Гиды по направлениям, сезонам и бюджетам.",
    sameAs: [
      "https://instagram.com/nordtrail",
      "https://linkedin.com/company/nordtrail",
      "https://youtube.com/@nordtrail",
      "https://twitter.com/nordtrail",
    ],
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <HeroSection />
    </>
  );
}
