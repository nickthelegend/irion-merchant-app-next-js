'use client';

import { useParams, useRouter } from 'next/navigation';
import { useWallet } from '@txnlab/use-wallet-react';
import useSWR from 'swr';
import { useState, useEffect } from 'react';
import {
    ArrowLeft,
    ShieldCheck,
    Zap,
    Copy,
    ExternalLink,
    Terminal,
    Cpu,
    Code2,
    CheckCircle2,
    AlertCircle,
    Loader2,
    RefreshCw,
    Globe,
    Receipt,
    Wallet
} from 'lucide-react';
import { MerchantEscrowFactory } from '@/lib/algorand/clients/MerchantEscrowClient';
import * as algokit from '@algorandfoundation/algokit-utils';
import algosdk from 'algosdk';
import WebhookManager from '@/components/WebhookManager';
import { deployments } from '@/lib/algorand/client';



// Mock USDC on Sepolia
const DEFAULT_STABLECOIN = "0x1083D49aAB56502D4f4E24fFf52ce622D9B6eCd0";

export default function AppDetails() {
    const { id } = useParams();
    const router = useRouter();
    const { activeAddress } = useWallet();
    const authenticated = !!activeAddress;
    const login = () => { /* Wallet UI handles connection */ };
    const user = activeAddress ? { wallet: { address: activeAddress }, email: { address: '' } } : null;
    const wallet = useWallet(); // For Algorand, activeAccount is the wallet context

    const [balance, setBalance] = useState('0.00');
    const [withdrawing, setWithdrawing] = useState(false);
    const [statusText, setStatusText] = useState('');
    const [error, setError] = useState('');
    const [deploying, setDeploying] = useState(false);
    const [logs, setLogs] = useState<any[]>([]);
    const [refreshingLogs, setRefreshingLogs] = useState(false);

    const { data, error: fetchError, mutate } = useSWR(
        authenticated && user?.wallet?.address ? `/api/apps/${id}` : null,
        async (url) => {
            const res = await fetch(url, {
                headers: { 'x-wallet-address': user?.wallet?.address || '' }
            });
            return res.json();
        }
    );

    const { data: txData, mutate: mutateTx } = useSWR(
        authenticated && user?.wallet?.address ? `/api/apps/${id}/transactions` : null,
        async (url) => {
            const res = await fetch(url, {
                headers: { 'x-wallet-address': user?.wallet?.address || '' }
            });
            return res.json();
        }
    );

    const app = data?.app;
    const transactions: any[] = txData?.transactions || [];

    const fetchBalance = async () => {
        if (!app?.escrow_contract) return;
        try {
            // Hardcoded USDC ID for localnet
            const USDC_ID = 1730;
            const algod = algokit.getAlgoClient({ server: "http://localhost", port: 4001, token: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" });
            const appId = parseInt(app.escrow_contract);
            const appAddress = algosdk.getApplicationAddress(BigInt(appId));
            const accountInfo = await algod.accountAssetInformation(appAddress, USDC_ID).do();
            if (accountInfo && accountInfo['asset-holding']) {
               setBalance((Number(accountInfo['asset-holding'].amount) / 1000000).toFixed(2));
            }
        } catch (e) {
            console.error('Failed to fetch balance:', e);
            setBalance('0.00');
        }
    };

    const fetchLogs = async () => {
        // Not implemented for Algorand yet
        setLogs([]);
    };

    useEffect(() => {
        if (app?.escrow_contract) {
            fetchLogs();
            fetchBalance();
            const int = setInterval(() => {
                fetchLogs();
                fetchBalance();
            }, 10000);
            return () => clearInterval(int);
        }
    }, [app?.escrow_contract]);

    useEffect(() => {
        if (app?.escrow_contract) {
            fetchLogs();
            fetchBalance();
            const int = setInterval(() => {
                fetchLogs();
                fetchBalance();
            }, 15000);
            return () => clearInterval(int);
        }
    }, [app?.escrow_contract]);

    const handleRouterWithdraw = async () => {};

    const handleFulfillOrder = async (loanId: number) => {
        if (!wallet.activeAddress) return;
        setWithdrawing(true);
        setError('');
        try {
            const algod = algokit.getAlgoClient({ server: "http://localhost", port: 4001, token: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" });
            const algorand = algokit.AlgorandClient.fromClients({ algod });
            const factory = new MerchantEscrowFactory({ algorand, defaultSender: wallet.activeAddress! });
            const client = factory.getAppClientById({ appId: BigInt(deployments.merchant_escrow_app_id) });
            
            setStatusText('Releasing funds from Escrow...');
            await client.send.releaseToMerchant({ args: { loanId: BigInt(loanId) } });

            fetchBalance();
            mutateTx();
            setStatusText('Fulfillment complete!');
            setTimeout(() => setStatusText(''), 3000);
        } catch (e: any) {
            console.error(e);
            setError(e.message || 'Fulfillment failed');
        } finally {
            setWithdrawing(false);
        }
    };

    const handleWithdraw = async () => {};

    const handleDeployEscrow = async () => {
        if (!wallet.activeAddress) return;
        setDeploying(true);
        setError('');

        try {
            setStatusText('Configuring Escrow...');
            const address = deployments.merchant_escrow_app_id.toString();

            setStatusText('Saving to database...');
            const res = await fetch(`/api/apps/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'x-wallet-address': wallet.activeAddress
                },
                body: JSON.stringify({ escrow_contract: address })
            });

            if (!res.ok) throw new Error('Failed to update app record');

            mutate();
            setStatusText('Success!');
            setTimeout(() => setStatusText(''), 3000);
        } catch (e: any) {
            console.error(e);
            setError(e.message || 'Configuration failed');
        } finally {
            setDeploying(false);
        }
    };

    const handleCopy = (text: string) => {
        if (!navigator.clipboard) return;
        navigator.clipboard.writeText(text);
        setStatusText('Copied to clipboard!');
        setTimeout(() => setStatusText(''), 2000);
    };

    if (!authenticated) {
        return (
            <div className="min-h-screen bg-background text-foreground flex items-center justify-center font-display grid-bg">
                <div className="text-center relative z-10">
                    <Zap className="w-12 h-12 text-primary mx-auto mb-6 animate-pulse neon-glow" />
                    <h2 className="text-xl font-bold mb-4 uppercase tracking-tighter">Session Required</h2>
                    <button
                        onClick={login}
                        className="bg-primary text-black px-10 py-4 rounded-xl font-black uppercase text-sm tracking-widest hover:scale-105 transition-all shadow-[0_8px_30px_rgba(166,242,74,0.3)]"
                    >
                        Connect Terminal
                    </button>
                </div>
            </div>
        );
    }

    if (fetchError) return <div className="p-8 text-red-500 font-mono">Error loading app. Please check your connection.</div>;
    if (!app) return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center font-mono">
            <div className="flex items-center gap-3 text-white/40">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm uppercase tracking-widest font-bold">Initialising Configuration...</span>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-background text-foreground font-display p-8 selection:bg-primary/20 selection:text-white grid-bg">
            <div className="max-w-4xl mx-auto mb-8 flex items-center justify-between">
                <button
                    onClick={() => router.push('/dashboard')}
                    className="flex items-center gap-2 text-white/40 hover:text-white text-sm group transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> Dashboard
                </button>
                {statusText && (
                    <div className="bg-primary text-black px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-wider animate-in fade-in slide-in-from-top-2 shadow-[0_0_15px_rgba(166,242,74,0.4)]">
                        {statusText}
                    </div>
                )}
            </div>

            <header className="max-w-4xl mx-auto mb-12">
                <div className="flex items-end justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Zap className="w-7 h-7 text-primary neon-glow" />
                            <h1 className="text-3xl font-black uppercase italic tracking-tighter">{app.name}</h1>
                            <div className="ml-4 px-2 py-0.5 rounded border border-white/10 bg-white/5 text-[9px] text-white/40 font-bold uppercase tracking-widest flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(166,242,74,0.5)]" />
                                Linked: {user?.wallet?.address.slice(0, 6)}...{user?.wallet?.address.slice(-4)}
                            </div>
                        </div>
                        <p className="text-white/40 text-xs uppercase tracking-widest font-medium">{app.category || 'General Application'}</p>
                    </div>
                    <div className="text-right">
                        <span className={`text-[10px] uppercase font-bold px-3 py-1 rounded-full border ${app.escrow_contract ? 'border-green-500/30 text-green-400 bg-green-500/10' : 'border-yellow-500/30 text-yellow-500 bg-yellow-500/10'}`}>
                            {app.escrow_contract ? 'Environment: Live' : 'Status: Configuration Required'}
                        </span>
                    </div>
                </div>
            </header>




            <main className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Column: API Keys */}
                <div className="md:col-span-2 space-y-8">
                    <section className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <ShieldCheck className="w-5 h-5 text-primary" />
                            <h2 className="text-lg font-bold">API Configuration</h2>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] uppercase text-white/40 font-bold block mb-2">Client ID</label>
                                <div className="flex items-center gap-2 bg-black/40 border border-white/5 rounded px-4 py-3 group">
                                    <code className="text-sm text-white/80 flex-1 truncate">{app.client_id}</code>
                                    <Copy
                                        onClick={() => handleCopy(app.client_id)}
                                        className="w-4 h-4 text-white/20 hover:text-white cursor-pointer transition-colors"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] uppercase text-white/40 font-bold block mb-2">Client Secret</label>
                                <div className="flex items-center gap-2 bg-black/40 border border-white/5 rounded px-4 py-3 group">
                                    <code className="text-sm text-white/80 flex-1 blur-sm hover:blur-none transition-all duration-300">
                                        {app.client_secret}
                                    </code>
                                    <Copy
                                        onClick={() => handleCopy(app.client_secret)}
                                        className="w-4 h-4 text-white/20 hover:text-white cursor-pointer transition-colors"
                                    />
                                </div>
                                <p className="text-[10px] text-white/20 mt-2 italic">* Secret is encrypted. Hover to reveal.</p>
                            </div>
                        </div>
                    </section>

                    <section className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <Code2 className="w-5 h-5 text-primary" />
                            <h2 className="text-lg font-bold">Quick Integration</h2>
                        </div>

                        <div className="bg-black/60 rounded-xl overflow-hidden border border-white/5">
                            <div className="bg-white/5 px-4 py-2 border-b border-white/5 flex items-center justify-between">
                                <span className="text-[10px] text-white/40 uppercase font-bold">Javascript SDK</span>
                                <div className="flex gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-red-500/20" />
                                    <div className="w-2 h-2 rounded-full bg-yellow-500/20" />
                                    <div className="w-2 h-2 rounded-full bg-green-500/20" />
                                </div>
                            </div>
                            <pre className="p-6 text-xs text-teal-100/70 overflow-x-auto leading-relaxed">
                                {`// 1. Create a Bill via API
const res = await fetch('https://Irion.link/api/bills/create', {
  method: 'POST',
  headers: {
    'x-client-id': '${app.client_id}',
    'x-client-secret': '${app.client_secret}',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    amount: 125.50,
    description: 'Order #1024'
  })
});

const { checkoutUrl } = await res.json();

// 2. Redirect user to authorization
window.location.href = checkoutUrl;`}
                            </pre>
                        </div>
                    </section>

                    <section className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <Terminal className="w-5 h-5 text-primary" />
                                <h2 className="text-lg font-bold">Transaction Stream</h2>
                            </div>
                            {app.escrow_contract && (
                                <button
                                    onClick={fetchLogs}
                                    className={`p-2 hover:bg-white/5 rounded-lg transition-colors ${refreshingLogs ? 'animate-spin' : ''}`}
                                >
                                    <RefreshCw className="w-4 h-4 text-white/30" />
                                </button>
                            )}
                        </div>

                        {!app.escrow_contract ? (
                            <div className="bg-black/20 border border-dashed border-white/10 rounded-xl p-12 text-center">
                                <p className="text-xs text-white/20 uppercase tracking-widest">Connect escrow to view stream</p>
                            </div>
                        ) : logs.length === 0 ? (
                            <div className="bg-black/20 border border-dashed border-white/10 rounded-xl p-12 text-center">
                                <Loader2 className="w-6 h-6 text-white/20 animate-spin mx-auto mb-4" />
                                <p className="text-xs text-white/20 uppercase tracking-widest">Awaiting first settlement...</p>
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {logs.map((log, i) => (
                                    <div key={i} className="bg-black/40 border border-white/5 p-4 rounded-xl flex items-center justify-between gap-4 group hover:border-teal-500/30 transition-colors">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-bold text-teal-400">SETTLED</span>
                                                <span className="text-[10px] text-white/30 font-mono">#{log.orderId}</span>
                                            </div>
                                            <div className="text-[10px] text-white/60 truncate">
                                                From: {log.payer.slice(0, 10)}...{log.payer.slice(-8)}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-bold text-white">+{log.amount} USDC</div>
                                            <div className="text-[9px] text-white/20">{log.timestamp}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    <WebhookManager appId={id as string} />

                    {/* Bill Transactions Section */}
                    <section className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <Receipt className="w-5 h-5 text-primary" />
                                <h2 className="text-lg font-bold">Bill Transactions</h2>
                            </div>
                            <button
                                onClick={() => mutateTx()}
                                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                            >
                                <RefreshCw className="w-4 h-4 text-white/30" />
                            </button>
                        </div>

                        {transactions.length === 0 ? (
                            <div className="bg-black/20 border border-dashed border-white/10 rounded-xl p-12 text-center">
                                <p className="text-xs text-white/20 uppercase tracking-widest">No bill transactions yet</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-white/10">
                                            <th className="text-[10px] uppercase text-white/40 font-bold pb-3 pr-4">Amount</th>
                                            <th className="text-[10px] uppercase text-white/40 font-bold pb-3 pr-4">Asset</th>
                                            <th className="text-[10px] uppercase text-white/40 font-bold pb-3 pr-4">Status</th>
                                            <th className="text-[10px] uppercase text-white/40 font-bold pb-3 pr-4">Payment Mode</th>
                                            <th className="text-[10px] uppercase text-white/40 font-bold pb-3 pr-4">Date</th>
                                            <th className="text-[10px] uppercase text-white/40 font-bold pb-3">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {transactions.map((tx: any) => (
                                            <tr key={tx._id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                                <td className="py-3 pr-4 text-sm font-bold text-white">{tx.amount} {tx.asset}</td>
                                                <td className="py-3 pr-4 text-xs text-white/60">{tx.asset}</td>
                                                <td className="py-3 pr-4">
                                                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                                                        tx.status === 'paid'
                                                            ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                                            : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                                                    }`}>
                                                        {tx.status}
                                                    </span>
                                                </td>
                                                <td className="py-3 pr-4 text-xs text-white/60">{tx.payment_mode || '—'}</td>
                                                <td className="py-3 pr-4 text-xs text-white/40">
                                                    {tx.paid_at
                                                        ? new Date(tx.paid_at).toLocaleDateString()
                                                        : new Date(tx.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="py-3">
                                                    {tx.status === 'paid' && tx.payment_mode === 'bnpl' && tx.loan_id && (
                                                        <button
                                                            onClick={() => handleFulfillOrder(tx.loan_id)}
                                                            className="bg-primary/20 text-primary border border-primary/30 px-3 py-1 rounded text-xs hover:bg-primary/30 transition-colors uppercase font-bold"
                                                        >
                                                            Fulfill
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                </div>

                {/* Right Column: Escrow Deployment */}
                <div className="space-y-8">
                    <section className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 blur-3xl -mr-12 -mt-12" />

                        <div className="flex items-center gap-2 mb-4">
                            <Cpu className="w-5 h-5 text-primary" />
                            <h2 className="text-lg font-bold">On-chain Escrow</h2>
                        </div>

                        {app.escrow_contract ? (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400">
                                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                                    <span className="text-xs font-bold uppercase">Contract Deployed</span>
                                </div>
                                <div className="bg-black/40 border border-white/5 rounded p-3">
                                    <label className="text-[9px] uppercase text-white/30 block mb-1">Contract Address</label>
                                    <div className="flex items-center justify-between gap-1">
                                        <code className="text-[10px] text-white/60 truncate">{app.escrow_contract}</code>
                                        <a href={`https://sepolia.etherscan.io/address/${app.escrow_contract}`} target="_blank" className="text-primary hover:text-white">
                                            <ExternalLink className="w-3 h-3" />
                                        </a>
                                    </div>
                                </div>
                                <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 flex items-center justify-between">
                                    <div>
                                        <div className="text-[9px] uppercase font-bold text-primary/50 mb-1">Escrow Balance</div>
                                        <div className="text-xl font-bold text-white">{balance} USDC</div>
                                    </div>
                                    <button
                                        disabled={withdrawing || parseFloat(balance) === 0}
                                        onClick={handleWithdraw}
                                        className="bg-primary text-black px-4 py-2 rounded-lg font-black text-[10px] uppercase tracking-tighter hover:scale-105 disabled:opacity-30 transition-all flex items-center gap-2 shadow-md shadow-primary/10"
                                    >
                                        {withdrawing ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Withdraw'}
                                    </button>
                                </div>
                                <p className="text-[10px] text-white/30 leading-relaxed italic">
                                    Your escrow is active on Algorand Localnet. Payments will be routed here.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <p className="text-xs text-white/50 leading-relaxed">
                                    To receive payments, you must deploy a dedicated <span className="text-white">MerchantEscrow</span> contract.
                                    This ensures your funds are segregated and secure.
                                </p>

                                {error && (
                                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] p-3 rounded flex items-start gap-2">
                                        <AlertCircle className="w-4 h-4 shrink-0" />
                                        {error}
                                    </div>
                                )}

                                <button
                                    onClick={handleDeployEscrow}
                                    disabled={deploying}
                                    className="w-full bg-primary hover:scale-[1.02] disabled:bg-white/10 disabled:text-white/20 text-black font-black uppercase tracking-tighter py-3 rounded-xl transition-all flex items-center justify-center gap-3 active:scale-[0.98] shadow-lg shadow-primary/20"
                                >
                                    {deploying ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            {statusText || 'Processing...'}
                                        </>
                                    ) : (
                                        'Deploy Escrow'
                                    )}
                                </button>
                                <p className="text-[9px] text-white/20 text-center uppercase tracking-widest font-bold">Network fee: ~0.001 ALGO</p>
                            </div>
                        )}
                    </section>

                    <section className="border border-white/5 rounded-2xl p-6 bg-gradient-to-br from-white/[0.02] to-transparent">
                        <div className="flex items-center gap-2 mb-4 opacity-50">
                            <Terminal className="w-4 h-4" />
                            <h3 className="text-xs font-bold uppercase tracking-widest">Network Info</h3>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between text-[11px]">
                                <span className="text-white/30">Network</span>
                                <span className="text-white/60 font-bold">Algorand Localnet</span>
                            </div>
                            <div className="flex justify-between text-[11px]">
                                <span className="text-white/30">Currency</span>
                                <span className="text-white/60 font-bold">USDC (Local)</span>
                            </div>
                        </div>
                    </section>

                </div>
            </main>
        </div>
    );
}
