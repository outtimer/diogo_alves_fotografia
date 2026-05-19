"use client";

import Link from "next/link";
import { Instagram, Twitter, Facebook, Palette, Image as ImageIcon, Aperture, Mail, Linkedin, Pin, Camera, Globe } from "lucide-react";

interface FooterProps {
  content: Record<string, string>;
}

export default function Footer({ content }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const copyright = content["footer_copyright"] || "Aura Portfolio. Built for clarity.";
  const tagline = content["footer_tagline"] || "Sao Paulo | Tokyo | Zurich";
  const ctaTitle = content["footer_cta_title"] || "Interessado em apoiar uma expedição?";
  const ctaDesc = content["footer_cta_desc"] || "Estou sempre em busca de parceiros para patrocinar novas jornadas fotográficas e documentar locais únicos ao redor do mundo.";

  return (
    <footer className="border-t border-zinc-200 py-12 px-6 bg-zinc-50/50">
      <div className="max-w-7xl 2xl:max-w-[1600px] 3xl:max-w-[2000px] mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="text-center md:text-left">
          <h4 className="font-display text-3xl lg:text-5xl text-zinc-950 italic mb-4">
            {ctaTitle}
          </h4>
          <p className="text-sm text-zinc-500 mb-8 max-w-sm leading-relaxed">
            {ctaDesc}
          </p>
          <p className="text-[11px] uppercase tracking-widest opacity-50">
            © {currentYear} {copyright}
          </p>
        </div>
        
        <div className="flex flex-col items-center md:items-end gap-6">
          <div className="flex flex-wrap justify-center md:justify-end gap-6 text-zinc-950">
            {content["social_instagram"] && (
              <a href={content["social_instagram"]} className="hover:opacity-50 transition-opacity" target="_blank" rel="noopener noreferrer" title="Instagram">
                <Instagram size={18} />
              </a>
            )}
            {content["social_twitter"] && (
              <a href={content["social_twitter"]} className="hover:opacity-50 transition-opacity" target="_blank" rel="noopener noreferrer" title="X (Twitter)">
                <Twitter size={18} />
              </a>
            )}
            {content["social_facebook"] && (
              <a href={content["social_facebook"]} className="hover:opacity-50 transition-opacity" target="_blank" rel="noopener noreferrer" title="Facebook">
                <Facebook size={18} />
              </a>
            )}
            {content["social_behance"] && (
              <a href={content["social_behance"]} className="hover:opacity-50 transition-opacity" target="_blank" rel="noopener noreferrer" title="Behance">
                <Palette size={18} />
              </a>
            )}
            {content["social_flickr"] && (
              <a href={content["social_flickr"]} className="hover:opacity-50 transition-opacity" target="_blank" rel="noopener noreferrer" title="Flickr">
                <ImageIcon size={18} />
              </a>
            )}
            {content["social_500px"] && (
              <a href={content["social_500px"]} className="hover:opacity-50 transition-opacity" target="_blank" rel="noopener noreferrer" title="500px">
                <Aperture size={18} />
              </a>
            )}
            {content["social_linkedin"] && (
              <a href={content["social_linkedin"]} className="hover:opacity-50 transition-opacity" target="_blank" rel="noopener noreferrer" title="LinkedIn">
                <Linkedin size={18} />
              </a>
            )}
            {content["social_pinterest"] && (
              <a href={content["social_pinterest"]} className="hover:opacity-50 transition-opacity" target="_blank" rel="noopener noreferrer" title="Pinterest">
                <Pin size={18} />
              </a>
            )}
            {content["social_unsplash"] && (
              <a href={content["social_unsplash"]} className="hover:opacity-50 transition-opacity" target="_blank" rel="noopener noreferrer" title="Unsplash">
                <Camera size={18} />
              </a>
            )}
            {content["social_vero"] && (
              <a href={content["social_vero"]} className="hover:opacity-50 transition-opacity" target="_blank" rel="noopener noreferrer" title="Vero">
                <Globe size={18} />
              </a>
            )}
            <Link href="/contact" className="hover:opacity-50 transition-opacity" title="Contato">
              <Mail size={18} />
            </Link>
          </div>
          <div className="h-[1px] w-48 bg-zinc-200"></div>
          <p className="text-[10px] uppercase tracking-[0.4em] opacity-30 text-zinc-900">
            {tagline}
          </p>
        </div>
      </div>
    </footer>
  );
}
