"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Home, ShoppingBag, QrCode, ShoppingCart, ScanQrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useMenuStore } from "@/store/menuStore";
import { SITE_MAP } from "@/common/constants/siteMap";
import useAuthStore from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";

const MENU_ITEMS = [
    { label: "Home", icon: Home, path: SITE_MAP.HOME },
    { label: "Shop", icon: ShoppingBag, path: SITE_MAP.SHOP },
    { label: "Scan", icon: QrCode, path: SITE_MAP.SCAN },
    { label: "Cart", icon: ShoppingCart, path: SITE_MAP.CART },
    { label: "Check", icon: ScanQrCode, path: SITE_MAP.CHECK_VALIDITY },
];

export default function MobileBottomNavigation() {
    const { items } = useCartStore();
    const cartItemCount = items.reduce((total, item) => total + item.quantity, 0);

    const router = useRouter();
    const pathname = usePathname();
    const { menuActiveItem, setMenuActiveItem } = useMenuStore();
    const [isMobile, setIsMobile] = useState(false);
    const { isAuthenticated } = useAuthStore();

    useEffect(() => {
        const getActiveMenuItem = (currentPath: string) => {
            if (currentPath === SITE_MAP.HOME) {
                return MENU_ITEMS.find(item => item.label === "Home");
            }
            
            const sortedItems = [...MENU_ITEMS]
                .filter(item => item.path !== SITE_MAP.HOME) 
                .sort((a, b) => b.path.length - a.path.length);
            
            let matchedItem = sortedItems.find(item => currentPath === item.path);
            
            if (!matchedItem) {
                matchedItem = sortedItems.find(item => 
                    currentPath.startsWith(item.path) && item.path !== "/"
                );
            }
            
            return matchedItem;
        };

        const activeItem = getActiveMenuItem(pathname);
        if (activeItem) {
            setMenuActiveItem(activeItem.label);
        } else {
            setMenuActiveItem("");
        }
    }, [pathname, setMenuActiveItem]);
    
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 1025);
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const handleClick = (label: string, path: string) => {
        setMenuActiveItem(label); 
        router.push(path);
    };

    if (!isMobile) return null;

    return (
        isAuthenticated && (
            <div className="bg-background safe-area-pb fixed right-0 bottom-0 left-0 z-50 border-t px-4 py-2 shadow-md">
                <div className="mx-auto flex max-w-md items-center justify-around">
                    {MENU_ITEMS.map((item) => {
                        const isScan = item.label === "Scan";
                        const isCart = item.label === "Cart";
                        const isActive = menuActiveItem === item.label;

                        return (
                            <Button
                                key={item.label}
                                variant="ghost"
                                size="sm"
                                onClick={() => handleClick(item.label, item.path)}
                                className={cn(
                                    "relative flex h-auto min-w-0 flex-col items-center justify-center gap-1 px-1 py-2 hover:bg-transparent hover:text-primary",
                                    isActive ? "text-primary" : "text-muted-foreground",
                                    isScan && "bg-primary size-12 -translate-y-1 rounded-full text-white shadow-lg"
                                )}
                            >
                                <item.icon
                                    className={cn(
                                        "size-5 transition-colors",
                                        isScan ? "size-6" : isActive ? "text-primary" : "text-muted-foreground"
                                    )}
                                />

                                {isCart && cartItemCount > 0 && (
                                    <div className="absolute right-1.5 top-0.5 z-10 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                                        {cartItemCount}
                                    </div>
                                )}

                                {!isScan && <span className="truncate text-xs font-medium">{item.label}</span>}
                            </Button>
                        );
                    })}
                </div>
            </div>
        )
    );
}