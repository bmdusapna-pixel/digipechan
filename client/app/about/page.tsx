import { FeaturesSection } from "@/components/layout/about/FeaturesSection";
import { MissionSection } from "@/components/layout/about/MissionSection";
import { ResellerTermsSection } from "@/components/layout/about/ResellerTermsSection";
import { TermsAndConditionsSection } from "@/components/layout/about/TermsAndConditionsSection";

export default function AboutUsPage() {
  return (
    <main>
      <MissionSection />
      <FeaturesSection />
      <ResellerTermsSection />
      <TermsAndConditionsSection />
    </main>
  );
}
