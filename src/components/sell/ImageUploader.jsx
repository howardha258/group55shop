import React, { useState } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

export default function ImageUploader({ images, onImagesChange, minImages = 5 }) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setUploading(true);
    const newImages = [...images];

    for (const file of files) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      newImages.push(file_url);
    }

    onImagesChange(newImages);
    setUploading(false);
  };

  const removeImage = (index) => {
    onImagesChange(images.filter((_, i) => i !== index));
  };

  const remaining = Math.max(0, minImages - images.length);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-sm text-foreground">Product Images</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Minimum {minImages} images required ({images.length}/{minImages} uploaded)
            {remaining > 0 && <span className="text-destructive ml-1">— {remaining} more needed</span>}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
        {images.map((img, i) => (
          <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-muted group">
            <img src={img} alt={`Upload ${i + 1}`} className="w-full h-full object-cover" />
            <button
              onClick={() => removeImage(i)}
              className="absolute top-1.5 right-1.5 w-6 h-6 bg-destructive/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3.5 h-3.5 text-white" />
            </button>
            <div className="absolute bottom-1.5 left-1.5 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
              #{i + 1}
            </div>
          </div>
        ))}

        <label className="aspect-square rounded-xl border-2 border-dashed border-muted-foreground/30 hover:border-accent transition-colors cursor-pointer flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-accent">
          {uploading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <>
              <Upload className="w-6 h-6" />
              <span className="text-xs font-medium">Add</span>
            </>
          )}
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleUpload}
            disabled={uploading}
          />
        </label>
      </div>
    </div>
  );
}