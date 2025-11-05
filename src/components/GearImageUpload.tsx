import React from 'react';
import './GearImageUpload.css';

interface GearImageUploadProps {
    gearId: string;
    currentImage?: string;
    onImageUpload: (gearId: string, imageUrl: string) => void;
    size?: number;
}

const GearImageUpload: React.FC<GearImageUploadProps> = ({ gearId, currentImage, onImageUpload, size }) => {
    const [preview, setPreview] = React.useState<string | undefined>(currentImage);
    const [isUploading, setIsUploading] = React.useState(false);
    const previewSize = size || 24;

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        setIsUploading(true);
        try {
            const img = await new Promise<HTMLImageElement>((resolve, reject) => {
                const url = URL.createObjectURL(file);
                const image = new Image();
                image.onload = () => {
                    URL.revokeObjectURL(url);
                    resolve(image);
                };
                image.onerror = (err) => {
                    URL.revokeObjectURL(url);
                    reject(err);
                };
                image.src = url;
            });

            const MAX_DIM = 800;
            let { width, height } = img;
            if (width > MAX_DIM || height > MAX_DIM) {
                const ratio = width / height;
                if (ratio > 1) {
                    width = MAX_DIM;
                    height = Math.round(MAX_DIM / ratio);
                } else {
                    height = MAX_DIM;
                    width = Math.round(MAX_DIM * ratio);
                }
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error('Could not get canvas context');
            ctx.drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL('image/jpeg', 0.75);
            setPreview(compressed);
            onImageUpload(gearId, compressed);
        } catch (err) {
            console.error('Error processing image', err);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="gear-image-upload">
            <button
                className="image-button"
                onClick={() => document.getElementById(`file-${gearId}`)?.click()}
                aria-label="Add image"
                title="Add image"
            >
                {preview ? (
                    <>
                        <img
                            src={preview}
                            alt="Equipment preview"
                            className="image-preview"
                            style={{ width: previewSize, height: previewSize }}
                        />
                    </>
                ) : (
                    <span>📸</span>
                )}
                <span style={{ marginLeft: 8, display: preview ? 'none' : 'inline' }}>Add Image</span>
            </button>
            <input type="file" id={`file-${gearId}`} accept="image/*" onChange={handleFileSelect} style={{ display: 'none' }} />
            {isUploading && <div className="upload-overlay">Uploading...</div>}
        </div>
    );
};

export default GearImageUpload;
