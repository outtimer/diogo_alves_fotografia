"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Instagram, Twitter, Mail, LayoutGrid, User, ShieldCheck, Home, BookOpen } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";

export default function Sidebar({ content = {} }: { content?: Record<string, string> }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Fecha o menu ao mudar de rota (mobile)
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const navItems = [
    { name: "Início", href: "/", icon: Home },
    { name: "Galeria", href: "/gallery", icon: LayoutGrid },
    { name: "Blog", href: "/#blog", icon: BookOpen },
    { name: "Sobre", href: "/about", icon: User },
    { name: "Contato", href: "/contact", icon: Mail },
  ];

  return (
    <>
      {/* Botão de Toggle (Minimalista) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-8 left-8 z-[100] p-3 hover:bg-zinc-100/50 rounded-full transition-all group flex items-center justify-center"
        aria-label="Toggle Menu"
      >
        {isOpen ? (
          <X size={20} className="text-zinc-400 group-hover:text-zinc-950 transition-colors" />
        ) : (
          <div className="flex flex-col space-y-1.5 items-start px-1">
            <motion.div animate={{ width: isOpen ? 0 : 20 }} className="h-[1px] bg-zinc-400 group-hover:bg-zinc-950 transition-colors" />
            <motion.div animate={{ width: isOpen ? 0 : 14 }} className="h-[1px] bg-zinc-400 group-hover:bg-zinc-950 transition-colors" />
            <motion.div animate={{ width: isOpen ? 0 : 18 }} className="h-[1px] bg-zinc-400 group-hover:bg-zinc-950 transition-colors" />
          </div>
        )}
      </button>

      {/* Overlay para fechar ao clicar fora */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-zinc-950/20 backdrop-blur-sm z-[80]"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Content */}
      <motion.aside
        initial={false}
        animate={{ 
          x: isOpen ? 0 : "-100%",
        }}
        style={{ 
          pointerEvents: isOpen ? "auto" : "none" 
        }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed top-0 left-0 h-screen w-80 bg-white z-[90] border-r border-zinc-100 flex flex-col p-12 pt-16 shadow-2xl"
      >
        {/* Logo no topo do menu */}
        <div className="mb-16">
          <Link href="/" className="group block">
            <Logo className="w-10 h-10 mb-6 text-zinc-950 group-hover:rotate-12 transition-transform duration-500" />
            <h2 className="font-display text-3xl text-zinc-950 italic leading-none tracking-tighter">
              Diogo <span className="block ml-6 text-zinc-400 group-hover:text-zinc-600 transition-colors">Alves.</span>
            </h2>
            <p className="text-[9px] uppercase tracking-[0.4em] mt-4 opacity-30 font-medium">Fine Art Photography</p>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-8">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`flex items-center space-x-4 text-[11px] uppercase tracking-[0.2em] transition-all hover:text-zinc-950 ${
                pathname === item.href ? "text-zinc-950 font-bold" : "opacity-40"
              }`}
            >
              <item.icon size={16} />
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        {/* Footer Sidebar */}
        <div className="mt-auto pt-8 border-t border-zinc-50">
          <div className="flex space-x-6 mb-8 text-zinc-400">
            <a href={content["social_instagram"] || "#"} className="hover:text-zinc-950 transition-colors" target="_blank" rel="noopener noreferrer">
              <Instagram size={18} />
            </a>
            <a href={content["social_twitter"] || "#"} className="hover:text-zinc-950 transition-colors" target="_blank" rel="noopener noreferrer">
              <Twitter size={18} />
            </a>
            <a href={`mailto:${content["contact_email"] || "contato@diogoalves.com"}`} className="hover:text-zinc-950 transition-colors">
              <Mail size={18} />
            </a>
          </div>
          <Link 
            href="/admin" 
            className="flex items-center space-x-2 text-[10px] uppercase tracking-widest text-zinc-300 hover:text-zinc-600 mb-6 transition-colors group"
          >
            <ShieldCheck size={14} />
            <span>Admin</span>
          </Link>
          <p className="text-[9px] uppercase tracking-widest opacity-30">
            {content["footer_copyright"] || "© 2024 Aura Portfolio"}
          </p>
        </div>
      </motion.aside>
    </>
  );
}
