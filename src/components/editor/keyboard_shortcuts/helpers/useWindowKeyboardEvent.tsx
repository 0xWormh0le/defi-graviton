import {DependencyList, useEffect} from "react";

export const useWindowKeyboardEvent = (event: string,
                                       callback: EventListenerOrEventListenerObject,
                                       dependencies: DependencyList) => {
    useEffect(() => {
        window.addEventListener(event, callback);
        return () => window.removeEventListener(event, callback);
    }, [event, callback, ...dependencies]);
};
