import { Badge } from "@/components/ui/badge";
import {
    CheckCircle,
    XCircle,
    Clock,
    Truck,
    PackageCheck,
    Loader,
    QrCode,
    AlertTriangle,
    Circle,
    PackagePlus,
    Send,
    Layers3,
} from "lucide-react";

export enum QRStatus {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
}

export enum PaymentTransactionStatus {
    INITIATED = "INITIATED",
    PAID = "PAID",
    FAILED = "FAILED",
    SUCCESS = "SUCCESS",
}

export enum OrderStatus {
    SHIPPED = "SHIPPED",
    DELIVERED = "DELIVERED",
    DISPATCHED = "DISPATCHED",
}

export enum DeliveryType {
    ETAG = "ETAG",
    PHYSICAL_SHIP = "PHYSICAL_SHIP",
}

type StatusType = "qr" | "payment" | "order" | "delivery";

export const StatusBadge = ({
    status,
    type,
}: {
    status: PaymentTransactionStatus | OrderStatus | QRStatus | DeliveryType;
    type: StatusType;
}) => {
    const getVariant = () => {
        switch (type) {
            case "qr":
                switch (status) {
                    case QRStatus.ACTIVE:
                        return {
                            color: "bg-emerald-100 text-emerald-800 border-emerald-200",
                            icon: <QrCode className="mr-1 h-4 w-4" />,
                        };
                    case QRStatus.INACTIVE:
                        return {
                            color: "bg-gray-100 text-gray-800 border-gray-200",
                            icon: <XCircle className="mr-1 h-4 w-4" />,
                        };
                }
                break;

            case "order":
                switch (status) {
                    case OrderStatus.DELIVERED:
                        return {
                            color: "bg-green-100 text-green-800 border-green-200",
                            icon: <PackageCheck className="mr-1 h-4 w-4" />,
                        };
                    case OrderStatus.SHIPPED:
                        return {
                            color: "bg-blue-100 text-blue-800 border-blue-200",
                            icon: <Truck className="mr-1 h-4 w-4" />,
                        };
                    case OrderStatus.DISPATCHED:
                        return {
                            color: "bg-purple-100 text-purple-800 border-purple-200",
                            icon: <Loader className="mr-1 h-4 w-4 animate-spin" />,
                        };
                }
                break;

            case "payment":
                switch (status) {
                    case PaymentTransactionStatus.PAID:
                    case PaymentTransactionStatus.SUCCESS:
                        return {
                            color: "bg-emerald-100 text-emerald-800 border-emerald-200",
                            icon: <CheckCircle className="mr-1 h-4 w-4" />,
                        };
                    case PaymentTransactionStatus.INITIATED:
                        return {
                            color: "bg-yellow-100 text-yellow-800 border-yellow-200",
                            icon: <Clock className="mr-1 h-4 w-4" />,
                        };
                    case PaymentTransactionStatus.FAILED:
                        return {
                            color: "bg-red-100 text-red-800 border-red-200",
                            icon: <AlertTriangle className="mr-1 h-4 w-4" />,
                        };
                }
                break;

            case "delivery":
                switch (status) {
                    case DeliveryType.ETAG:
                        return {
                            color: "bg-cyan-100 text-cyan-800 border-cyan-200",
                            icon: <Send className="mr-1 h-4 w-4" />,
                        };
                    case DeliveryType.PHYSICAL_SHIP:
                        return {
                            color: "bg-orange-100 text-orange-800 border-orange-200",
                            icon: <PackagePlus className="mr-1 h-4 w-4" />,
                        };

                }
                break;
        }

        return {
            color: "bg-muted text-muted-foreground border-muted",
            icon: <Circle className="mr-1 h-4 w-4" />,
        };
    };

    const { color, icon } = getVariant();

    return (
        <Badge className={`${color} inline-flex items-center border px-2 py-1 text-xs font-medium`}>
            {icon}
            <span>{status}</span>
        </Badge>
    );
};
