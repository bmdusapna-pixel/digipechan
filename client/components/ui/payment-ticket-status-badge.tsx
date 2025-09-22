import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, XCircle } from "lucide-react";

interface PaymentTicketStatusBadgeProps {
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  className?: string;
}

export function PaymentTicketStatusBadge({ status, className }: PaymentTicketStatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'PENDING':
        return {
          variant: 'secondary' as const,
          icon: Clock,
          text: 'Pending',
          className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
        };
      case 'APPROVED':
        return {
          variant: 'default' as const,
          icon: CheckCircle,
          text: 'Approved',
          className: 'bg-green-100 text-green-800 hover:bg-green-100'
        };
      case 'REJECTED':
        return {
          variant: 'destructive' as const,
          icon: XCircle,
          text: 'Rejected',
          className: 'bg-red-100 text-red-800 hover:bg-red-100'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <Badge 
      variant={config.variant} 
      className={`${config.className} ${className || ''}`}
    >
      <Icon className="w-3 h-3 mr-1" />
      {config.text}
    </Badge>
  );
}
