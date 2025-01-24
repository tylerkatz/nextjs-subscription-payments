'use client';

import { useEffect, useRef } from 'react';

interface Props {
    onPortalRequest: () => void;
    children: React.ReactNode;
}

export function SubscriptionDetails({ onPortalRequest, children }: Props) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const portalTrigger = containerRef.current?.querySelector('.portal-trigger');
        if (portalTrigger) {
            portalTrigger.insertAdjacentHTML('afterend',
                `<button class="text-blue-400 hover:text-blue-300 underline ml-1">
          Manage this change in the customer portal
        </button>`
            );
            const button = portalTrigger.nextElementSibling as HTMLButtonElement;
            button?.addEventListener('click', onPortalRequest);
        }
    }, [onPortalRequest]);

    return <div ref={containerRef}>{children}</div>;
} 
