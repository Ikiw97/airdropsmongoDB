import React, { useState, useEffect, useRef } from "react";
import { Send, Image, RefreshCw, MessageSquare, X, Upload } from "lucide-react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8001";

const CommunityChat = ({ user }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [imageUploadLoading, setImageUploadLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    // Auto-scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Fetch messages
    const fetchMessages = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const response = await axios.get(`${API_URL}/api/community/messages`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessages(response.data);
        } catch (error) {
            console.error("Failed to fetch messages", error);
        }
    };

    // Initial fetch and polling
    useEffect(() => {
        setIsLoading(true);
        fetchMessages().finally(() => setIsLoading(false));

        const interval = setInterval(fetchMessages, 5000); // Poll every 5 seconds
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Handle Image Selection
    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { // 2MB Limit to avoid serverless payload issues
                alert("Image size too large (max 2MB)");
                return;
            }
            setSelectedImage(file);
        }
    };

    // Upload Image to ImgBB via Backend Proxy
    const uploadImage = async (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                try {
                    const base64Image = reader.result;
                    const token = localStorage.getItem("token");

                    const response = await axios.post(
                        `${API_URL}/api/upload/image`,
                        { image: base64Image },
                        { headers: { Authorization: `Bearer ${token}` } }
                    );

                    if (response.data && response.data.url) {
                        resolve(response.data.url);
                    } else {
                        reject("Upload failed");
                    }
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = (error) => reject(error);
        });
    };

    // Send Message
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if ((!newMessage.trim() && !selectedImage) || isSending) return;

        setIsSending(true);
        setImageUploadLoading(!!selectedImage);

        try {
            const token = localStorage.getItem("token");
            let imageUrl = null;

            // Upload image first if exists
            if (selectedImage) {
                imageUrl = await uploadImage(selectedImage);
            }

            await axios.post(
                `${API_URL}/api/community/messages`,
                {
                    message: newMessage,
                    image_url: imageUrl
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setNewMessage("");
            setSelectedImage(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
            fetchMessages();
        } catch (error) {
            console.error("Failed to send message", error);
            alert("Failed to send message. Please try again.");
        } finally {
            setIsSending(false);
            setImageUploadLoading(false);
        }
    };

    // Format Time
    const formatTime = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="h-full flex flex-col rounded-xl overflow-hidden shadow-2xl transition-all duration-300 relative border border-[var(--border-primary)]"
            style={{ background: "rgba(10, 10, 15, 0.45)", backdropFilter: "blur(10px)" }}>

            {/* Header */}
            <div className="p-4 border-b border-[var(--border-primary)] flex items-center justify-between bg-[var(--bg-secondary)]/50">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
                        <MessageSquare size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-[var(--text-primary)]">Community Chat</h2>
                        <p className="text-xs text-[var(--text-secondary)]">Discuss crypto & airdrops</p>
                    </div>
                </div>
                <button
                    onClick={fetchMessages}
                    className="p-2 rounded-full hover:bg-[var(--bg-tertiary)] transition text-[var(--text-secondary)]"
                    title="Refresh Messages"
                >
                    <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                {messages.length === 0 && !isLoading && (
                    <div className="text-center text-gray-500 mt-10">
                        <p className="mb-2">No messages yet.</p>
                        <p className="text-sm">Be the first to say hello! 👋</p>
                    </div>
                )}

                {messages.map((msg) => {
                    const isMe = msg.user_id === user.id;
                    return (
                        <motion.div
                            key={msg._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                        >
                            <div className={`max-w-[75%] md:max-w-[60%] flex flex-col ${isMe ? "items-end" : "items-start"}`}>

                                {/* User Name */}
                                {!isMe && (
                                    <span className="text-xs text-[var(--text-secondary)] mb-1 ml-1 font-semibold">
                                        {msg.username}
                                    </span>
                                )}

                                {/* Message Bubble */}
                                <div
                                    className={`p-3 rounded-2xl ${isMe
                                        ? "bg-indigo-600 text-white rounded-br-none"
                                        : "bg-[var(--bg-tertiary)] text-[var(--text-primary)] rounded-bl-none border border-[var(--border-primary)]"
                                        }`}
                                >
                                    {/* Image */}
                                    {msg.image_url && (
                                        <div className="mb-2 rounded-lg overflow-hidden cursor-pointer" onClick={() => setPreviewImage(msg.image_url)}>
                                            <img
                                                src={msg.image_url}
                                                alt="Shared content"
                                                className="max-w-full h-auto max-h-60 object-cover hover:scale-105 transition duration-300"
                                                loading="lazy"
                                            />
                                        </div>
                                    )}

                                    {/* Text */}
                                    {msg.message && <p className="whitespace-pre-wrap break-words text-sm">{msg.message}</p>}
                                </div>

                                {/* Time */}
                                <span className="text-[10px] text-gray-500 mt-1 px-1">
                                    {formatTime(msg.created_at)}
                                </span>
                            </div>
                        </motion.div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Image Preview & Upload Indicator */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="px-4 py-2 border-t border-[var(--border-primary)] bg-[var(--bg-secondary)] flex items-center justify-between"
                    >
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded overflow-hidden relative group">
                                <img
                                    src={URL.createObjectURL(selectedImage)}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center">
                                    <Upload size={14} className="text-white" />
                                </div>
                            </div>
                            <div className="text-sm">
                                <p className="text-[var(--text-primary)] font-medium truncate max-w-[150px]">{selectedImage.name}</p>
                                <p className="text-xs text-[var(--text-secondary)]">{(selectedImage.size / 1024).toFixed(1)} KB</p>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                setSelectedImage(null);
                                if (fileInputRef.current) fileInputRef.current.value = "";
                            }}
                            className="p-1 hover:bg-red-500/20 text-red-400 rounded-full transition"
                        >
                            <X size={16} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-[var(--border-primary)] bg-[var(--bg-secondary)]/50">
                <div className="flex items-end gap-2">
                    {/* Image Upload Button */}
                    <div className="relative">
                        <input
                            type="file"
                            ref={fileInputRef}
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageSelect}
                            disabled={isSending}
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="p-3 rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-indigo-400 hover:bg-indigo-500/10 border border-[var(--border-primary)] transition disabled:opacity-50"
                            disabled={isSending}
                        >
                            <Image size={20} />
                        </button>
                    </div>

                    {/* Text Input */}
                    <div className="flex-1 relative">
                        <textarea
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder={imageUploadLoading ? "Uploading image..." : "Type a message..."}
                            className="w-full bg-[var(--bg-tertiary)] text-[var(--text-primary)] rounded-xl px-4 py-3 pr-10 outline-none border border-[var(--border-primary)] focus:border-indigo-500 transition resize-none h-[46px] max-h-[120px] scrollbar-hide"
                            disabled={isSending}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage(e);
                                }
                            }}
                        />
                    </div>

                    {/* Send Button */}
                    <button
                        type="submit"
                        disabled={(!newMessage.trim() && !selectedImage) || isSending}
                        className="p-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition disabled:opacity-50 flex items-center justify-center w-[46px]"
                    >
                        {isSending ? (
                            <RefreshCw size={20} className="animate-spin" />
                        ) : (
                            <Send size={20} />
                        )}
                    </button>
                </div>
            </form>

            {/* Full Image Preview Modal */}
            <AnimatePresence>
                {previewImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
                        onClick={() => setPreviewImage(null)}
                    >
                        <div className="relative max-w-4xl max-h-[90vh]">
                            <img
                                src={previewImage}
                                alt="Full preview"
                                className="max-w-full max-h-[90vh] rounded-lg shadow-2xl"
                            />
                            <button
                                onClick={() => setPreviewImage(null)}
                                className="absolute -top-4 -right-4 bg-white text-black p-2 rounded-full hover:bg-gray-200 transition"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CommunityChat;
