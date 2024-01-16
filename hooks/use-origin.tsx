import { useState, useEffect } from 'react';

export const useOrigin = () => {
    const [mounter, setMounter] = useState(false);
    const origin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : '';

    useEffect(() => {
        setMounter(true);
    }, []);

    if (!mounter) {
        return '';
    }

    return origin;
}