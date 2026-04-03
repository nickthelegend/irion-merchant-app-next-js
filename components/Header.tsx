'use client';

import { useWallet } from '@txnlab/use-wallet-react';
import { WalletButton } from '@txnlab/use-wallet-ui-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, LayoutGrid, Zap } from 'lucide-react';

export default function Header() {
    const { activeAccount } = useWallet();
    const pathname = usePathname();

    if (pathname === '/shop') return null;

    return (
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/60 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <div className="flex items-center gap-10">
                    <Link href="/" className="flex items-center gap-3 group">
                        <Image
                            src="/logo.png"
                            alt="Irion Logo"
                            width={140}
                            height={40}
                            className="h-9 w-auto hover:brightness-110 transition-all"
                        />
                    </Link>

                    <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-white/50">
                        <Link href="/dashboard" className="hover:text-primary transition-colors flex items-center gap-2">
                            <LayoutDashboard className="w-4 h-4" />
                            Console
                        </Link>
                        <Link href="/shop" className="hover:text-primary transition-colors flex items-center gap-2">
                            <LayoutGrid className="w-4 h-4" />
                            Live Demo
                        </Link>
                    </nav>
                </div>

                <div className="flex items-center gap-6">
                    <div className="wui-custom-trigger">
                        <WalletButton />
                    </div>
                </div>
            </div>
        </header>
    );
}
