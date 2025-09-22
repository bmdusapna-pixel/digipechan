export const encode = (data: string): string => {
    try {
        const base64 = btoa(unescape(encodeURIComponent(data)));
        return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    } catch (error) {
        console.error("Encoding failed:", error);
        return "";
    }
};

export const decode = (encoded: string): string => {
    try {
        let base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
        while (base64.length % 4) {
            base64 += "=";
        }
        return decodeURIComponent(escape(atob(base64)));
    } catch (error) {
        console.error("Decoding failed:", error);
        return "";
    }
};
