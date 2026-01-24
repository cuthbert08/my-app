'use client';

import { useTheme } from 'next-themes';
import { useEffect } from 'react';

export function ThemeColorSetter() {
    const { resolvedTheme } = useTheme();

    useEffect(() => {
        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta) {
            meta.setAttribute('content', resolvedTheme === 'dark' ? '#000000' : '#ffffff');
        }
    }, [resolvedTheme]);

    return null;
}
