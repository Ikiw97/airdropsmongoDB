import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Save, User, Camera, AlertCircle } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8001";

const EditProfileModal = ({ user, onClose, onUpdateUser }) => {
    const [username, setUsername] = useState(user?.username || '');
    const [selectedImage, setSelectedImage] = useState(null);
    const [previewImage, setPreviewImage] = useState(user?.photo_url || null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { // 2MB Limit
                setError("Image size too large (max 2MB)");
                return;
            }
            setSelectedImage(file);
            setPreviewImage(URL.createObjectURL(file));
            setError('');
        }
    };

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const token = localStorage.getItem("token");
            let photoUrl = user.photo_url;

            if (selectedImage) {
                try {
                    photoUrl = await uploadImage(selectedImage);
                } catch (uploadError) {
                    setError("Failed to upload image. Please try again.");
                    setIsLoading(false);
                    return;
                }
            }

            const response = await axios.put(
                `${API_URL}/api/auth/update-profile`,
                {
                    username,
                    photo_url: photoUrl
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            onUpdateUser(response.data.user);
            onClose();
        } catch (err) {
            console.error("Profile update failed", err);
            setError(err.response?.data?.detail || "Failed to update profile");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-[#1a1b26] border border-gray-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
            >
                {/* Header */}
                <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <User className="text-indigo-400" size={20} />
                        Edit Profile
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition p-1 hover:bg-white/10 rounded-full"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Error Message */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, height: 0 }}
                                className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg text-sm flex items-center gap-2"
                            >
                                <AlertCircle size={16} />
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Avatar Upload */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-indigo-500/50 group-hover:border-indigo-400 transition shadow-lg shadow-indigo-500/20">
                                {previewImage ? (
                                    <img src={previewImage} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-500">
                                        <User size={40} />
                                    </div>
                                )}
                            </div>
                            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition backdrop-blur-[1px]">
                                <Camera className="text-white" size={24} />
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageSelect}
                                accept="image/*"
                                className="hidden"
                            />
                        </div>
                        <p className="text-xs text-gray-400">Click to change avatar (Max 2MB)</p>
                    </div>

                    {/* Username Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition"
                            placeholder="Enter username"
                            minLength={3}
                            maxLength={20}
                            required
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl font-medium transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Save size={18} />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};

export default EditProfileModal;
