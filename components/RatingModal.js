'use client';
import { useState, useRef } from 'react';
import StarRating from './StarRating';
import { saveRating } from '@/lib/data';
import { compressImage, formatFileSize } from '@/lib/imageUtils';
import { X, Camera, ImageIcon, Loader2 } from 'lucide-react';

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export default function RatingModal({ isOpen, onClose, hospitalId, hospitalName }) {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [originalSize, setOriginalSize] = useState(0);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [fileError, setFileError] = useState('');
    const [isCompressing, setIsCompressing] = useState(false);
    const [uploadProgress, setUploadProgress] = useState('');
    const fileInputRef = useRef(null);

    if (!isOpen) return null;

    const handleFileSelect = async (e) => {
        const file = e.target.files?.[0];
        setFileError('');
        if (!file) {
            setSelectedFile(null);
            setPreviewUrl(null);
            setOriginalSize(0);
            return;
        }
        if (file.type === 'image/heic' || file.type === 'image/heif') {
            setFileError('HEIC format not supported. Please upload a JPG/PNG.');
            setSelectedFile(null);
            setPreviewUrl(null);
            e.target.value = '';
            return;
        }
        if (!ALLOWED_TYPES.includes(file.type)) {
            setFileError('Only JPG, PNG, and WebP images are allowed.');
            setSelectedFile(null);
            setPreviewUrl(null);
            e.target.value = '';
            return;
        }
        if (file.size > MAX_FILE_SIZE) {
            setFileError(`File too large (${formatFileSize(file.size)}). Maximum is 10MB.`);
            setSelectedFile(null);
            setPreviewUrl(null);
            e.target.value = '';
            return;
        }
        setIsCompressing(true);
        setOriginalSize(file.size);
        try {
            const compressed = await compressImage(file);
            setSelectedFile(compressed);
            const reader = new FileReader();
            reader.onload = (ev) => setPreviewUrl(ev.target.result);
            reader.readAsDataURL(compressed);
        } catch (err) {
            console.error('Compression failed:', err);
            setFileError('Failed to process image. Try a different file.');
            setSelectedFile(null);
            setPreviewUrl(null);
        } finally {
            setIsCompressing(false);
        }
    };

    const removePhoto = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setOriginalSize(0);
        setFileError('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = async (formData) => {
        if (rating === 0) {
            alert("Please select a star rating");
            return;
        }
        setIsSubmitting(true);
        let imageUrl = null;
        try {
            if (selectedFile) {
                setUploadProgress('Uploading photo...');
                const uploadData = new FormData();
                uploadData.append('file', selectedFile);
                const uploadRes = await fetch('/api/upload', { method: 'POST', body: uploadData });
                if (!uploadRes.ok) {
                    const err = await uploadRes.json();
                    throw new Error(err.error || 'Failed to upload photo');
                }
                const { url } = await uploadRes.json();
                imageUrl = url;
            }
            setUploadProgress('Saving review...');
            const comment = formData.get('comment');
            const name = formData.get('name');
            const reviewRes = await fetch('/api/review', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ hospitalId, rating, comment, name, imageUrl }),
            });
            if (!reviewRes.ok) {
                const result = saveRating(hospitalId, rating, comment, name, imageUrl);
                if (!result) throw new Error('Failed to save review');
            }
            setRating(0);
            setSelectedFile(null);
            setPreviewUrl(null);
            setOriginalSize(0);
            setFileError('');
            setUploadProgress('');
            onClose();
        } catch (err) {
            console.error('Submit error:', err);
            alert(err.message || 'Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
            setUploadProgress('');
        }
    };

    const ratingLabels = ['', 'Pray before eating', 'Pack snacks', 'It did the job', 'Would eat again', 'Shockingly good'];

    const savedPercent = selectedFile && originalSize > 0
        ? Math.round((1 - selectedFile.size / originalSize) * 100)
        : 0;

    return (
        <div
            className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm z-[1000] flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl border border-zinc-200 shadow-2xl w-full max-w-md p-6 relative flex flex-col max-h-[90vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 p-1.5 rounded-lg transition-all"
                    aria-label="Close modal"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="mb-5">
                    <h2 className="text-lg font-bold text-zinc-900 mb-0.5 pr-8">Rate the Dining</h2>
                    <p className="text-zinc-400 text-sm">
                        How was the food at <span className="font-medium text-zinc-600">{hospitalName}</span>?
                    </p>
                </div>

                <form action={handleSubmit} className="space-y-4">
                    <div className="bg-zinc-50 rounded-xl p-4 border border-zinc-100 text-center">
                        <div className="mb-2">
                            <StarRating
                                rating={rating}
                                setRating={setRating}
                                hoverRating={hoverRating}
                                setHoverRating={setHoverRating}
                                size={32}
                            />
                        </div>
                        <div className={`text-xs font-semibold uppercase tracking-wider ${rating ? 'text-amber-500' : 'text-zinc-300'}`}>
                            {rating ? ratingLabels[rating] : 'Tap a star'}
                        </div>
                    </div>

                    {/* Photo Upload */}
                    <div>
                        <label className="block text-xs font-semibold text-zinc-600 mb-1.5">
                            Food Photo <span className="text-zinc-300 font-normal">(optional)</span>
                        </label>
                        {isCompressing ? (
                            <div className="w-full border border-dashed border-zinc-200 rounded-lg p-5 flex flex-col items-center gap-1.5">
                                <Loader2 className="w-5 h-5 text-zinc-400 animate-spin" />
                                <span className="text-xs text-zinc-400">Optimizing...</span>
                            </div>
                        ) : !previewUrl ? (
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full border border-dashed border-zinc-200 hover:border-brand-300 rounded-lg p-5 flex flex-col items-center gap-1.5 transition-all hover:bg-brand-50/30 group cursor-pointer"
                            >
                                <Camera className="w-5 h-5 text-zinc-300 group-hover:text-brand-500 transition-colors" />
                                <span className="text-sm text-zinc-400 group-hover:text-zinc-600 font-medium">Add a photo</span>
                                <span className="text-[10px] text-zinc-300 uppercase tracking-wider font-semibold">JPG, PNG, WebP</span>
                            </button>
                        ) : (
                            <div className="relative rounded-lg overflow-hidden border border-zinc-200">
                                <img src={previewUrl} alt="Preview" className="w-full h-40 object-cover" />
                                <button
                                    type="button"
                                    onClick={removePhoto}
                                    className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-md transition-colors"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                                <div className="px-3 py-1.5 flex items-center gap-2 text-xs text-zinc-400 bg-zinc-50 border-t border-zinc-100">
                                    <ImageIcon className="w-3 h-3 shrink-0" />
                                    <span className="truncate">{selectedFile?.name}</span>
                                    <span className="ml-auto shrink-0">{formatFileSize(selectedFile?.size || 0)}</span>
                                    {savedPercent > 0 && (
                                        <span className="text-emerald-600 font-semibold text-[10px]">-{savedPercent}%</span>
                                    )}
                                </div>
                            </div>
                        )}
                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                        {fileError && (
                            <div className="mt-1.5 text-xs text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-1.5">
                                {fileError}
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-zinc-600 mb-1.5">
                            Name <span className="text-zinc-300 font-normal">(optional)</span>
                        </label>
                        <input
                            name="name"
                            type="text"
                            placeholder="e.g. Anonymous Foodie"
                            className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-200 focus-ring text-sm text-zinc-800 placeholder-zinc-400"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-zinc-600 mb-1.5">
                            Review <span className="text-zinc-300 font-normal">(optional)</span>
                        </label>
                        <textarea
                            name="comment"
                            placeholder="What did you eat? Would you recommend it?"
                            rows={3}
                            className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-200 focus-ring text-sm text-zinc-800 placeholder-zinc-400 resize-none"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting || isCompressing}
                        className="w-full bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 text-white font-semibold py-3 px-4 rounded-lg text-sm transition-all active:scale-[0.98]"
                    >
                        {isSubmitting ? (
                            <span className="inline-flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                {uploadProgress || 'Submitting...'}
                            </span>
                        ) : 'Submit Review'}
                    </button>
                </form>
            </div>
        </div>
    );
}
