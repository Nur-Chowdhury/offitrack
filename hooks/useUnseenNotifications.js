"use client";
import { useState, useEffect } from 'react';

export const useUnseenNotifications = (orgId) => {
    const [count, setCount] = useState(0);

    const refreshCount = async () => {
        if (!orgId) return;
        try {
            const response = await fetch(`/api/org/${orgId}/notifications/unseen-count`);
            if (response.ok) {
                const data = await response.json();
                setCount(data.count);
            }
        } catch (error) {
            console.error(`Failed to fetch notification count for org ${orgId}:`, error);
        }
    };

    useEffect(() => {
        refreshCount();
        const interval = setInterval(refreshCount, 3000);
        return () => clearInterval(interval);
    }, [orgId]);

    return { count, refreshCount };
};