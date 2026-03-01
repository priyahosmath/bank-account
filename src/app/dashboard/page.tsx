'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState<'dashboard' | 'transfer' | 'ai' | 'deposit' | 'withdraw' | 'transactions' | 'profile'>('dashboard');
    const [balance, setBalance] = useState<number | null>(null);
    const [recipientEmail, setRecipientEmail] = useState('');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [transactions, setTransactions] = useState<any[]>([]);
    const [userProfile, setUserProfile] = useState<any>(null);
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
    const [loading, setLoading] = useState(true);

    const router = useRouter();

    const fetchBalance = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/balance');
            if (res.status === 401) {
                router.push('/');
                return;
            }
            const data = await res.json();
            if (res.ok) {
                setBalance(data.balance);
            } else {
                setMessage({ text: data.message, type: 'error' });
            }
        } catch (err: any) {
            setMessage({ text: 'Failed to fetch balance', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const fetchTransactions = async () => {
        try {
            const res = await fetch('/api/transactions');
            if (res.ok) {
                const data = await res.json();
                setTransactions(data.transactions);
            }
        } catch (err) {
            console.error('Failed to fetch transactions');
        }
    };

    const fetchProfile = async () => {
        try {
            const res = await fetch('/api/profile');
            if (res.ok) {
                const data = await res.json();
                setUserProfile(data.user);
            }
        } catch (err) {
            console.error('Failed to fetch profile');
        }
    };

    useEffect(() => {
        fetchBalance();
        fetchTransactions();
        fetchProfile();
    }, []);

    const handleAction = async (endpoint: string, payload: any) => {
        setMessage(null);
        setLoading(true);
        try {
            const res = await fetch(`/api/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (res.ok) {
                setMessage({ text: data.message || 'Action successful!', type: 'success' });
                setAmount('');
                setDescription('');
                fetchBalance();
                fetchTransactions();
            } else {
                setMessage({ text: data.message || 'Action failed', type: 'error' });
            }
        } catch (err) {
            setMessage({ text: 'Something went wrong', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleTransfer = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        setLoading(true);

        try {
            const res = await fetch('/api/transfer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ recipientEmail, amount: parseFloat(amount) }),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage({ text: 'Transfer successful!', type: 'success' });
                setRecipientEmail('');
                setAmount('');
                fetchBalance();
            } else {
                setMessage({ text: data.message || 'Transfer failed', type: 'error' });
            }
        } catch (err: any) {
            setMessage({ text: 'Something went wrong', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await fetch('/api/logout', { method: 'POST' });
            router.push('/');
        } catch (err) {
            console.error('Logout failed');
        }
    };

    return (
        <main className="flex flex-col min-h-screen bg-gradient-to-br from-[#0c3167] to-[#0459a9] text-white font-sans overflow-hidden">
            {/* Header */}
            <header className="flex justify-between items-center p-4 bg-white/10 backdrop-blur-md border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)] z-10">
                <div className="flex items-center space-x-4 ml-2">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#0459a9] shadow-md border-2 border-white/80">
                        {/* SBI Logo Placeholder */}
                        <svg className="w-6 h-6 border-b-2 border-r-2 border-current rounded-tl-full" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="5" fill="white" className="text-white bg-white border border-[#0459a9] border-[3px]" /></svg>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-wide">STATE BANK OF INDIA</h1>
                        <p className="text-[10px] text-white/80 tracking-[0.2em] font-medium uppercase">Internet Banking</p>
                    </div>
                </div>
                <div className="flex items-center space-x-4 mr-4">
                    <div className="flex items-center text-sm font-medium hover:bg-white/10 py-1 px-3 rounded cursor-pointer transition">
                        <span>demo</span>
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                    <button onClick={handleLogout} className="text-sm bg-red-500/20 text-red-100 hover:bg-red-500 hover:text-white border border-red-500/30 px-4 py-1.5 rounded-md font-medium transition shadow-sm">Logout</button>
                </div>
            </header>

            <div className="flex flex-1 relative">
                {/* Decorative glow element behind sidebar */}
                <div className="absolute top-0 left-0 w-64 h-full bg-blue-400/20 blur-3xl rounded-full translate-x-[-50%] pointer-events-none"></div>

                {/* Sidebar */}
                <aside className="w-64 bg-white/5 backdrop-blur-2xl border-r border-white/10 p-4 py-6 flex flex-col space-y-2 z-10 shadow-[4px_0_24px_rgba(0,0,0,0.15)] relative">
                    <SidebarButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon="dashboard" label="Dashboard" />
                    <SidebarButton active={false} onClick={() => { }} icon="deposit" label="Deposit" disabled />
                    <SidebarButton active={false} onClick={() => { }} icon="withdraw" label="Withdraw" disabled />
                    <SidebarButton active={activeTab === 'transfer'} onClick={() => setActiveTab('transfer')} icon="transfer" label="Transfer" />
                    <SidebarButton active={false} onClick={() => { }} icon="transactions" label="Transactions" disabled />
                    <SidebarButton active={activeTab === 'ai'} onClick={() => setActiveTab('ai')} icon="ai" label="AI Agent" />
                    <SidebarButton active={false} onClick={() => { }} icon="profile" label="Profile" disabled />
                </aside>

                {/* Main Content Area */}
                <section className="flex-1 p-8 overflow-y-auto relative z-10">
                    <div className="max-w-6xl mx-auto">
                        {message && (
                            <div className={`mb-6 p-4 rounded-xl text-center font-semibold shadow-lg backdrop-blur-md border ${message.type === 'success' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-100' : 'bg-rose-500/20 border-rose-500/50 text-rose-100'}`}>
                                {message.text}
                            </div>
                        )}

                        {activeTab === 'dashboard' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h2 className="text-[28px] font-semibold mb-6 flex items-center">
                                    Account Dashboard
                                </h2>

                                {/* 3 Cards Row */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                                    <GlassCard title="CURRENT BALANCE" value={`$${balance !== null ? balance.toFixed(2) : '---'}`} icon="wallet" />
                                    <GlassCard title="ACCOUNT NUMBER" value="089525140" icon="bank" />
                                    <GlassCard title="IFSC CODE" value="SBIN00012" icon="card" />
                                </div>

                                <h3 className="text-xl font-semibold mb-4 tracking-wide">Quick Actions</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                                    <QuickActionButton label="Deposit Funds" icon="arrow-down" onClick={() => setActiveTab('deposit')} />
                                    <QuickActionButton label="Withdraw Funds" icon="arrow-up" onClick={() => setActiveTab('withdraw')} />
                                    <QuickActionButton label="Transfer Money" icon="transfer" onClick={() => setActiveTab('transfer')} />
                                </div>

                                {/* Recent Transactions Table */}
                                <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                                    {/* Inner glow */}
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-300/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

                                    <div className="flex justify-between items-center mb-6 relative z-10">
                                        <h3 className="text-xl font-semibold">Recent Transactions</h3>
                                        <button className="text-[#60a5fa] text-sm font-medium hover:text-white transition">View All</button>
                                    </div>
                                    <div className="overflow-x-auto relative z-10">
                                        <table className="w-full text-left text-sm">
                                            <thead>
                                                <tr className="border-b border-white/20 text-[#93c5fd] tracking-wider uppercase text-xs">
                                                    <th className="pb-3 px-2 font-semibold">DATE</th>
                                                    <th className="pb-3 px-2 font-semibold">DESCRIPTION</th>
                                                    <th className="pb-3 px-2 font-semibold">TYPE</th>
                                                    <th className="pb-3 px-2 font-semibold">AMOUNT</th>
                                                    <th className="pb-3 px-2 font-semibold">STATUS</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {transactions.slice(0, 10).map((tx) => (
                                                    <tr key={tx.id} className="border-b border-white/10 hover:bg-white/5 transition group">
                                                        <td className="py-4 px-2 text-white/80">{new Date(tx.date).toLocaleString()}</td>
                                                        <td className="py-4 px-2 font-medium">{tx.description}</td>
                                                        <td className="py-4 px-2">
                                                            <span className={`${tx.type === 'DEPOSIT' || (tx.type === 'TRANSFER' && tx.description.includes('from')) ? 'bg-[#166534]' : 'bg-[#991b1b]'} text-white px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider`}>
                                                                {tx.type}
                                                            </span>
                                                        </td>
                                                        <td className={`py-4 px-2 font-bold ${tx.type === 'DEPOSIT' || (tx.type === 'TRANSFER' && tx.description.includes('from')) ? 'text-[#4ade80]' : 'text-rose-400'}`}>
                                                            {tx.type === 'DEPOSIT' || (tx.type === 'TRANSFER' && tx.description.includes('from')) ? '+' : '-'} ${tx.amount.toFixed(2)}
                                                        </td>
                                                        <td className="py-4 px-2"><span className="bg-[#14532d] text-emerald-100 border border-emerald-500/30 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider shadow-sm">SUCCESS</span></td>
                                                    </tr>
                                                ))}
                                                {transactions.length === 0 && (
                                                    <tr><td colSpan={5} className="py-8 text-center text-white/50 italic">No transactions found</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'transfer' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h2 className="text-[28px] font-semibold mb-6 flex items-center">
                                    Transfer Money
                                </h2>
                                <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-8 max-w-xl shadow-2xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-300/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

                                    <form onSubmit={handleTransfer} className="flex flex-col gap-6 relative z-10">
                                        <div>
                                            <label className="block text-sm font-medium mb-2 text-[#93c5fd]">Recipient Email</label>
                                            <input type="email" required className="w-full px-5 py-3.5 rounded-xl bg-black/20 border border-white/10 focus:border-[#60a5fa] focus:outline-none focus:ring-1 focus:ring-[#60a5fa] transition text-lg text-white placeholder-white/30 shadow-inner" value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} placeholder="friend@example.com" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2 text-[#93c5fd]">Transfer Amount ($)</label>
                                            <input type="number" required min="0.01" step="0.01" className="w-full px-5 py-3.5 rounded-xl bg-black/20 border border-white/10 focus:border-[#60a5fa] focus:outline-none focus:ring-1 focus:ring-[#60a5fa] transition text-lg text-white placeholder-white/30 shadow-inner" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
                                        </div>
                                        <button type="submit" disabled={loading} className="w-full mt-4 bg-gradient-to-r from-[#0ea5e9] to-[#2563eb] hover:from-[#0284c7] hover:to-[#1d4ed8] text-white font-bold py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] text-lg disabled:opacity-50 disabled:cursor-not-allowed">
                                            {loading ? 'Processing Transfer...' : 'Send Funds Securely'}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}

                        {activeTab === 'deposit' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h2 className="text-[28px] font-semibold mb-6 flex items-center">Deposit Funds</h2>
                                <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-8 max-w-xl shadow-2xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-300/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
                                    <form onSubmit={(e) => { e.preventDefault(); handleAction('deposit', { amount: parseFloat(amount), description }); }} className="flex flex-col gap-6 relative z-10">
                                        <div>
                                            <label className="block text-sm font-medium mb-2 text-[#93c5fd]">Deposit Amount ($)</label>
                                            <input type="number" required min="1" step="0.01" className="w-full px-5 py-3.5 rounded-xl bg-black/20 border border-white/10 focus:border-[#60a5fa] focus:outline-none focus:ring-1 focus:ring-[#60a5fa] transition text-lg text-white placeholder-white/30 shadow-inner" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
                                        </div>
                                        <button type="submit" disabled={loading} className="w-full mt-4 bg-gradient-to-r from-[#0ea5e9] to-[#2563eb] hover:from-[#0284c7] hover:to-[#1d4ed8] text-white font-bold py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] text-lg disabled:opacity-50 disabled:cursor-not-allowed">
                                            {loading ? 'Processing...' : 'Complete Deposit'}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}

                        {activeTab === 'withdraw' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h2 className="text-[28px] font-semibold mb-6 flex items-center">Withdraw Funds</h2>
                                <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-8 max-w-xl shadow-2xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-300/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
                                    <form onSubmit={(e) => { e.preventDefault(); handleAction('withdraw', { amount: parseFloat(amount), description }); }} className="flex flex-col gap-6 relative z-10">
                                        <div>
                                            <label className="block text-sm font-medium mb-2 text-[#93c5fd]">Withdraw Amount ($)</label>
                                            <input type="number" required min="1" step="0.01" className="w-full px-5 py-3.5 rounded-xl bg-black/20 border border-white/10 focus:border-[#60a5fa] focus:outline-none focus:ring-1 focus:ring-[#60a5fa] transition text-lg text-white placeholder-white/30 shadow-inner" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
                                        </div>
                                        <button type="submit" disabled={loading} className="w-full mt-4 bg-gradient-to-r from-[#0ea5e9] to-[#2563eb] hover:from-[#0284c7] hover:to-[#1d4ed8] text-white font-bold py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] text-lg disabled:opacity-50 disabled:cursor-not-allowed">
                                            {loading ? 'Processing...' : 'Withdraw Securely'}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}

                        {activeTab === 'transactions' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h2 className="text-[28px] font-semibold mb-6 flex items-center">Full Transaction History</h2>
                                <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                                    <div className="overflow-x-auto relative z-10">
                                        <table className="w-full text-left text-sm">
                                            <thead>
                                                <tr className="border-b border-white/20 text-[#93c5fd] tracking-wider uppercase text-xs">
                                                    <th className="pb-3 px-2 font-semibold">DATE</th>
                                                    <th className="pb-3 px-2 font-semibold">DESCRIPTION</th>
                                                    <th className="pb-3 px-2 font-semibold">TYPE</th>
                                                    <th className="pb-3 px-2 font-semibold">AMOUNT</th>
                                                    <th className="pb-3 px-2 font-semibold">STATUS</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {transactions.map((tx) => (
                                                    <tr key={tx.id} className="border-b border-white/10 hover:bg-white/5 transition group">
                                                        <td className="py-4 px-2 text-white/80">{new Date(tx.date).toLocaleString()}</td>
                                                        <td className="py-4 px-2 font-medium">{tx.description}</td>
                                                        <td className="py-4 px-2">
                                                            <span className={`${tx.type === 'DEPOSIT' || (tx.type === 'TRANSFER' && tx.description.includes('from')) ? 'bg-[#166534]' : 'bg-[#991b1b]'} text-white px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider`}>
                                                                {tx.type}
                                                            </span>
                                                        </td>
                                                        <td className={`py-4 px-2 font-bold ${tx.type === 'DEPOSIT' || (tx.type === 'TRANSFER' && tx.description.includes('from')) ? 'text-[#4ade80]' : 'text-rose-400'}`}>
                                                            {tx.type === 'DEPOSIT' || (tx.type === 'TRANSFER' && tx.description.includes('from')) ? '+' : '-'} ${tx.amount.toFixed(2)}
                                                        </td>
                                                        <td className="py-4 px-2"><span className="bg-[#14532d] text-emerald-100 border border-emerald-500/30 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider shadow-sm">SUCCESS</span></td>
                                                    </tr>
                                                ))}
                                                {transactions.length === 0 && (
                                                    <tr><td colSpan={5} className="py-8 text-center text-white/50 italic">No transactions found</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'profile' && userProfile && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h2 className="text-[28px] font-semibold mb-6 flex items-center">Customer Profile</h2>
                                <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-8 max-w-2xl shadow-2xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-300/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
                                    <div className="grid grid-cols-2 gap-8 relative z-10">
                                        <div className="space-y-1">
                                            <p className="text-sm font-bold text-[#93c5fd] tracking-widest uppercase">Full Name</p>
                                            <p className="text-2xl font-semibold">{userProfile.name}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-bold text-[#93c5fd] tracking-widest uppercase">Account Email</p>
                                            <p className="text-2xl font-semibold">{userProfile.email}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-bold text-[#93c5fd] tracking-widest uppercase">Account Number</p>
                                            <p className="text-2xl font-semibold text-white/90 font-mono">089525140</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-bold text-[#93c5fd] tracking-widest uppercase">Member Since</p>
                                            <p className="text-2xl font-semibold text-white/90">Feb 2026</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'ai' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col h-[calc(100vh-140px)]">
                                <h2 className="text-[28px] font-semibold mb-6 flex items-center shrink-0">
                                    AI Assistant
                                </h2>
                                <div className="w-full grow rounded-2xl overflow-hidden border border-white/20 shadow-2xl bg-white/5 backdrop-blur-xl relative">
                                    <div className="absolute inset-0 flex items-center justify-center -z-10">
                                        <div className="w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                    <iframe src="https://coherelabs-tiny-aya.hf.space" width="100%" height="100%" className="w-full h-full relative z-10 rounded-xl" title="AI Agent Dashboard" allow="microphone; camera; midi; geolocation; xr-spatial-tracking"></iframe>
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </main>
    );
}

// Helper components

function SidebarButton({ active, onClick, icon, label, disabled }: { active: boolean, onClick: () => void, icon: string, label: string, disabled?: boolean }) {

    // Icon mapping dictionary
    const icons = {
        'dashboard': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />,
        'deposit': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />,
        'withdraw': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />,
        'transfer': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />,
        'transactions': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
        'profile': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />,
        'ai': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    };

    return (
        <button
            onClick={disabled ? undefined : onClick}
            className={`flex items-center space-x-4 px-5 py-3.5 rounded-xl transition-all text-left relative overflow-hidden group ${active ? 'bg-white/20 shadow-[0_4px_20px_rgba(255,255,255,0.1)] font-bold text-white shadow-inner border border-white/20' : 'text-white/70 hover:bg-white/10 hover:text-white'} ${disabled ? 'opacity-50 cursor-not-allowed hidden md:flex' : ''}`}
        >
            {active && <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full shadow-[0_0_10px_white]"></div>}

            <div className={`w-6 h-6 flex items-center justify-center transition-transform ${active ? 'text-[#93c5fd]' : 'text-white/60 group-hover:text-white'}`}>
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">{icons[icon as keyof typeof icons]}</svg>
            </div>
            <span className="tracking-wide text-[15px]">{label}</span>
        </button>
    )
}

function GlassCard({ title, value, icon }: { title: string, value: string, icon: string }) {

    const iconSvgs = {
        'wallet': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />,
        'bank': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />,
        'card': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    }

    return (
        <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.1)] relative overflow-hidden group hover:bg-white/15 transition-all duration-300">
            {/* Decorative blob inside card */}
            <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-colors"></div>

            <div className="flex items-center space-x-5 relative z-10">
                <div className="w-14 h-14 bg-[#0a4285] rounded-full flex items-center justify-center shadow-inner border border-white/10">
                    <svg className="w-7 h-7 text-[#93c5fd]" fill="none" viewBox="0 0 24 24" stroke="currentColor">{iconSvgs[icon as keyof typeof iconSvgs]}</svg>
                </div>
                <div>
                    <p className="text-[11px] font-bold text-[#93c5fd] tracking-[0.15em] mb-1.5">{title}</p>
                    <p className="text-2xl font-bold tracking-tight text-white">{value}</p>
                </div>
            </div>
        </div>
    )
}

function QuickActionButton({ label, icon, onClick, disabled }: { label: string, icon: string, onClick?: () => void, disabled?: boolean }) {

    const iconSvgs = {
        'arrow-down': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />,
        'arrow-up': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />,
        'transfer': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    }

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`bg-gradient-to-r from-[#0ea5e9] to-[#3b82f6] hover:from-[#38bdf8] hover:to-[#60a5fa] border border-blue-300/30 backdrop-blur-md py-4 px-6 rounded-xl flex items-center justify-center space-x-3 transition-all duration-300 group ${disabled ? 'opacity-50 cursor-not-allowed saturate-50' : 'shadow-[0_4px_20px_rgba(14,165,233,0.3)] hover:shadow-[0_8px_25px_rgba(14,165,233,0.5)] cursor-pointer'}`}
        >
            <div className="bg-white/20 rounded-full p-1 border border-white/20 group-hover:scale-110 transition-transform">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">{iconSvgs[icon as keyof typeof iconSvgs]}</svg>
            </div>
            <span className="font-semibold tracking-wide text-[15px]">{label}</span>
        </button>
    )
}
