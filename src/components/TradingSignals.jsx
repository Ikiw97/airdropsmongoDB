import React from 'react';
import { Activity } from 'lucide-react';

const TradingSignals = () => {
    return (
        <div className="p-6 rounded-xl border shadow-xl transition-all" style={{ background: 'var(--card-bg)', borderColor: 'var(--border-primary)' }}>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Activity size={18} className="text-blue-500" />
                    <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Trading Signals</h3>
                </div>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20 hover:bg-blue-500/20 transition">
                    <span className="text-sm">+</span> Add Signal
                </button>
            </div>

            <div className="space-y-4">
                <div className="p-4 rounded-lg border transition-all" style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-primary)' }}>
                    <p className="text-xs italic leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                        Selalu ingat bahwa trading futures memiliki risiko yang sangat tinggi. Seluruh chart, analisis, atau pandangan yang saya bagikan bukan merupakan ajakan atau saran investasi. Semua hanyalah hasil dari analisis pribadi yang bisa saja salah.
                    </p>
                </div>

                <div className="p-4 rounded-lg border transition-all" style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-primary)' }}>
                    <p className="text-xs italic leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                        Profit maupun kerugian menjadi tanggung jawab masing-masing trader.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default TradingSignals;
