"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, X, ArrowRight } from "lucide-react";

interface Photo {
  id: string;
  url: string;
  title: string;
  location: string | null;
  category: string;
}

export default function PortfolioGallery({ initialPhotos }: { initialPhotos: Photo[] }) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  const categories = ["All", ...new Set(initialPhotos.map(p => p.category))];

  const filteredPhotos = useMemo(() => 
    selectedCategory === "All" 
      ? initialPhotos 
      : initialPhotos.filter(p => p.category === selectedCategory),
  [selectedCategory, initialPhotos]);

  return (
    <>
      <div className="flex flex-wrap justify-center gap-8 mb-20 px-4">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`text-[11px] uppercase tracking-[0.2em] transition-all hover:text-zinc-950 relative py-2 ${
              selectedCategory === cat ? "text-zinc-950 font-bold" : "opacity-40"
            }`}
          >
            {cat}
            {selectedCategory === cat && (
              <motion.div 
                layoutId="activeCat"
                className="absolute bottom-0 left-0 w-full h-[2px] bg-zinc-900" 
              />
            )}
          </button>
        ))}
      </div>

      <motion.div 
        layout
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12"
      >
        <AnimatePresence mode="popLayout">
          {filteredPhotos.map((photo) => (
            <motion.div
              key={photo.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5 }}
              className="group relative aspect-[4/5] bg-zinc-100 overflow-hidden cursor-pointer border border-zinc-100"
              onClick={() => setSelectedPhoto(photo)}
            >
              <img 
                src={photo.url} 
                alt={photo.title}
                className="absolute inset-0 w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors duration-500 z-10"></div>
              
              <div className="absolute bottom-0 left-0 w-full p-8 z-20 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 bg-white/95 backdrop-blur-md border-t border-zinc-100">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[9px] uppercase tracking-widest mb-2 opacity-50 text-zinc-900 font-bold">{photo.category}</p>
                    <h3 className="font-display text-2xl text-zinc-950 italic leading-none">{photo.title}</h3>
                    <div className="flex items-center mt-3 text-[10px] opacity-40 space-x-2 text-zinc-950">
                      <MapPin size={10} />
                      <span>{photo.location}</span>
                    </div>
                  </div>
                  <div className="p-2 border border-zinc-200 rounded-full group-hover:bg-zinc-900 group-hover:text-white transition-colors duration-300">
                    <ArrowRight size={14} />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

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
              className="relative max-w-6xl w-full h-full flex flex-col items-center justify-center pointer-events-none"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative group pointer-events-auto">
                <img 
                  src={selectedPhoto.url} 
                  alt={selectedPhoto.title}
                  className="max-h-[75vh] w-auto object-contain shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] border-[12px] border-white"
                />
                <button 
                  onClick={() => setSelectedPhoto(null)}
                  className="absolute -top-6 -right-6 md:-top-12 md:-right-12 p-3 bg-white border border-zinc-100 rounded-full shadow-lg hover:bg-zinc-950 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="mt-12 text-center max-w-2xl">
                <motion.h3 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="font-display text-3xl md:text-6xl text-zinc-950 italic"
                >
                  {selectedPhoto.title}
                </motion.h3>
                <div className="flex items-center justify-center space-x-4 mt-6">
                   <p className="text-[11px] uppercase tracking-[0.4em] opacity-40 text-zinc-900 font-bold">{selectedPhoto.location}</p>
                   <div className="w-1.5 h-1.5 rounded-full bg-zinc-200"></div>
                   <p className="text-[11px] uppercase tracking-[0.4em] opacity-40 text-zinc-900 font-bold">{selectedPhoto.category}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
