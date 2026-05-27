'use client';
import { useState, useRef, useEffect } from 'react';
import StarRating from './StarRating';
import { saveRating } from '@/lib/data';
import { compressImage, formatFileSize } from '@/lib/imageUtils';
import { X, Camera, ImageIcon, Loader2, Sparkles } from 'lucide-react';

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export default function RatingModal({ isOpen, onClose, hospitalId, hospitalName }) {
    const [rating, setRating]                 = useState(0);
    const [hoverRating, setHoverRating]       = useState(0);
    const [isSubmitting, setIsSubmitting]     = useState(false);
    const [selectedFile, setSelectedFile]     = useState(null);
    const [originalSize, setOriginalSize]     = useState(0);
    const [previewUrl, setPreviewUrl]         = useState(null);
    const [fileError, setFileError]           = useState('');
    const [isCompressing, setIsCompressing]   = useState(false);
    const [uploadProgress, setUploadProgress] = useState('');
    const fileInputRef = useRef(null);

    // Esc to close + body scroll lock
    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', onKey);
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = prev;
        };
    }, [isOpen, onClose]);

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
            setFileError('HEIC format isn’t supported yet. Try a JPG or PNG.');
            setSelectedFile(null);
            setPreviewUrl(null);
            e.target.value = '';
            return;
        }
        if (!ALLOWED_TYPES.includes(file.type)) {
            setFileError('Only JPG, PNG, and WebP are allowed.');
            setSelectedFile(null);
            setPreviewUrl(null);
            e.target.value = '';
            return;
        }
        if (file.size > MAX_FILE_SIZE) {
            setFileError(`That file is ${formatFileSize(file.size)}. Max is 10MB.`);
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
            setFileError('Couldn’t process that image. Try a different one.');
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
            alert("Please pick a star rating first.");
            return;
        }
        setIsSubmitting(true);
        let imageUrl = null;
        try {
            if (selectedFile) {
                setUploadProgress('Uploading photo…');
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
            setUploadProgress('Saving review…');
            const comment = formData.get('comment');
            const name    = formData.get('name');
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
    const ratingColors = ['', 'text-red-600', 'text-orange-600', 'text-honey-600', 'text-emerald-600', 'text-emerald-700'];

    const savedPercent = selectedFile && originalSize > 0
        ? Math.round((1 - selectedFile.size / originalSize) * 100)
        : 0;

    return (
        <div
            className="fixed inset-0 bg-ink-900/50 backdrop-blur-sm z-[1000] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-up"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="rating-modal-title"
        >
            <div
                className="bg-cream-50 rounded-t-3xl sm:rounded-3xl border border-cream-300 shadow-warm-xl w-full sm:max-w-md p-6 relative flex flex-col max-h-[92vh] overflow-y-auto animate-pop"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-ink-400 hover:text-ink-700 hover:bg-cream-200/60 p-2 rounded-full transition-all"
                    aria-label="Close"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="mb-5 pr-10">
                    <div className="inline-flex items-center gap-1.5 bg-brand-50 text-brand-700 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider mb-2">
                        <Sparkles className="w-3 h-3" />
                        Rate the dining
                    </div>
                    <h2 id="rating-modal-title" className="font-display text-2xl font-semibold text-ink-900 leading-tight">
                        How was the food?
                    </h2>
                    <p className="text-ink-500 text-[14px] mt-1">
                        Tell us about your meal at <span className="font-semibold text-ink-700">{hospitalName}</span>.
                    </p>
                </div>

                <form action={handleSubmit} className="space-y-4">

                    {/* Star rating */}
                    <div className="bg-cream-100 rounded-2xl p-5 border border-cream-300/70 text-center">
                        <div className="mb-2.5">
                            <StarRating
                                rating={rating}
                                setRating={setRating}
                                hoverRating={hoverRating}
                                setHoverRating={setHoverRating}
                                size={36}
                            />
                        </div>
                        <div className={`text-[12px] font-bold uppercase tracking-wider ${rating ? ratingColors[hoverRating || rating] : 'text-ink-300'}`}>
                            {(hoverRating || rating) ? ratingLabels[hoverRating || rating] : 'Tap a star'}
                        </div>
                    </div>

                    {/* Photo upload */}
                    <div>
                        <label className="block text-[12px] font-semibold text-ink-700 mb-1.5">
                            Food Photo <span className="text-ink-400 font-normal">(optional)</span>
                        </label>
                        {isCompressing ? (
                            <div className="w-full border border-dashed border-cream-400 rounded-xl p-5 flex flex-col items-center gap-1.5 bg-cream-100">
                                <Loader2 className="w-5 h-5 text-ink-400 animate-spin" />
                                <span className="text-xs text-ink-500">Optimizing…</span>
                            </div>
                        ) : !previewUrl ? (
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full border-2 border-dashed border-cream-400 hover:border-brand-400 rounded-xl p-5 flex flex-col items-center gap-2 transition-all hover:bg-brand-50/40 group cursor-pointer"
                            >
                                <div className="w-10 h-10 rounded-full bg-cream-200 group-hover:bg-brand-100 flex items-center justify-center transition-colors">
                                    <Camera className="w-5 h-5 text-ink-500 group-hover:text-brand-600 transition-colors" />
                                </div>
                                <span className="text-sm text-ink-700 group-hover:text-ink-900 font-semibold">Add a photo</span>
                                <span className="text-[10px] text-ink-400 uppercase tracking-wider font-semibold">JPG · PNG · WebP</span>
                            </button>
                        ) : (
                            <div className="relative rounded-xl overflow-hidden border border-cream-300">
                                <img src={previewUrl} alt="Food preview" className="w-full h-44 object-cover" />
                                <button
                                    type="button"
                                    onClick={removePhoto}
                                    className="absolute top-2 right-2 bg-ink-900/70 hover:bg-ink-900 text-white p-1.5 rounded-lg transition-colors backdrop-blur-sm"
                                    aria-label="Remove photo"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                                <div className="px-3 py-2 flex items-center gap-2 text-xs text-ink-500 bg-cream-100 border-t border-cream-200">
                                    <ImageIcon className="w-3 h-3 shrink-0" />
                                    <span className="truncate font-medium">{selectedFile?.name}</span>
                                    <span className="ml-auto shrink-0">{formatFileSize(selectedFile?.size || 0)}</span>
                                    {savedPercent > 0 && (
                                        <span className="text-emerald-600 font-bold text-[10px]">-{savedPercent}%</span>
                                    )}
                                </div>
                            </div>
                        )}
                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                        {fileError && (
                            <div role="alert" className="mt-1.5 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                                {fileError}
                            </div>
                        )}
                    </div>

                    {/* Name */}
                    <div>
                        <label htmlFor="reviewer-name" className="block text-[12px] font-semibold text-ink-700 mb-1.5">
                            Your Name <span className="text-ink-400 font-normal">(optional)</span>
                        </label>
                        <input
                            id="reviewer-name"
                            name="name"
                            type="text"
                            placeholder="e.g. Anonymous Foodie"
                            className="w-full px-3.5 py-3 rounded-xl border border-cream-300 bg-cream-50 focus-ring text-[14px] text-ink-800 placeholder-ink-300"
                        />
                    </div>

                    {/* Review */}
                    <div>
                        <label htmlFor="review-comment" className="block text-[12px] font-semibold text-ink-700 mb-1.5">
                            Your Review <span className="text-ink-400 font-normal">(optional)</span>
                        </label>
                        <textarea
                            id="review-comment"
                            name="comment"
                            placeholder="What did you eat? Would you recommend it?"
                            rows={3}
                            className="w-full px-3.5 py-3 rounded-xl border border-cream-300 bg-cream-50 focus-ring text-[14px] text-ink-800 placeholder-ink-300 resize-none"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting || isCompressing}
                        className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3.5 px-4 rounded-xl text-[15px] transition-all active:scale-[0.98] shadow-warm hover:shadow-warm-md mt-2"
                    >
                        {isSubmitting ? (
                            <span className="inline-flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                {uploadProgress || 'Submitting…'}
                            </span>
                        ) : 'Submit Review'}
                    </button>
                </form>
            </div>
        </div>
    );
}
