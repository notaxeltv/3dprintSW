"use client";

import { useState } from "react";
import { ImageOff } from "lucide-react";
import clsx from "clsx";

type Props = {
  images: { url: string; caption: string | null }[];
  name: string;
};

export default function ProductGallery({ images, name }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = images[activeIndex];

  if (images.length === 0) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center rounded-2xl bg-slate-100 text-slate-300 dark:bg-slate-800 dark:text-slate-600">
        <ImageOff size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={active.url}
          alt={active.caption || name}
          className="aspect-[4/3] w-full object-cover"
        />
      </div>
      {active.caption && (
        <p className="text-sm text-slate-500 dark:text-slate-400">{active.caption}</p>
      )}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
          {images.map((image, index) => (
            <button
              key={`${image.url}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={clsx(
                "overflow-hidden rounded-lg border-2 transition",
                index === activeIndex
                  ? "border-indigo-600"
                  : "border-transparent opacity-80 hover:opacity-100"
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image.url} alt="" className="aspect-square w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
