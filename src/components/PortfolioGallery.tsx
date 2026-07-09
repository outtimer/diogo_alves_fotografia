"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, X, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { incrementView } from "@/app/admin/actions";

interface Photo {
  id: string;
  url: string;
  title: string;
  location: string | null;
  lat?: number | null;
  lng?: number | null;
  category: string;
}

export default function PortfolioGallery({ 
  initialPhotos,
  initialCategories = []
}: { 
  initialPhotos: Photo[];
  initialCategories?: { id: string; name: string }[];
}) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  const categories = useMemo(() => {
    const dbCatNames = initialCategories.map(c => c.name);
    const photoCatNames = initialPhotos.map(p => p.category);
    return ["All", ...Array.from(new Set([...dbCatNames, ...photoCatNames]))];
  }, [initialCategories, initialPhotos]);

  const filteredPhotos = useMemo(() => 
    selectedCategory === "All" 
      ? initialPhotos 
      : initialPhotos.filter(p => p.category === selectedCategory),
  [selectedCategory, initialPhotos]);

  const handleSelectCategory = (cat: string) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
  };

  const handleSelectPhoto = (photo: Photo) => {
    setSelectedPhoto(photo);
    incrementView("photo", photo.id);
    
    // Auto-sync pagination page to matching image index
    const photoIndex = filteredPhotos.findIndex(p => p.id === photo.id);
    if (photoIndex > -1) {
      const targetPage = Math.floor(photoIndex / ITEMS_PER_PAGE) + 1;
      if (targetPage !== currentPage) {
        setCurrentPage(targetPage);
      }
    }
  };

  const handlePrevPhoto = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!selectedPhoto) return;
    const currentIndex = filteredPhotos.findIndex(p => p.id === selectedPhoto.id);
    if (currentIndex > -1) {
      const prevIndex = (currentIndex - 1 + filteredPhotos.length) % filteredPhotos.length;
      const targetPhoto = filteredPhotos[prevIndex];
      setSelectedPhoto(targetPhoto);
      incrementView("photo", targetPhoto.id);
      
      const targetPage = Math.floor(prevIndex / ITEMS_PER_PAGE) + 1;
      if (targetPage !== currentPage) {
        setCurrentPage(targetPage);
      }
    }
  }, [selectedPhoto, filteredPhotos, currentPage]);

  const handleNextPhoto = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!selectedPhoto) return;
    const currentIndex = filteredPhotos.findIndex(p => p.id === selectedPhoto.id);
    if (currentIndex > -1) {
      const nextIndex = (currentIndex + 1) % filteredPhotos.length;
      const targetPhoto = filteredPhotos[nextIndex];
      setSelectedPhoto(targetPhoto);
      incrementView("photo", targetPhoto.id);
      
      const targetPage = Math.floor(nextIndex / ITEMS_PER_PAGE) + 1;
      if (targetPage !== currentPage) {
        setCurrentPage(targetPage);
      }
    }
  }, [selectedPhoto, filteredPhotos, currentPage]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedPhoto) return;
      if (e.key === "ArrowLeft") {
        handlePrevPhoto();
      } else if (e.key === "ArrowRight") {
        handleNextPhoto();
      } else if (e.key === "Escape") {
        setSelectedPhoto(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedPhoto, handlePrevPhoto, handleNextPhoto]);

  const totalPages = Math.ceil(filteredPhotos.length / ITEMS_PER_PAGE);

  const paginatedPhotos = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredPhotos.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredPhotos, currentPage]);

  const paginationRange = useMemo(() => {
    const range: (number | string)[] = [];
    const siblingCount = 1;
    const totalPageNumbers = siblingCount + 5;

    if (totalPages <= totalPageNumbers) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

    const firstPageIndex = 1;
    const lastPageIndex = totalPages;

    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblingCount;
      const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
      return [...leftRange, "...", lastPageIndex];
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingCount;
      const rightRange = Array.from({ length: rightItemCount }, (_, i) => totalPages - rightItemCount + i + 1);
      return [firstPageIndex, "...", ...rightRange];
    }

    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = Array.from(
        { length: rightSiblingIndex - leftSiblingIndex + 1 },
        (_, i) => leftSiblingIndex + i
      );
      return [firstPageIndex, "...", ...middleRange, "...", lastPageIndex];
    }

    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }, [currentPage, totalPages]);

  return (
    <>
      <div className="flex flex-wrap justify-center gap-8 mb-20 px-4">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => handleSelectCategory(cat)}
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
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-6 gap-8 md:gap-12 3xl:gap-16"
      >
        <AnimatePresence mode="popLayout">
          {paginatedPhotos.map((photo) => (
            <motion.div
              key={photo.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5 }}
              className="group relative aspect-[4/5] bg-zinc-100 overflow-hidden cursor-pointer border border-zinc-100"
              onClick={() => handleSelectPhoto(photo)}
            >
              <Image 
                src={photo.url} 
                alt={photo.title}
                fill
                className="object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors duration-500 z-10"></div>
              
              <div className="absolute bottom-0 left-0 w-full p-8 3xl:p-12 z-20 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 bg-white/95 backdrop-blur-md border-t border-zinc-100">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[9px] 3xl:text-xs uppercase tracking-widest mb-2 opacity-50 text-zinc-900 font-bold">{photo.category}</p>
                    <h3 className="font-display text-2xl 3xl:text-4xl text-zinc-950 italic leading-none">{photo.title}</h3>
                    <div className="flex items-center mt-3 text-[10px] 3xl:text-sm opacity-40 space-x-2 text-zinc-950">
                      <MapPin size={10} className="3xl:w-4 3xl:h-4" />
                      <span>{photo.location}</span>
                    </div>
                  </div>
                  <div className="p-2 border border-zinc-200 rounded-full group-hover:bg-zinc-900 group-hover:text-white transition-colors duration-300">
                    <ArrowRight size={14} className="3xl:w-6 3xl:h-6" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between mt-20 pt-8 border-t border-zinc-100 gap-6">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="w-full sm:w-auto px-6 py-3 text-[10px] uppercase tracking-[0.3em] font-medium border border-zinc-200 hover:border-zinc-950 hover:bg-zinc-950 hover:text-white transition-all duration-300 disabled:opacity-30 disabled:pointer-events-none disabled:hover:bg-transparent disabled:hover:text-zinc-400 disabled:hover:border-zinc-200 cursor-pointer"
          >
            Anterior
          </button>
          
          <div className="flex flex-wrap items-center justify-center gap-2">
            {paginationRange.map((page, index) => {
              if (page === "...") {
                return (
                  <span
                    key={`dots-${index}`}
                    className="w-10 h-10 text-[11px] font-mono text-zinc-400 flex items-center justify-center select-none"
                  >
                    ...
                  </span>
                );
              }

              const pageNum = page as number;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-10 h-10 text-[11px] font-mono tracking-widest transition-all duration-300 flex items-center justify-center cursor-pointer ${
                    currentPage === pageNum
                      ? "bg-zinc-950 text-white font-bold"
                      : "text-zinc-400 hover:text-zinc-950 hover:bg-zinc-100"
                  }`}
                >
                  {String(pageNum).padStart(2, "0")}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="w-full sm:w-auto px-6 py-3 text-[10px] uppercase tracking-[0.3em] font-medium border border-zinc-200 hover:border-zinc-950 hover:bg-zinc-950 hover:text-white transition-all duration-300 disabled:opacity-30 disabled:pointer-events-none disabled:hover:bg-transparent disabled:hover:text-zinc-400 disabled:hover:border-zinc-200 cursor-pointer"
          >
            Próximo
          </button>
        </div>
      )}

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
            {/* Left and Right navigation buttons */}
            {filteredPhotos.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrevPhoto();
                  }}
                  className="fixed left-4 md:left-12 top-1/2 -translate-y-1/2 p-3 md:p-4 3xl:p-8 bg-white border border-zinc-100 rounded-full shadow-lg hover:bg-zinc-950 hover:text-white transition-colors cursor-pointer z-[110]"
                  title="Anterior"
                >
                  <ChevronLeft size={20} className="md:w-6 md:h-6 3xl:w-10 3xl:h-10" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNextPhoto();
                  }}
                  className="fixed right-4 md:right-12 top-1/2 -translate-y-1/2 p-3 md:p-4 3xl:p-8 bg-white border border-zinc-100 rounded-full shadow-lg hover:bg-zinc-950 hover:text-white transition-colors cursor-pointer z-[110]"
                  title="Próxima"
                >
                  <ChevronRight size={20} className="md:w-6 md:h-6 3xl:w-10 3xl:h-10" />
                </button>
              </>
            )}

            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative max-w-6xl 2xl:max-w-7xl 3xl:max-w-[2200px] w-full h-full flex flex-col items-center justify-center pointer-events-none"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative group pointer-events-auto w-full flex flex-col items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
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
                   <div className="w-1.5 h-1.5 3xl:w-3 3xl:h-3 rounded-full bg-zinc-200"></div>
                   <p className="text-[11px] 3xl:text-base uppercase tracking-[0.4em] opacity-40 text-zinc-900 font-bold">{selectedPhoto.category}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
