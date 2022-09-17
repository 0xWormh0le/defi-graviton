import { useEffect } from "react";

export function setBodyClass(className: string) {
    return () => useEffect(() => {
        document.body.classList.add(className);
        return () => {
            document.body.classList.remove(className);
        };
    }, []);
}

export function setHtmlRootClass(className: string) {
    return () => useEffect(() => {
        document.documentElement.classList.add(className);
        return () => {
            document.documentElement.classList.remove(className);
        };
    }, []);
}
