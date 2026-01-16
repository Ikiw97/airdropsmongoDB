import React, { useState } from 'react';
import { Shield, FileText, AlertTriangle, X, Github } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Footer = () => {
    const [activeModal, setActiveModal] = useState(null); // 'terms' | 'privacy' | null

    const openModal = (type) => setActiveModal(type);
    const closeModal = () => setActiveModal(null);

    return (
        <footer className="w-full py-4 mt-6 border-t text-sm transition-colors duration-300"
            style={{
                background: 'var(--bg-secondary)',
                borderColor: 'var(--border-primary)',
                color: 'var(--text-secondary)'
            }}>

            <div className="max-w-4xl mx-auto px-4 text-center">
                <div className="flex flex-col items-center gap-1 mb-2 opacity-70">
                    <div className="text-[10px] flex flex-col items-center justify-center gap-0.5 px-4 leading-relaxed">
                        <p className="flex items-center gap-1.5">
                            <AlertTriangle size={10} className="text-orange-500" />
                            <span className="font-bold text-orange-500">DISCLAIMER:</span>
                        </p>
                        <p>Trading crypto involves high risk and possible loss. Educational purposes only, not financial advice</p>
                        <p>You are solely responsible for your decisions. DYOR.</p>
                    </div>

                </div>

                <div className="flex items-center justify-center gap-4 text-[10px] font-medium opacity-80" style={{ color: 'var(--text-secondary)' }}>
                    <span className="text-cyan-500 font-bold">© 2026 Airdrop Tracker</span>
                    <span>·</span>
                    <button onClick={() => openModal('terms')} className="hover:text-cyan-500 transition-colors">
                        Terms
                    </button>
                    <span>·</span>
                    <button onClick={() => openModal('privacy')} className="hover:text-cyan-500 transition-colors">
                        Privacy
                    </button>
                </div>
            </div>

            {/* MODALS */}
            <AnimatePresence>
                {activeModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={closeModal}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-[#0d1117] rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col border border-gray-200 dark:border-gray-800"
                        >
                            {/* Header */}
                            <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-[#161b22]">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                    {activeModal === 'terms' ? <FileText className="text-cyan-500" /> : <Shield className="text-green-500" />}
                                    {activeModal === 'terms' ? 'Terms of Service' : 'Privacy Policy'}
                                </h2>
                                <button onClick={closeModal} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition">
                                    <X size={20} className="text-gray-500" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-6 overflow-y-auto text-sm text-gray-600 dark:text-gray-300 leading-relaxed space-y-4">
                                {activeModal === 'terms' ? (
                                    <>
                                        <p><strong>1. Acceptance of Terms</strong><br />By accessing styling and using this platform, you agree to comply with and be bound by these Terms of Service.</p>
                                        <p><strong>2. No Financial Advice</strong><br />All content provided on Airdrop Tracker is for informational purposes only. We do not provide financial, investment, or legal advice.</p>
                                        <p><strong>3. Use of Service</strong><br />You agree to use this platform only for lawful purposes. You are prohibited from using the tool to violate any local, state, national, or international laws.</p>
                                        <p><strong>4. Limitation of Liability</strong><br />Airdrop Tracker shall not be held liable for any direct, indirect, incidental, or consequential damages resulting from the use or inability to use our services, including but not limited to loss of funds.</p>
                                    </>
                                ) : (
                                    <>
                                        <p><strong>1. Data Collection</strong><br />We prioritize your privacy. We do not store your private keys, seed phrases, or sensitive wallet information on our servers. All wallet interactions occur locally on your device or via secure third-party providers (e.g., Alchemy, CoinGecko).</p>
                                        <p><strong>2. Local Storage</strong><br />Some preferences (like themes, watchlists) may be stored in your browser's Local Storage for your convenience.</p>
                                        <p><strong>3. Third-Party Services</strong><br />Our app integrates with third-party APIs (like CoinGecko). Their privacy policies differ from ours, and we encourage you to review them.</p>
                                        <p><strong>4. Security</strong><br />While we strive to use commercially acceptable means to protect your data, remember that no method of transmission over the internet is 100% secure.</p>
                                    </>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#161b22] text-right">
                                <button onClick={closeModal} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-xs font-semibold transition">
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </footer>
    );
};

export default Footer;
