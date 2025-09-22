import { SITE_MAP } from "@/common/constants/siteMap";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CraeteNewQRTypeTrigger() {
    return (
        <Link href={SITE_MAP.QR_TYPE_CREATE}>
            <Button variant={"outline"} className="w-full justify-center">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add QR
            </Button>
        </Link>
    );
}