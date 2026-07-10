"use client";

import { motion } from "framer-motion";
import Logo from "./Logo";
import Image from "next/image";

interface HeroProps {
  content: Record<string, string>;
}

export default function Hero({ content }: HeroProps) {
  return (
    <header className="h-screen flex flex-col justify-center items-center px-6 relative overflow-hidden bg-[#fbfbf8]">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <Image 
          src={content["home_hero_bg_url"] || "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&q=80&w=2000"} 
          alt="Atmospheric landscape" 
          fill
          className="object-cover opacity-[0.25] grayscale"
          priority
          referrerPolicy="no-referrer"
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        className="text-center z-10"
      >
         <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="mb-12 flex flex-col items-center justify-center space-y-8"
        >
           <h1 className="font-display text-5xl md:text-8xl lg:text-9xl 3xl:text-[12rem] text-zinc-950 italic tracking-tighter flex flex-col md:flex-row items-center justify-center gap-6">
             <Logo className="w-16 h-16 md:w-24 md:h-24 3xl:w-32 3xl:h-32 text-zinc-950" />
             <span className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
               <span>{content["home_hero_title_1"] || "Diogo"}</span>
               <span className="text-zinc-400">{content["home_hero_title_2"] || "Alves"}</span>
             </span>
           </h1>
           <motion.div 
            initial={{ width: 0 }}
            animate={{ width: "40%" }}
            transition={{ duration: 1, delay: 0.8 }}
            className="h-[1px] bg-zinc-200 mt-6 mx-auto max-w-[500px]"
           ></motion.div>
        </motion.div>

        <motion.span 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }}
          transition={{ delay: 1 }}
          className="text-[10px] 3xl:text-xs uppercase tracking-[0.6em] mb-6 block text-zinc-600 font-bold"
        >
          {content["home_hero_subtitle"] || "Fotógrafo de Paisagens & Vida"}
        </motion.span>
        
        <h2 className="font-display text-4xl md:text-7xl lg:text-8xl 3xl:text-[10rem] text-zinc-950 italic max-w-5xl lg:max-w-7xl 3xl:max-w-[1800px] leading-[1.05] tracking-tight text-balance">
          {content["home_hero_main_text"] || "Capturando a essência do cotidiano em luz e cor."}
        </h2>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 text-zinc-700 font-bold"
      >
        <p className="text-[9px] uppercase tracking-[0.8em] animate-bounce">Deslize para explorar</p>
      </motion.div>
    </header>
  );
}
