import React, { useState, useEffect, useRef } from "react";
import { Send, Image, RefreshCw, MessageSquare, X, Upload, Smile, Reply, Trash2, Search } from "lucide-react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import EmojiPicker from "emoji-picker-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8001";

const CommunityChat = ({ user }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [imageUploadLoading, setImageUploadLoading] = useState(false);
    const [showEmoji, setShowEmoji] = useState(false);
    const [replyingTo, setReplyingTo] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [showSearch, setShowSearch] = useState(false);
    const [highlightedMessageId, setHighlightedMessageId] = useState(null);
    const [isAtBottom, setIsAtBottom] = useState(true);
    const messagesEndRef = useRef(null);
    const scrollContainerRef = useRef(null);
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

        const interval = setInterval(() => {
            // Only poll if document is visible
            if (document.visibilityState === 'visible') {
                fetchMessages();
            }
        }, 5000); // Poll every 5 seconds

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (!highlightedMessageId && !searchTerm && isAtBottom) {
            scrollToBottom();
        }
    }, [messages, highlightedMessageId, searchTerm, isAtBottom]);

    // Handle scroll to detect if user is at bottom
    const handleScroll = () => {
        if (scrollContainerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
            // Check if user is near bottom (within 20px)
            const isBottom = scrollHeight - scrollTop - clientHeight < 50;
            setIsAtBottom(isBottom);
        }
    };

    // Scroll to highlighted message
    useEffect(() => {
        if (highlightedMessageId) {
            const element = document.getElementById(`msg-${highlightedMessageId}`);
            if (element) {
                element.scrollIntoView({ behavior: "smooth", block: "center" });
                // Clear highlight after animation
                setTimeout(() => setHighlightedMessageId(null), 2000);
            }
        }
    }, [highlightedMessageId, messages]);

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

            const replyPayload = replyingTo ? {
                id: replyingTo._id,
                username: replyingTo.username,
                message: replyingTo.message,
                image_url: replyingTo.image_url
            } : null;

            await axios.post(
                `${API_URL}/api/community/messages`,
                {
                    message: newMessage,
                    image_url: imageUrl,
                    replyTo: replyPayload
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setNewMessage("");
            setSelectedImage(null);
            setReplyingTo(null);
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

    // Delete Message
    const handleDeleteMessage = async (messageId) => {
        if (!confirm("Are you sure you want to delete this message?")) return;

        try {
            const token = localStorage.getItem("token");
            await axios.delete(`${API_URL}/api/community/messages/${messageId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Optimistic update
            setMessages(prev => prev.filter(m => m._id !== messageId));

        } catch (error) {
            console.error("Failed to delete message", error);
            alert("Failed to delete message");
        }
    };

    const formatTime = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Filter messages
    const filteredMessages = messages.filter(msg => {
        if (!searchTerm) return true;
        return msg.message && msg.message.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const handleJumpToMessage = (messageId) => {
        setSearchTerm(""); // Clear search to show all messages
        setShowSearch(false); // Close search bar
        setHighlightedMessageId(messageId); // Set ID to scroll to
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
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => {
                            setShowSearch(!showSearch);
                            if (showSearch) setSearchTerm("");
                        }}
                        className={`p-2 rounded-full hover:bg-[var(--bg-tertiary)] transition ${showSearch ? 'text-indigo-400 bg-indigo-500/10' : 'text-[var(--text-secondary)]'}`}
                        title="Search Messages"
                    >
                        <Search size={18} />
                    </button>
                    <button
                        onClick={fetchMessages}
                        className="p-2 rounded-full hover:bg-[var(--bg-tertiary)] transition text-[var(--text-secondary)]"
                        title="Refresh Messages"
                    >
                        <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <AnimatePresence>
                {showSearch && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden bg-[var(--bg-secondary)] border-b border-[var(--border-primary)]"
                    >
                        <div className="p-2">
                            <div className="flex items-center gap-2 bg-[var(--bg-tertiary)] rounded-lg px-3 py-2 border border-[var(--border-primary)]">
                                <Search size={14} className="text-gray-500" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search messages..."
                                    className="bg-transparent border-none outline-none text-sm w-full text-[var(--text-primary)] placeholder-gray-500"
                                    autoFocus
                                />
                                {searchTerm && (
                                    <button onClick={() => setSearchTerm("")} className="text-gray-500 hover:text-white">
                                        <X size={14} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Messages Area */}
            <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent"
            >
                {messages.length === 0 && !isLoading && (
                    <div className="text-center text-gray-500 mt-10">
                        <p className="mb-2">No messages yet.</p>
                        <p className="text-sm">Be the first to say hello! 👋</p>
                    </div>
                )}

                {filteredMessages.map((msg) => {
                    const isMe = msg.user_id === user.id;
                    return (
                        <motion.div
                            key={msg._id}
                            id={`msg-${msg._id}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{
                                opacity: 1,
                                y: 0,
                                backgroundColor: highlightedMessageId === msg._id ? "rgba(99, 102, 241, 0.2)" : "transparent"
                            }}
                            className={`flex ${isMe ? "justify-end" : "justify-start"} group p-2 rounded-lg transition-colors duration-500 ${searchTerm ? 'cursor-pointer hover:bg-white/5' : ''}`}
                            onClick={() => searchTerm && handleJumpToMessage(msg._id)}
                        >
                            <div className={`max-w-[75%] md:max-w-[60%] flex flex-col ${isMe ? "items-end" : "items-start"}`}>

                                {/* User Name & Avatar */}
                                {!isMe && (
                                    <div className="flex items-center gap-2 mb-1 ml-1">
                                        {msg.user_photo ? (
                                            <img src={msg.user_photo} alt={msg.username} className="w-5 h-5 rounded-full object-cover" />
                                        ) : (
                                            <div className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center">
                                                <span className="text-[10px] text-indigo-400 font-bold">{msg.username.charAt(0).toUpperCase()}</span>
                                            </div>
                                        )}
                                        <span className="text-xs text-[var(--text-secondary)] font-semibold">
                                            {msg.username}
                                        </span>
                                    </div>
                                )}

                                {/* Message Bubble */}
                                <div
                                    className={`p-3 rounded-2xl ${isMe
                                        ? "bg-indigo-600 text-white rounded-br-none"
                                        : "bg-[var(--bg-tertiary)] text-[var(--text-primary)] rounded-bl-none border border-[var(--border-primary)]"
                                        }`}
                                >
                                    {/* Reply Context */}
                                    {msg.replyTo && (
                                        <div className={`mb-2 p-2 rounded text-xs border-l-2 ${isMe ? "bg-white/10 border-white/50" : "bg-black/20 border-indigo-500"}`}>
                                            <p className={`font-bold ${isMe ? "text-white/80" : "text-indigo-400"}`}>{msg.replyTo.username}</p>
                                            <p className="truncate opacity-80">{msg.replyTo.message || "📷 Image"}</p>
                                        </div>
                                    )}

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

                                {/* Time & Actions */}
                                <div className={`flex items-center gap-2 mt-1 px-1 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                                    <span className="text-[10px] text-gray-500">
                                        {formatTime(msg.created_at)}
                                    </span>
                                    <button
                                        onClick={() => setReplyingTo(msg)}
                                        className="text-gray-500 hover:text-indigo-400 transition opacity-0 group-hover:opacity-100 focus:opacity-100"
                                        title="Reply"
                                    >
                                        <Reply size={14} />
                                    </button>
                                    {isMe && (
                                        <button
                                            onClick={() => handleDeleteMessage(msg._id)}
                                            className="text-gray-500 hover:text-red-400 transition opacity-0 group-hover:opacity-100 focus:opacity-100"
                                            title="Delete"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Reply Indicator */}
            <AnimatePresence>
                {replyingTo && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="px-4 py-2 border-t border-[var(--border-primary)] bg-[var(--bg-secondary)] flex items-center justify-between"
                    >
                        <div className="flex flex-col text-sm border-l-2 border-indigo-500 pl-2">
                            <span className="text-indigo-400 font-semibold">Replying to {replyingTo.username}</span>
                            <span className="text-[var(--text-secondary)] truncate max-w-[200px]">
                                {replyingTo.message || "📷 Image"}
                            </span>
                        </div>
                        <button
                            onClick={() => setReplyingTo(null)}
                            className="p-1 hover:bg-red-500/20 text-red-400 rounded-full transition"
                        >
                            <X size={16} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

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
            <form onSubmit={handleSendMessage} className="p-4 border-t border-[var(--border-primary)] bg-[var(--bg-secondary)]/50 relative">
                {/* Emoji Picker */}
                <AnimatePresence>
                    {showEmoji && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 10 }}
                            className="absolute bottom-20 left-4 z-50 shadow-2xl rounded-xl overflow-hidden border border-[var(--border-primary)]"
                        >
                            <EmojiPicker
                                theme="dark"
                                onEmojiClick={(emojiData) => {
                                    setNewMessage(prev => prev + emojiData.emoji);
                                    // setShowEmoji(false); 
                                }}
                                width={300}
                                height={400}
                                searchDisabled
                                previewConfig={{ showPreview: false }}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

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

                    {/* Emoji Toggle Button */}
                    <button
                        type="button"
                        onClick={() => setShowEmoji(!showEmoji)}
                        className={`p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-primary)] transition ${showEmoji ? "text-yellow-400 border-yellow-400/50 bg-yellow-400/10" : "text-[var(--text-secondary)] hover:text-yellow-400 hover:bg-yellow-400/10"
                            }`}
                        disabled={isSending}
                    >
                        <Smile size={20} />
                    </button>

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
