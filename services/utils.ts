// Utility helpers required by the provided class logic

export const ObjectUtil = {
    isEmpty: (v: any): boolean => v === undefined || v === null || v === '',
    isArrEmpty: (v: any): boolean => !Array.isArray(v) || v.length === 0,
};

export const Base64 = {
    decode: (str: string): string => {
        try {
            // Fix standard URL base64 issues and decode
            str = str.replace(/-/g, '+').replace(/_/g, '/');
            while (str.length % 4) {
                str += '=';
            }
            // decoding unicode strings correctly
            return decodeURIComponent(
                Array.prototype.map.call(atob(str), (c: string) => {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join('')
            );
        } catch (e) {
            console.error("Base64 decode error", e);
            return "";
        }
    },
    encode: (str: string): string => {
        return btoa(
            encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
                (match, p1) => {
                    return String.fromCharCode(parseInt(p1, 16));
                })
        );
    }
};