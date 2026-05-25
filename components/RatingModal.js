'use client';
import { useState, useRef } from 'react';
import StarRating from './StarRating';
import { saveRating } from '@/lib/data';
import { compressImage, formatFileSize } from '@/lib/imageUtils';
import { X, Camera, ImageIcon, Loader2 } from 'lucide-react';

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB raw input limit

export default function RatingModal({ isOpen, onClose, hospitalId, hospitalName }) {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);     // compressed file for upload
    const [originalSize, setOriginalSize] = useState(0);        // original file size
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

        // Handle HEIC/HEIF fallback explicitly first
        if (file.type === 'image/heic' || file.type === 'image/heif') {
            setFileError('HEIC format not supported. Please upload a JPG/PNG. If on iPhone, choose "Most Compatible" in Options, or take a new photo.');
            setSelectedFile(null);
            setPreviewUrl(null);
            e.target.value = '';
            return;
        }

        // Validate type
        if (!ALLOWED_TYPES.includes(file.type)) {
            setFileError('Only JPG, PNG, and WebP images are allowed.');
            setSelectedFile(null);
            setPreviewUrl(null);
            e.target.value = '';
            return;
        }
        // Validate size (raw input limit)
        if (file.size > MAX_FILE_SIZE) {
            setFileError(`File too large (${formatFileSize(file.size)}). Maximum is 10MB.`);
            setSelectedFile(null);
            setPreviewUrl(null);
            e.target.value = '';
            return;
        }

        // Compress the image
        setIsCompressing(true);
        setOriginalSize(file.size);

        try {
            const compressed = await compressImage(file);
            setSelectedFile(compressed);

            // Generate preview from compressed file
            const reader = new FileReader();
            reader.onload = (ev) => setPreviewUrl(ev.target.result);
            reader.readAsDataURL(compressed);
        } catch (err) {
            console.error('Compression failed:', err);
            setFileError('Failed to process image. Please try a different file.');
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
            // Step 1: Upload compressed photo if selected
            if (selectedFile) {
                setUploadProgress('Uploading photo...');
                const uploadData = new FormData();
                uploadData.append('file', selectedFile);

                const uploadRes = await fetch('/api/upload', {
                    method: 'POST',
                    body: uploadData,
                });

                if (!uploadRes.ok) {
                    const err = await uploadRes.json();
                    throw new Error(err.error || 'Failed to upload photo');
                }

                const { url } = await uploadRes.json();
                imageUrl = url;
            }

            // Step 2: Submit review
            setUploadProgress('Saving review...');

            const comment = formData.get('comment');
            const name = formData.get('name');

            const reviewRes = await fetch('/api/review', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    hospitalId,
                    rating,
                    comment,
                    name,
                    imageUrl,
                }),
            });

            if (!reviewRes.ok) {
                // Fallback: try localStorage
                const result = saveRating(hospitalId, rating, comment, name, imageUrl);
                if (!result) {
                    throw new Error('Failed to save review');
                }
            }

            // Reset and close
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

    // Compression savings
    const savedPercent = selectedFile && originalSize > 0
        ? Math.round((1 - selectedFile.size / originalSize) * 100)
        : 0;

    return (
        <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[1000] flex items-center justify-center p-4 transition-opacity duration-300"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_24px_64px_-16px_rgba(15,23,42,0.2)] w-full max-w-md p-6 md:p-8 relative transform transition-all duration-300 scale-100 flex flex-col max-h-[90vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
            >
                {/* Close button */}
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-xl transition-all duration-200"
                    aria-label="Close modal"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Header */}
                <div className="mb-6">
                    <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 tracking-tight mb-1 pr-8">
                        Rate the Dining
                    </h2>
                    <p className="text-slate-500 text-sm">
                        How was the food at <span className="font-semibold text-slate-700">{hospitalName}</span>?
                    </p>
                </div>

                <form action={handleSubmit} className="space-y-5">
                    {/* Star Selector Container */}
                    <div className="bg-gradient-to-b from-slate-50 to-white rounded-xl p-5 border border-slate-100 text-center">
                        <div className="mb-3">
                            <StarRating 
                                rating={rating} 
                                setRating={setRating} 
                                hoverRating={hoverRating} 
                                setHoverRating={setHoverRating} 
                                size={36} 
                            />
                        </div>
                        <div className={`text-xs font-bold uppercase tracking-wider transition-colors duration-200 ${rating ? 'text-amber-500' : 'text-slate-400'}`}>
                            {rating ? ratingLabels[rating] : 'Tap a star to rate'}
                        </div>
                    </div>

                    {/* Photo Upload */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                            Food Photo <span className="text-slate-400 font-normal">(optional, 1 per review)</span>
                        </label>
                        
                        {isCompressing ? (
                            <div className="w-full border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center gap-2">
                                <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
                                <span className="text-sm text-slate-500 font-medium">Optimizing image...</span>
                            </div>
                        ) : !previewUrl ? (
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full border-2 border-dashed border-slate-200 hover:border-orange-300 rounded-xl p-6 flex flex-col items-center gap-2 transition-all duration-200 hover:bg-orange-50/40 group cursor-pointer"
                            >
                                <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-orange-100 flex items-center justify-center transition-colors duration-200">
                                    <Camera className="w-5 h-5 text-slate-400 group-hover:text-orange-500 transition-colors duration-200" />
                                </div>
                                <span className="text-sm text-slate-500 group-hover:text-slate-700 font-medium transition-colors">
                                    Add a photo of the food
                                </span>
                                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                                    JPG, PNG, WebP · Max 10MB · Auto-compressed
                                </span>
                            </button>
                        ) : (
                            <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                                <img 
                                    src={previewUrl} 
                                    alt="Food photo preview" 
                                    className="w-full h-48 object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={removePhoto}
                                    className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white p-1.5 rounded-lg transition-colors duration-200"
                                    aria-label="Remove photo"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                                <div className="px-3 py-2 flex items-center gap-2 text-xs text-slate-500 bg-white border-t border-slate-100">
                                    <ImageIcon className="w-3.5 h-3.5 shrink-0" />
                                    <span className="truncate">{selectedFile?.name}</span>
                                    <span className="ml-auto flex items-center gap-1.5 shrink-0">
                                        <span className="text-slate-400">{formatFileSize(selectedFile?.size || 0)}</span>
                                        {savedPercent > 0 && (
                                            <span className="text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">
                                                −{savedPercent}%
                                            </span>
                                        )}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Hidden file input */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="hidden"
                        />

                        {/* File error */}
                        {fileError && (
                            <div className="mt-2 flex items-center gap-1.5 text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">
                                <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                                {fileError}
                            </div>
                        )}
                    </div>

                    {/* Name input */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                            Your Name <span className="text-slate-400 font-normal">(optional)</span>
                        </label>
                        <input
                            name="name"
                            type="text"
                            placeholder="e.g. Anonymous Foodie"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus-ring text-sm text-slate-800 placeholder-slate-400 transition-all duration-200 bg-white"
                        />
                    </div>

                    {/* Comment input */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                            Your Review <span className="text-slate-400 font-normal">(optional)</span>
                        </label>
                        <textarea
                            name="comment"
                            placeholder="What did you eat, and did it deserve a discharge order? Would you recommend it to a hungry nurse on break?"
                            rows={3}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus-ring text-sm text-slate-800 placeholder-slate-400 transition-all duration-200 resize-none bg-white"
                        />
                    </div>

                    {/* Submit Button */}
                    <button 
                        type="submit" 
                        disabled={isSubmitting || isCompressing}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 px-4 rounded-xl text-sm shadow-md shadow-blue-600/10 hover:shadow-lg hover:shadow-blue-600/15 active:scale-[0.98] transition-all duration-200"
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