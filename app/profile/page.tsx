
"use client"

import { useState } from "react"
import { useWallet } from "@txnlab/use-wallet-react"
import { ShieldCheck, User, Store, Wallet, BadgeCheck, AlertCircle, Loader2 } from "lucide-react"

export default function MerchantProfile() {
  const { activeAddress } = useWallet()
  const [loading, setLoading] = useState(false)
  
  // Mock merchant data - in production these come from contract global state or backend
  const merchantData = {
    name: "Luxury Watches Inc.",
    id: "M-7241-XO",
    joined: "April 2026",
    status: "Verified",
    rating: 4.9,
    escrowAddress: "FL3VIRUFL75RVFWPMHOYC4DQTPLOF6RLPGRAXG53LXU4XOSIB36JII34XA",
    totalSales: "125,430 USDC",
    pendingClaims: "12,200 USDC"
  }

  return (
    <div className="flex-1 space-y-8 py-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-1">
        <span className="text-[10px] tracking-[0.4em] text-primary/60 uppercase font-mono">Merchant_Portal // Profile</span>
        <h1 className="text-3xl tracking-tighter font-black uppercase italic">Merchant Profile</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Col: Info */}
        <div className="md:col-span-2 space-y-8">
          <div className="bg-[#0d0f14] border border-white/5 rounded-3xl p-8 space-y-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <Store size={120} />
            </div>

            <div className="flex items-center gap-6">
              <div className="size-24 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center relative">
                <Store size={40} className="text-primary" />
                <div className="absolute -bottom-2 -right-2 size-8 rounded-full bg-primary flex items-center justify-center border-4 border-[#0d0f14]">
                  <BadgeCheck size={16} className="text-black" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-black text-white">{merchantData.name}</h2>
                <p className="text-xs text-foreground/40 font-mono mt-1 uppercase tracking-widest">{merchantData.id} // {merchantData.status}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              {[
                { label: "Joined", value: merchantData.joined, icon: User },
                { label: "Merchant Account", value: activeAddress ? `${activeAddress.slice(0, 10)}...` : "Not Connected", icon: Wallet },
                { label: "Protocol Rating", value: `${merchantData.rating} / 5.0`, icon: ShieldCheck },
                { label: "Escrow Contract", value: `${merchantData.escrowAddress.slice(0, 10)}...`, icon: ShieldCheck },
              ].map((item, idx) => (
                <div key={idx} className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-[10px] text-foreground/40 uppercase tracking-widest font-black">
                    <item.icon size={12} className="text-primary/60" />
                    {item.label}
                  </div>
                  <div className="text-sm font-bold text-white truncate">{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#0d0f14] border border-white/5 rounded-3xl p-8 space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Protocol Settings</h3>
            <div className="space-y-4">
               <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                 <div className="space-y-1">
                   <p className="text-xs font-bold text-white uppercase tracking-widest">Auto-claim Escrow</p>
                   <p className="text-[10px] text-foreground/40">Automatically release funds after delivery confirmation</p>
                 </div>
                 <div className="size-5 rounded-full bg-primary/20 border border-primary flex items-center justify-center p-1">
                   <div className="size-full rounded-full bg-primary" />
                 </div>
               </div>
               <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 opacity-50">
                 <div className="space-y-1">
                   <p className="text-xs font-bold text-white uppercase tracking-widest">Early Liquidity</p>
                   <p className="text-[10px] text-foreground/40">Sell receivables to the Irion Lending Pool at 2% discount</p>
                 </div>
                 <div className="size-5 rounded-full bg-white/10 border border-white/20" />
               </div>
            </div>
          </div>
        </div>

        {/* Right Col: Stats */}
        <div className="space-y-6">
          <div className="bg-primary/5 border border-primary/20 rounded-3xl p-8 relative overflow-hidden flex flex-col gap-4">
            <div className="absolute top-0 right-0 p-4 opacity-5"><ShieldCheck size={60} /></div>
            <span className="text-[10px] text-primary/60 uppercase tracking-widest font-bold">Total Sales Volume</span>
            <div className="text-3xl font-black text-white">{merchantData.totalSales}</div>
            <div className="h-px bg-primary/20 w-full" />
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-foreground/40 uppercase tracking-widest">Growth Rate</span>
              <span className="text-[10px] text-primary font-bold">+12.4%</span>
            </div>
          </div>

          <div className="bg-[#0d0f14] border border-white/5 rounded-3xl p-8 space-y-6">
            <div className="flex flex-col gap-2">
              <span className="text-[10px] text-foreground/40 uppercase tracking-widest font-bold">Pending Withdrawal</span>
              <div className="text-2xl font-black text-white">{merchantData.pendingClaims}</div>
            </div>
            <button
               disabled={loading}
               className="w-full py-4 rounded-2xl bg-white text-black font-black text-[11px] uppercase tracking-widest hover:bg-white/90 transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : "Initiate Withdrawal"}
            </button>
          </div>

          <div className="bg-red-500/5 border border-red-500/20 rounded-3xl p-6 flex flex-col gap-3">
             <div className="flex items-center gap-2 text-red-400">
               <AlertCircle size={14} />
               <span className="text-[10px] font-black uppercase tracking-widest">Security Warning</span>
             </div>
             <p className="text-[10px] text-foreground/40 leading-relaxed uppercase">
               Ensure your Merchant Escrow app is bootstrapped and funded with MBR before initiating withdrawal.
             </p>
          </div>
        </div>
      </div>
    </div>
  )
}
