'use client';
import { useState, useRef, useEffect } from 'react';
import StarRating from './StarRating';
import { getRatingTone } from '@/lib/ratingTone';
import { compressImage, formatFileSize } from '@/lib/imageUtils';
import { X, Camera, ImageIcon, Loader2, Sparkles, PartyPopper } from 'lucide-react';

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export default function RatingModal({ isOpen, onClose, hospitalId, hospitalName }) {
    const [rating, setRating]                 = useState(0);
    const [hoverRating, setHoverRating]       = useState(0);
    const [starError, setStarError]           = useState(false);
    const [isSubmitting, setIsSubmitting]     = useState(false);
    const [submitError, setSubmitError]       = useState('');
    const [succeeded, setSucceeded]           = useState(false);
    const [selectedFile, setSelectedFile]     = useState(null);
    const [originalSize, setOriginalSize]     = useState(0);
    const [previewUrl, setPreviewUrl]         = useState(null);
    const [fileError, setFileError]           = useState('');
    const [isCompressing, setIsCompressing]   = useState(false);
    const [uploadProgress, setUploadProgress] = useState('');
    const fileInputRef = useRef(null);
    const closeTimerRef = useRef(null);

    // Esc to close + body scroll lock + fresh error state on open
    useEffect(() => {
        if (!isOpen) return;
        setSubmitError('');
        setStarError(false);
        setSucceeded(false);
        const onKey = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', onKey);
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = prev;
        };
    }, [isOpen, onClose]);

    useEffect(() => () => clearTimeout(closeTimerRef.current), []);

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
            setStarError(true);
            return;
        }
        setIsSubmitting(true);
        setSubmitError('');
        let imageUrl = null;
        try {
            if (selectedFile) {
                setUploadProgress('Uploading photo…');
                const uploadData = new FormData();
                uploadData.append('file', selectedFile);
                const uploadRes = await fetch('/api/upload', { method: 'POST', body: uploadData });
                if (!uploadRes.ok) {
                    const err = await uploadRes.json().catch(() => ({}));
                    throw new Error(err.error || 'We couldn’t upload the photo.');
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
                throw new Error('We couldn’t save your review — please try again.');
            }
            setSucceeded(true);
            closeTimerRef.current = setTimeout(() => {
                setRating(0);
                setSelectedFile(null);
                setPreviewUrl(null);
                setOriginalSize(0);
                setFileError('');
                setUploadProgress('');
                setSucceeded(false);
                onClose();
            }, 1100);
        } catch (err) {
            console.error('Submit error:', err);
            setSubmitError(err.message || 'Something went wrong — please try again.');
        } finally {
            setIsSubmitting(false);
            setUploadProgress('');
        }
    };

    const activeStar = hoverRating || rating;
    const activeTone = activeStar ? getRatingTone(activeStar) : null;
    const savedPercent = selectedFile && originalSize > 0
        ? Math.round((1 - selectedFile.size / originalSize) * 100)
        : 0;

    return (
        <div
            className="fixed inset-0 z-[1000] flex items-end justify-center bg-ink-900/65 p-0 backdrop-blur-sm sm:items-center sm:p-4"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="rating-modal-title"
        >
            <div
                className="relative flex max-h-[92vh] w-full flex-col overflow-y-auto rounded-t-lg border border-ink-900/15 bg-white p-5 shadow-warm-xl animate-slide-up sm:max-w-lg sm:rounded-lg sm:p-7 sm:animate-pop"
                onClick={(e) => e.stopPropagation()}
            >
                {succeeded ? (
                    <div className="py-14 flex flex-col items-center text-center animate-pop">
                        <div className="flex h-16 w-16 items-center justify-center rounded-md bg-emerald-100">
                            <PartyPopper className="w-7 h-7 text-emerald-700" aria-hidden="true" />
                        </div>
                        <h2 className="mt-5 font-display text-2xl font-bold text-ink-900">Thanks! Your review is live.</h2>
                        <p className="mt-2 text-[14px] text-ink-500">The next hungry visitor salutes you. 🎉</p>
                    </div>
                ) : (
                    <>
                        <button
                            onClick={onClose}
                            className="absolute right-4 top-4 rounded-md p-2 text-ink-400 transition-colors hover:bg-cream-200 hover:text-ink-700"
                            aria-label="Close"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="mb-5 pr-10">
                            <div className="mb-2 inline-flex items-center gap-1.5 rounded-sm bg-brand-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-700">
                                <Sparkles className="w-3 h-3" />
                                Rate the dining
                            </div>
                            <h2 id="rating-modal-title" className="font-display text-2xl font-bold text-ink-900 leading-tight">
                                How was the food?
                            </h2>
                            <p className="text-ink-500 text-[14px] mt-1">
                                Tell us about your meal at <span className="font-semibold text-ink-700">{hospitalName}</span>.
                            </p>
                        </div>

                        <form action={handleSubmit} className="space-y-4">

                            {/* Star rating */}
                            <div className={`rounded-md border bg-cream-100 p-5 text-center transition-colors ${starError ? 'border-red-200 bg-red-50/60' : 'border-cream-300/70'}`}>
                                <div className="mb-2.5">
                                    <StarRating
                                        rating={rating}
                                        setRating={(star) => { setRating(star); setStarError(false); }}
                                        hoverRating={hoverRating}
                                        setHoverRating={setHoverRating}
                                        size={36}
                                    />
                                </div>
                                <div className="h-5 flex items-center justify-center">
                                    {activeTone ? (
                                        <span className={`inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider ${activeTone.text}`}>
                                            <span aria-hidden="true">{activeTone.emoji}</span>
                                            {activeTone.label}
                                        </span>
                                    ) : (
                                        <span className="text-[12px] font-bold uppercase tracking-wider text-ink-300">Tap a star</span>
                                    )}
                                </div>
                                {starError && (
                                    <p role="alert" className="mt-2 text-[12px] font-semibold text-red-700">
                                        Pick a star rating first — that&apos;s the one required bit.
                                    </p>
                                )}
                            </div>

                            {/* Photo upload */}
                            <div>
                                <label className="block text-[12px] font-semibold text-ink-700 mb-1.5">
                                    Food Photo <span className="text-ink-400 font-normal">(optional)</span>
                                </label>
                                {isCompressing ? (
                                    <div className="flex w-full flex-col items-center gap-1.5 rounded-md border border-dashed border-cream-400 bg-cream-100 p-5">
                                        <Loader2 className="w-5 h-5 text-ink-400 animate-spin" />
                                        <span className="text-xs text-ink-500">Optimizing…</span>
                                    </div>
                                ) : !previewUrl ? (
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="group flex w-full cursor-pointer flex-col items-center gap-2 rounded-md border border-dashed border-cream-400 p-5 transition-all hover:border-brand-400 hover:bg-brand-50/40"
                                    >
                                        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-cream-200 transition-colors group-hover:bg-brand-100">
                                            <Camera className="w-5 h-5 text-ink-500 group-hover:text-brand-600 transition-colors" />
                                        </div>
                                        <span className="text-sm text-ink-700 group-hover:text-ink-900 font-semibold">Add a food photo</span>
                                        <span className="text-[10px] text-ink-400 uppercase tracking-wider font-semibold">JPG · PNG · WebP</span>
                                    </button>
                                ) : (
                                    <div className="relative overflow-hidden rounded-md border border-cream-300">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
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
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
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
                                    className="focus-ring w-full rounded-md border border-cream-300 bg-white px-3.5 py-3 text-[16px] text-ink-800 placeholder-ink-300"
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
                                    placeholder="What did you eat? Would you order it again?"
                                    rows={3}
                                    className="focus-ring w-full resize-none rounded-md border border-cream-300 bg-white px-3.5 py-3 text-[16px] text-ink-800 placeholder-ink-300"
                                />
                            </div>

                            {submitError && (
                                <div role="alert" className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
                                    {submitError}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isSubmitting || isCompressing}
                                className="action-primary mt-2 w-full py-3.5"
                            >
                                {isSubmitting ? (
                                    <span className="inline-flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        {uploadProgress || 'Saving your review…'}
                                    </span>
                                ) : 'Submit review'}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}
