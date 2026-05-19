"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutGrid, X, MapPin } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

import { incrementView } from "@/app/admin/actions";

interface Photo {
  id: string;
  url: string;
  title: string;
  location: string | null;
  lat?: number | null;
  lng?: number | null;
  category?: string;
}

interface FeaturedGridProps {
  photos: Photo[];
  title?: string;
  googleMapsApiKey?: string;
}

export default function FeaturedGrid({ photos, title }: FeaturedGridProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  const handleSelectPhoto = (photo: Photo) => {
    setSelectedPhoto(photo);
    incrementView("photo", photo.id);
  };

  return (
    <>
      <section className="px-6 py-32 max-w-7xl 2xl:max-w-[1600px] 3xl:max-w-[2000px] mx-auto flex flex-col items-center">
        <div className="max-w-5xl 2xl:max-w-7xl 3xl:max-w-[2200px] w-full text-center">
          {/* Section Heading */}
          <div className="flex flex-col items-center mb-16 3xl:mb-32">
            <span className="text-[10px] 3xl:text-xs uppercase tracking-[0.5em] text-zinc-400 font-bold mb-4 block">Visual Storytelling</span>
            <h2 className="font-display text-4xl md:text-6xl 3xl:text-9xl text-zinc-950 italic text-balance">{title || "Galeria em Foco"}</h2>
            <div className="h-[1px] w-24 3xl:w-48 bg-zinc-200 mt-8"></div>
          </div>

          <div className="space-y-24 3xl:space-y-48">
            {/* Quote */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-xl md:text-3xl 3xl:text-6xl font-light leading-relaxed text-zinc-950 italic font-display max-w-4xl 3xl:max-w-7xl mx-auto text-balance"
            >
              "A fotografia é a interrupção da mente por um instante de luz."
            </motion.p>

          {/* Gallery Grid (3x2 ou 4x[n]) */}
          {photos.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-6 gap-8 3xl:gap-12">
              {photos.map((photo, index) => (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  onClick={() => handleSelectPhoto(photo)}
                  className="aspect-square bg-zinc-100 overflow-hidden shadow-sm relative group cursor-pointer"
                >
                  <Image 
                    src={photo.url} 
                    alt={photo.title} 
                    fill
                    className="object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6 3xl:p-12 z-10">
                    <div className="text-white text-left">
                      <p className="text-[10px] 3xl:text-xs uppercase tracking-widest font-bold">{photo.title}</p>
                      <p className="text-[8px] 3xl:text-[10px] uppercase tracking-widest opacity-60">{photo.location}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Explore Button */}
          <div className="flex flex-col items-center space-y-8 3xl:space-y-16">
            <div className="h-[80px] 3xl:h-[160px] w-[1px] bg-zinc-200"></div>
            <Link 
              href="/gallery" 
              className="group flex flex-col items-center"
            >
              <span className="text-[10px] 3xl:text-xs uppercase tracking-[0.5em] font-bold text-zinc-950 group-hover:opacity-60 transition-opacity">Explorar Acervo Completo</span>
              <div className="mt-4 p-5 3xl:p-8 border border-zinc-200 rounded-full group-hover:bg-zinc-950 group-hover:text-white transition-all shadow-sm">
                <LayoutGrid size={20} className="3xl:w-8 3xl:h-8" />
              </div>
            </Link>
          </div>
          </div>
        </div>
      </section>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-white/98 backdrop-blur-xl flex items-center justify-center p-6 md:p-12 cursor-zoom-out"
            onClick={() => setSelectedPhoto(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative max-w-6xl 2xl:max-w-7xl 3xl:max-w-[2200px] w-full h-full flex flex-col items-center justify-center pointer-events-none"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative group pointer-events-auto w-full flex flex-col items-center">
                <img 
                  src={selectedPhoto.url} 
                  alt={selectedPhoto.title}
                  className="max-h-[75vh] w-auto object-contain shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] border-[12px] 3xl:border-[24px] border-white"
                />
                
                <button 
                  onClick={() => {
                    setSelectedPhoto(null);
                  }}
                  className="absolute -top-6 -right-6 md:-top-12 md:-right-12 p-3 3xl:p-6 bg-white border border-zinc-100 rounded-full shadow-lg hover:bg-zinc-950 hover:text-white transition-colors"
                >
                  <X size={20} className="3xl:w-8 3xl:h-8" />
                </button>
              </div>
              <div className="mt-12 text-center max-w-2xl 3xl:max-w-6xl">
                <motion.h3 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="font-display text-3xl md:text-6xl 3xl:text-9xl text-zinc-950 italic"
                >
                  {selectedPhoto.title}
                </motion.h3>
                <div className="flex items-center justify-center space-x-4 3xl:space-x-12 mt-6 3xl:mt-12">
                   <p className="text-[11px] 3xl:text-base uppercase tracking-[0.4em] opacity-40 text-zinc-900 font-bold">{selectedPhoto.location}</p>
                   {selectedPhoto.category && (
                     <>
                       <div className="w-1.5 h-1.5 3xl:w-3 3xl:h-3 rounded-full bg-zinc-200"></div>
                       <p className="text-[11px] 3xl:text-base uppercase tracking-[0.4em] opacity-40 text-zinc-900 font-bold">{selectedPhoto.category}</p>
                     </>
                   )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

