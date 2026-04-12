import { useWallet } from '@txnlab/use-wallet-react';
import { useEffect } from 'react';

export function useUserSync() {
    const { activeAddress } = useWallet();

    useEffect(() => {
        async function syncUser() {
            if (activeAddress) {
                try {
                    await fetch('/api/auth/sync', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            wallet_address: activeAddress,
                        }),
                    });
                } catch (err) {
                    console.error('Failed to sync user', err);
                }
            }
        }

        syncUser();
    }, [activeAddress]);
}
