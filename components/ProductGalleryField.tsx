"use client";

import { Plus, Trash2 } from "lucide-react";
import ImageUploadField from "@/components/ImageUploadField";
import Button from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Field";

export type GalleryImageInput = {
  url: string;
  caption: string;
};

type Props = {
  value: GalleryImageInput[];
  onChange: (images: GalleryImageInput[]) => void;
};

function emptyImage(): GalleryImageInput {
  return { url: "", caption: "" };
}

export default function ProductGalleryField({ value, onChange }: Props) {
  function updateImage(index: number, patch: Partial<GalleryImageInput>) {
    onChange(value.map((image, i) => (i === index ? { ...image, ...patch } : image)));
  }

  function removeImage(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  return (
    <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <Label className="mb-0">Galleria vetrina</Label>
          <p className="mt-1 text-xs text-slate-400">
            Aggiungi più foto per la scheda prodotto pubblica. La prima immagine è anche la copertina.
          </p>
        </div>
        <Button type="button" variant="secondary" size="sm" onClick={() => onChange([...value, emptyImage()])}>
          <Plus size={14} /> Aggiungi foto
        </Button>
      </div>

      {value.length === 0 ? (
        <p className="text-xs text-slate-400">
          Nessuna foto extra. Verrà usata la foto principale del modello.
        </p>
      ) : (
        <div className="space-y-4">
          {value.map((image, index) => (
            <div
              key={index}
              className="rounded-lg border border-slate-100 p-3 dark:border-slate-800"
            >
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-medium text-slate-500">Foto {index + 1}</p>
                <Button type="button" variant="ghost" size="sm" onClick={() => removeImage(index)}>
                  <Trash2 size={14} className="text-rose-500" />
                </Button>
              </div>
              <ImageUploadField
                label="Immagine"
                value={image.url}
                onChange={(url) => updateImage(index, { url })}
              />
              <div className="mt-3">
                <Label htmlFor={`gallery-caption-${index}`}>Didascalia (facoltativa)</Label>
                <Input
                  id={`gallery-caption-${index}`}
                  value={image.caption}
                  onChange={(e) => updateImage(index, { caption: e.target.value })}
                  placeholder="Es. Vista laterale, dettaglio texture..."
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
