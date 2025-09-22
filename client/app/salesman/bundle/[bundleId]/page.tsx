import BundleDetails from "@/components/layout/qr/salesman-dashboard/BundleDetails";

export default function Page({ params }: { params: { bundleId: string } }) {
  return <BundleDetails bundleId={params.bundleId} />;
}
