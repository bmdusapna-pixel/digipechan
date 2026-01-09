import FeatureTabs from "@/components/custom-componets/FeatureTabs";
import { FeaturesSection } from "@/components/layout/about/FeaturesSection";

export default function FeaturesPage() {
  return (
    <main className="min-h-screen pt-24">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Our Features</h1>
          <p className="text-lg text-muted-foreground">
            Discover the powerful features that make DigiPehchan the smart choice for vehicle and pet identification
          </p>
        </div>
        <FeatureTabs />
        <FeaturesSection />
      </div>
    </main>
  );
}


