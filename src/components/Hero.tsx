/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { ArrowDown, Layers, MapPin, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface HeroProps {
  onScrollToCatalog: () => void;
}

const slideImages = [
  {
    url: "/src/assets/images/bogota_3d_frame_1781095869593.png",
    city: "Bogotá",
    desc: "Plano cuadra por cuadra y cerros orientales en bioplástico blanco.",
    coords: "4.6097° N, 74.0817° W"
  },
  {
    url: "/src/assets/images/paris_3d_frame_1781095885040.png",
    city: "París",
    desc: "La simetría del Sena y barrios imperiales en marco negro de madera.",
    coords: "48.8566° N, 2.3522° E"
  },
  {
    url: "/src/assets/images/barcelona_3d_frame_1781095898025.png",
    city: "Barcelona",
    desc: "La perfecta cuadrícula del Eixample con relieve detallado en marco blanco.",
    coords: "41.3851° N, 2.1734° E"
  }
];

export default function Hero({ onScrollToCatalog }: HeroProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slideImages.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="hero" className="relative w-full min-h-[100vh] md:h-[100vh] md:min-h-[700px] bg-neutral-950 flex flex-col overflow-hidden">
      {/* Background slider with fade transition */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 0.6, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute inset-0 w-full h-full"
          >
            <img
              src={slideImages[currentSlide].url}
              alt={`Fragmentos ${slideImages[currentSlide].city}`}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover brightness-[0.4]"
            />
          </motion.div>
        </AnimatePresence>
        {/* Elegant top/bottom gradients for absolute contrast and text visibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-neutral-950/80" />
        <div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-neutral-950/40 to-transparent" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 flex-1 flex flex-col justify-center max-w-7xl mx-auto w-full px-4 md:px-8 pt-24 pb-12">
        <div className="max-w-3xl space-y-6 md:space-y-8 select-none">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 backdrop-blur rounded-full"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-mono tracking-widest text-neutral-300 uppercase">Filamento Biodegradable 3D</span>
          </motion.div>

          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="space-y-4"
          >
            <h1 className="text-4xl md:text-7xl font-serif text-white tracking-tight leading-[1.1]">
              Capturamos la esencia de cada lugar en <span className="italic block mt-1 font-light font-serif">fragmentos decorativos.</span>
            </h1>
            <p className="text-neutral-400 text-sm md:text-lg font-sans max-w-xl font-light leading-relaxed">
              Mapeamos topografías e hidrografías exactas de ciudades del mundo y las materializamos en relieves minimalistas impresos en 3D ecológico.
            </p>
          </motion.div>

          {/* Call to actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4"
          >
            <button
              onClick={onScrollToCatalog}
              className="bg-white hover:bg-neutral-200 text-neutral-900 text-center font-mono text-xs uppercase tracking-widest px-8 py-4 transition-all duration-300 font-bold flex items-center justify-center gap-2 hover:translate-y-[-1px] active:translate-y-0 shadow-lg"
            >
              Explorar Colección de Relieves
            </button>
          </motion.div>
        </div>
      </div>

      {/* HUD and Bottom Controls */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-8 pb-8 flex flex-col md:flex-row items-start md:items-end justify-between gap-8 select-none">
        {/* Bottom slide dots and scroll down indicators */}
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          {/* Slides indicator */}
          <div className="flex items-center gap-2">
            {slideImages.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-1.5 transition-all ${currentSlide === idx ? "w-8 bg-white" : "w-2 bg-white/20 hover:bg-white/40"}`}
                title={`Ver diapositiva ${idx + 1}`}
              />
            ))}
          </div>

          <button
            onClick={onScrollToCatalog}
            className="text-neutral-400 hover:text-white text-[11px] font-mono tracking-widest uppercase flex items-center gap-2 transition-colors duration-200"
          >
            <ArrowDown className="w-3.5 h-3.5 animate-bounce" /> Deslizar para explorar
          </button>
        </div>

        {/* HUD showing information of current display map slide */}
        <div className="hidden md:flex items-center gap-4 text-white">
          <div className="text-right border-r border-white/20 pr-4">
            <div className="font-serif italic text-lg">{slideImages[currentSlide].city}</div>
            <div className="text-[10px] font-mono text-neutral-400 mt-1 uppercase max-w-[280px] leading-relaxed">
              {slideImages[currentSlide].desc}
            </div>
          </div>
          <div className="font-mono text-[10px] text-neutral-400 tracking-wider flex items-center gap-1.5 self-center">
            <MapPin className="w-3.5 h-3.5 text-white" />
            {slideImages[currentSlide].coords}
          </div>
        </div>
      </div>
    </section>
  );
}
