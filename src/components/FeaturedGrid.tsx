"use client";

import { motion } from "framer-motion";
import { LayoutGrid } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

import { incrementView } from "@/app/admin/actions";

interface Photo {
  id: string;
  url: string;
  title: string;
  location: string | null;
}

interface FeaturedGridProps {
  photos: Photo[];
  title?: string;
}

export default function FeaturedGrid({ photos, title }: FeaturedGridProps) {
  return (
    <section className="px-6 py-32 max-w-7xl 2xl:max-w-[1600px] 3xl:max-w-[2000px] mx-auto flex flex-col items-center">
      <div className="max-w-5xl 2xl:max-w-7xl 3xl:max-w-[1800px] w-full text-center">
        {/* Section Heading */}
        <div className="flex flex-col items-center mb-16">
          <span className="text-[10px] uppercase tracking-[0.5em] text-zinc-400 font-bold mb-4 block">Visual Storytelling</span>
          <h2 className="font-display text-4xl md:text-6xl text-zinc-950 italic">{title || "Galeria em Foco"}</h2>
          <div className="h-[1px] w-24 bg-zinc-200 mt-8"></div>
        </div>

        <div className="space-y-24">
          {/* Quote */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-xl md:text-3xl font-light leading-relaxed text-zinc-950 italic font-display"
          >
            "A fotografia é a interrupção da mente por um instante de luz."
          </motion.p>

        {/* Gallery Grid (3x2 ou 4x[n]) */}
        {photos.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8">
            {photos.map((photo, index) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                onClick={() => incrementView("photo", photo.id)}
                className="aspect-square bg-zinc-100 overflow-hidden shadow-sm relative group cursor-pointer"
              >
                <Image 
                  src={photo.url} 
                  alt={photo.title} 
                  fill
                  className="object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6 z-10">
                  <div className="text-white text-left">
                    <p className="text-[10px] uppercase tracking-widest font-bold">{photo.title}</p>
                    <p className="text-[8px] uppercase tracking-widest opacity-60">{photo.location}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Explore Button */}
        <div className="flex flex-col items-center space-y-8">
          <div className="h-[80px] w-[1px] bg-zinc-200"></div>
          <Link 
            href="/gallery" 
            className="group flex flex-col items-center"
          >
            <span className="text-[10px] uppercase tracking-[0.5em] font-bold text-zinc-950 group-hover:opacity-60 transition-opacity">Explorar Acervo Completo</span>
            <div className="mt-4 p-5 border border-zinc-200 rounded-full group-hover:bg-zinc-950 group-hover:text-white transition-all shadow-sm">
              <LayoutGrid size={20} />
            </div>
          </Link>
        </div>
        </div>
      </div>
    </section>
  );
}
