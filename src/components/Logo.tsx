"use client";

import { motion } from "framer-motion";

export default function Logo({ className = "w-8 h-8", color = "currentColor" }: { className?: string; color?: string }) {
  return (
    <motion.svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      initial={{ rotate: -90, opacity: 0 }}
      animate={{ rotate: 0, opacity: 1 }}
      transition={{ duration: 1, ease: "easeOut" }}
    >
      {/* Círculo externo ultra-fino */}
      <circle cx="50" cy="50" r="48" stroke={color} strokeWidth="1" strokeDasharray="4 4" opacity="0.2" />
      
      {/* Símbolo Abstrato 'DA' / Obturador */}
      <path
        d="M30 30L70 70M70 30L30 70"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.3"
      />
      
      {/* "D" estilizado */}
      <path
        d="M45 35V65C45 65 65 65 65 50C65 35 45 35 45 35Z"
        stroke={color}
        strokeWidth="4"
        strokeLinejoin="round"
      />
      
      {/* Ponto focal (como uma lente) */}
      <circle cx="50" cy="50" r="4" fill={color} />
      
      {/* Linha de horizonte/reflexo */}
      <motion.path
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, delay: 0.5 }}
        d="M20 50H80"
        stroke={color}
        strokeWidth="0.5"
        opacity="0.5"
      />
    </motion.svg>
  );
}
