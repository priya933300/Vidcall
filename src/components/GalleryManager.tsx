import React, { useState, useRef } from 'react';
import { Image as ImageIcon, Plus, Trash2, X, AlertCircle } from 'lucide-react';
import { User } from '../types';
import { storage } from '../utils/storage';

interface GalleryManagerProps {
  targetUser: User;
  onUpdate: (updated: User) => void;
  canEdit: boolean; // True if self, or if Admin with canManagePhotos, or Super Admin
  lang: 'bn' | 'en';
}

export const GalleryManager: React.FC<GalleryManagerProps> = ({
  targetUser,
  onUpdate,
  canEdit,
  lang,
}) => {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const gallery = targetUser.gallery || [];
  const maxPhotos = 10;
  const isFull = gallery.length >= maxPhotos;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isFull) return;
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const photoData = reader.result as string;
        const newGallery = [...gallery, photoData];
        const updated = { ...targetUser, gallery: newGallery };
        storage.updateUser(updated);
        onUpdate(updated);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeletePhoto = (index: number) => {
    const newGallery = gallery.filter((_, i) => i !== index);
    const updated = { ...targetUser, gallery: newGallery };
    storage.updateUser(updated);
    onUpdate(updated);
    if (selectedPhoto) setSelectedPhoto(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <ImageIcon className="w-4 h-4 text-emerald-400" />
            {lang === 'bn' ? 'প্রোফাইল গ্যালারি' : 'Profile Gallery'}
          </h4>
          <p className="text-[11px] text-slate-400">
            {lang === 'bn'
              ? `সর্বোচ্চ ১০টি ছবি রাখা যাবে (${gallery.length}/${maxPhotos})`
              : `Maximum 10 photos allowed (${gallery.length}/${maxPhotos})`}
          </p>
        </div>

        {canEdit && (
          <div>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isFull}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                isFull
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>{lang === 'bn' ? 'ছবি যুক্ত করুন' : 'Add Photo'}</span>
            </button>
          </div>
        )}
      </div>

      {isFull && canEdit && (
        <div className="flex items-center gap-2 p-2.5 bg-amber-950/40 border border-amber-800/60 rounded-xl text-[11px] text-amber-300">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
          <span>
            {lang === 'bn'
              ? '১০টি ছবির সর্বোচ্চ সীমা পূর্ণ হয়েছে। নতুন ছবি দিতে পুরনো একটি মুছুন।'
              : 'Max 10 photos reached. Delete an existing photo to upload a new one.'}
          </span>
        </div>
      )}

      {gallery.length === 0 ? (
        <div className="p-8 text-center bg-slate-800/40 border border-dashed border-slate-700 rounded-2xl text-slate-400">
          <ImageIcon className="w-8 h-8 mx-auto mb-2 text-slate-500" />
          <p className="text-xs">
            {lang === 'bn' ? 'গ্যালারিতে এখনো কোনো ছবি নেই' : 'No photos in gallery yet'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {gallery.map((imgUrl, idx) => (
            <div
              key={idx}
              className="relative aspect-square rounded-2xl overflow-hidden group border border-slate-800 bg-slate-900"
            >
              <img
                src={imgUrl}
                alt={`Photo ${idx + 1}`}
                onClick={() => setSelectedPhoto(imgUrl)}
                className="w-full h-full object-cover cursor-pointer group-hover:scale-105 transition-transform duration-200"
              />

              <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/60 text-[10px] text-white font-mono">
                #{idx + 1}
              </div>

              {canEdit && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeletePhoto(idx);
                  }}
                  className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-rose-600/90 hover:bg-rose-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                  title={lang === 'bn' ? 'ছবি মুছুন' : 'Delete photo'}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="relative max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute -top-10 right-0 text-white text-xs bg-slate-800 px-3 py-1 rounded-full flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'বন্ধ করুন' : 'Close'}</span>
            </button>
            <img
              src={selectedPhoto}
              alt="Preview"
              className="w-full rounded-2xl max-h-[75vh] object-contain border border-slate-700 shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};
