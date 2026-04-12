'use client';
import { ReactNode } from 'react';

import { NetworkId, WalletId, WalletManager, WalletProvider } from '@txnlab/use-wallet-react'
import { WalletUIProvider } from '@txnlab/use-wallet-ui-react'
import '@txnlab/use-wallet-ui-react/dist/style.css'

const walletManager = new WalletManager({
    wallets: [WalletId.PERA, WalletId.DEFLY, WalletId.LUTE],
    defaultNetwork: NetworkId.TESTNET,
})

export default function Providers({ children }: { children: ReactNode }) {
    return (
        <WalletProvider manager={walletManager}>
            <WalletUIProvider>
                {children}
            </WalletUIProvider>
        </WalletProvider>
    );
}
