"use client";

import { useRouter } from "next/navigation";
import { Ship, Tag } from "lucide-react";
import { QRType, qrTypeMapping } from "@/types/qr";
import { SITE_MAP } from "@/common/constants/siteMap";

export const qrTypes = [
    {
        type: QRType.OFFLINE_SHIP,
        cardStyles: "bg-gradient-to-r from-[var(--chart-1)] to-[var(--primary)] text-primary-foreground", 
        icon: Ship,
        description: "Use this QR for offline shipping purposes.",
    },
    {
        type: QRType.E_TAG,
        cardStyles: "bg-gradient-to-r from-[var(--chart-2)] to-[var(--accent)] text-primary-foreground", 
        icon: Tag,
        description: "Use this QR for electronic tagging.",
    },
];

export function QRSelectionCards() {
    const router = useRouter();

    const handleSelectQRType = (qrType: QRType) => {
        router.push(SITE_MAP.QR_GENERATE_TYPE(qrType));
    };

    return (
        <div className="flex flex-row flex-wrap items-center justify-center gap-4 px-10">
            {qrTypes.map(({ type, cardStyles, icon: Icon, description }) => (
                <div key={type} onClick={() => handleSelectQRType(type)}>
                    <QRSelectionCard type={type} cardStyles={cardStyles} icon={Icon} description={description} />
                </div>
            ))}
        </div>
    );
}

export function QRSelectionCard({
    type,
    cardStyles,
    icon: Icon,
    description,
}: {
    type: QRType;
    cardStyles: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    description: string;
}) {
    return (
        <div
            className={`relative ${cardStyles} cursor-pointer rounded-2xl p-[2px] backdrop-blur-sm transition-all hover:shadow-lg`}
        >
            <div className="bg-card/90 flex h-full flex-col items-center rounded-2xl border border-[var(--border)]/20 p-4 text-center backdrop-blur-md md:p-8">
                <div className={`mb-8 ${cardStyles} text-primary-foreground rounded-2xl p-5 shadow-lg`}>
                    <Icon className="size-6 md:size-10" />
                </div>
                <h3 className="text-card-foreground mb-4 text-xl font-bold md:text-2xl">{qrTypeMapping[type]}</h3>
                <p className="text-md text-muted-foreground md:text-lg">{description}</p>
            </div>
        </div>
    );
}
