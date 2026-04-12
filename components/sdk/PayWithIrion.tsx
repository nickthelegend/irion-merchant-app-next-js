'use client';

import React from 'react';

interface PayWithIrionProps {
    apiKey: string;
    apiSecret: string;
    amount: number;
    details: string;
    onSuccess?: (tx: any) => void;
    onError?: (msg: any) => void;
}

export function PayWithIrion({ apiKey, apiSecret, amount, details, onSuccess, onError }: PayWithIrionProps) {
    return (
        <button 
            onClick={() => {
                console.log(`Paying ${amount} for ${details} using key ${apiKey}`);
                if (onSuccess) onSuccess('DEMO_TX');
            }}
            className="w-full bg-primary text-black px-6 py-4 rounded-xl font-black uppercase text-sm tracking-widest hover:scale-[1.02] transition-all flex items-center justify-center gap-3 shadow-[0_8px_30px_rgba(166,242,74,0.3)]"
        >
            Pay with Irion
        </button>
    );
}
