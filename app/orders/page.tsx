
"use client"

import { useState } from "react"
import { Search, Filter, ArrowUpRight, CheckCircle2, XCircle, Clock, ExternalLink, Loader2, DollarSign, ShieldCheck } from "lucide-react"

export default function MerchantOrders() {
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")
  
  const orders = [
    { id: "ORD-9284-A", borrower: "LJ5N...4IU", amount: "1,200 USDC", status: "In Escrow", date: "2026-04-12", delivery: "Pending" },
    { id: "ORD-9285-B", borrower: "OPRK...7UH4", amount: "4,500 USDC", status: "Released", date: "2026-04-11", delivery: "Confirmed" },
    { id: "ORD-9286-C", borrower: "LJ5N...4IU", amount: "800 USDC", status: "Disputed", date: "2026-04-10", delivery: "Failed" },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Escrow": return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
      case "Released": return "text-green-400 bg-green-400/10 border-green-500/20";
      case "Disputed": return "text-red-400 bg-red-400/10 border-red-500/20";
      default: return "text-white/40 bg-white/5 border-white/10";
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "In Escrow": return <Clock size={12} />;
      case "Released": return <CheckCircle2 size={12} />;
      case "Disputed": return <XCircle size={12} />;
      default: return null;
    }
  }

  return (
    <div className="flex-1 space-y-8 py-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] tracking-[0.4em] text-primary/60 uppercase font-mono italic">Merchant_Portal // Operations</span>
          <h1 className="text-3xl tracking-tighter font-black uppercase italic">Orders & Escrow</h1>
        </div>
        <div className="flex items-center gap-3">
           <div className="bg-[#05080f]/60 border border-white/10 rounded-2xl px-4 py-2 flex items-center gap-2">
             <DollarSign size={14} className="text-primary" />
             <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Balance: 12,200 USDC</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-3 space-y-6">
          <div className="flex items-center gap-4 bg-[#0d0f14] border border-white/5 p-4 rounded-3xl">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
              <input 
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by Order ID or Borrower Address..." 
                className="w-full bg-white/5 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-primary/40 transition-colors placeholder:text-white/10"
              />
            </div>
            <button className="bg-white/5 border border-white/10 p-3 rounded-2xl hover:bg-white/10 transition-colors">
              <Filter size={18} className="text-white/60" />
            </button>
          </div>

          <div className="bg-[#0d0f14] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
            <div className="grid grid-cols-6 px-8 py-5 border-b border-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-white/20 items-center">
              <div className="col-span-2">Order Description</div>
              <div className="text-right">Amount</div>
              <div className="text-center">Protocol Status</div>
              <div className="text-center">Delivery</div>
              <div className="text-right">Action</div>
            </div>
            <div className="divide-y divide-white/5 font-mono">
              {orders.map((order) => (
                <div key={order.id} className="grid grid-cols-6 px-8 py-7 items-center hover:bg-white/[0.02] transition-colors group cursor-pointer">
                  <div className="col-span-2 space-y-1">
                    <div className="text-sm font-bold text-white flex items-center gap-2 italic">{order.id}</div>
                    <div className="text-[10px] text-white/40 uppercase tracking-tighter">Borrower: {order.borrower}</div>
                  </div>
                  <div className="text-right text-sm font-bold text-white">{order.amount}</div>
                  <div className="flex justify-center">
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${getStatusColor(order.status)}`}>
                       {getStatusIcon(order.status)}
                       {order.status}
                    </div>
                  </div>
                  <div className="text-center">
                    <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{order.delivery}</span>
                  </div>
                  <div className="flex justify-end">
                    <button className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-black transition-all group-hover:scale-110">
                      <ExternalLink size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
           <div className="bg-[#0d0f14] border border-white/5 rounded-3xl p-8 space-y-6">
              <div className="space-y-2">
                <h3 className="text-xs font-black uppercase tracking-widest text-primary italic">Release Escrow</h3>
                <p className="text-[10px] text-foreground/40 leading-relaxed uppercase">Manual release for orders where delivery data is unavailable on-chain.</p>
              </div>
              
              <div className="space-y-3">
                 <input 
                   placeholder="ENTER_ORDER_ID" 
                   className="w-full bg-white/5 border border-white/5 rounded-xl p-3 text-xs focus:outline-none focus:border-primary/40 uppercase font-bold"
                 />
                 <button 
                   disabled={loading}
                   className="w-full py-4 rounded-xl bg-white text-black font-black text-[11px] uppercase tracking-widest hover:bg-[#00ca96] hover:text-black transition-all flex items-center justify-center gap-2"
                 >
                   {loading ? <Loader2 size={14} className="animate-spin" /> : <>Release Funds <ArrowUpRight size={14} /></>}
                 </button>
              </div>
           </div>

           <div className="bg-primary/5 border border-primary/20 rounded-3xl p-6 flex flex-col gap-3">
             <div className="flex items-center gap-2 text-primary">
               <ShieldCheck size={14} />
               <span className="text-[10px] font-black uppercase tracking-widest italic">Verification System</span>
             </div>
             <p className="text-[10px] text-foreground/40 leading-relaxed uppercase">
               Irion Protocol uses Proof-of-Delivery oracles. Attempting to release funds before delivery may trigger an automatic dispute.
             </p>
           </div>
        </div>
      </div>
    </div>
  )
}
