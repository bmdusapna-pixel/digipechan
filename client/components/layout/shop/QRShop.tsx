"use client"

import { CraeteNewQRTypeTrigger } from "../qr/new-qr-type/CraeteNewQRTypeTrigger";
import QRList from "./QRList";
import useAuthStore from "@/store/authStore";
import { UserRoles } from "@/common/constants/enum";

export default function QRShop() {
    const hasAdminAccess = useAuthStore((state) => state.hasRole(UserRoles.ADMIN));

    return (
        <div className="flex w-full flex-col px-4 py-10">
            {hasAdminAccess && (
                <div className="ml-auto">
                    <CraeteNewQRTypeTrigger />
                </div>
            )}
            <div className="mt-2">
                <QRList />
            </div>
        </div>
    );
}
