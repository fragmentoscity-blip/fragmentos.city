/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Leaf, Award, Recycle, Map, Compass } from "lucide-react";

export default function Sustainability() {
  return (
    <section id="sostenibilidad" className="w-full bg-brand-sand/15 text-brand-navy py-24 px-4 md:px-12 border-t border-brand-gray/30">
      <div className="max-w-7xl mx-auto">
        
        {/* Aesthetic Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Left info - 5 Columns */}
          <div className="lg:col-span-5 space-y-10">
            <div>
              <span className="text-[10px] uppercase tracking-[0.3em] text-brand-terracotta font-bold">Eco-Arquitectura</span>
              <h2 className="text-3xl md:text-5xl font-light tracking-tight mt-2 text-brand-navy">Impresión Consciente</h2>
              <p className="text-gray-600 font-sans text-xs md:text-sm mt-4 leading-relaxed">
                Cada fragmento decorativo es fabricado bajo demanda para evitar el desperdicio industrial, utilizando recursos de origen biológico.
              </p>
            </div>

            <div className="space-y-8">
              {/* Pillar 1 */}
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-white border border-brand-gray/40 text-brand-navy flex items-center justify-center shrink-0 rounded-none">
                  <Leaf className="w-4 h-4 text-brand-terracotta" />
                </div>
                <div>
                  <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-brand-navy">Bioplástico PLA Biodegradable</h4>
                  <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                    Nuestros filamentos se derivan del almidón de maíz, trigo y remolacha. Son compostables y libres de derivados de combustibles fósiles.
                  </p>
                </div>
              </div>

              {/* Pillar 2 */}
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-white border border-brand-gray/40 text-brand-navy flex items-center justify-center shrink-0 rounded-none">
                  <Recycle className="w-4 h-4 text-brand-navy" />
                </div>
                <div>
                  <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-brand-navy">Cero Desperdicio de Material</h4>
                  <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                    No producimos lotes masivos. Todo cuadro se crea uno a uno tras confirmar la orden. El residuo sobrante se recicla por completo para nuevos filamentos.
                  </p>
                </div>
              </div>

              {/* Pillar 3 */}
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-white border border-brand-gray/40 text-brand-navy flex items-center justify-center shrink-0 rounded-none">
                  <Award className="w-4 h-4 text-brand-terracotta" />
                </div>
                <div>
                  <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-brand-navy">Manufactura Local</h4>
                  <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                    Diseñamos, modelamos y terminamos cada cuadro de madera natural en nuestro taller ubicado en Bogotá, reduciendo críticamente la huella de logística.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right graphic layout - 7 Columns */}
          <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Visual Block 1 */}
            <div className="bg-white border border-brand-gray/30 p-8 rounded-none flex flex-col justify-between min-h-[220px]">
              <div>
                <Map className="w-7 h-7 text-brand-navy mb-4" />
                <h3 className="text-lg font-light tracking-tight text-brand-navy">Archivos GIS Reales</h3>
                <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                  Utilizamos bases de datos topográficas satelitales oficiales para extraer curvas de nivel e hidrografías reales, logrando máxima veracidad volumétrica.
                </p>
              </div>
              <span className="text-[9px] font-mono tracking-widest text-brand-terracotta mt-6">PRECISIÓN ARQUITECTÓNICA</span>
            </div>

            {/* Visual Block 2 */}
            <div className="bg-white border border-brand-gray/30 p-8 rounded-none flex flex-col justify-between min-h-[220px]">
              <div>
                <Compass className="w-7 h-7 text-brand-navy mb-4" />
                <h3 className="text-lg font-light tracking-tight text-brand-navy">Madera Sustentable</h3>
                <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                  Los marcos de madera natural provienen de fuentes forestales locales certificadas con reforestación activa. El acabado se aplica artesanalmente con ceras naturales.
                </p>
              </div>
              <span className="text-[9px] font-mono tracking-widest text-brand-terracotta mt-6">CERTIFICACIÓN RESPONSABLE</span>
            </div>

            {/* Banner Block spans 2 columns */}
            <div className="md:col-span-2 bg-white border border-brand-gray/30 rounded-none overflow-hidden relative flex flex-col justify-center items-start p-8 md:p-12 text-brand-navy min-h-[180px]">
              <div className="absolute inset-0 opacity-10">
                <img
                  src="/src/assets/images/bogota_3d_frame_1781095869593.png"
                  alt="Textura filamento 3D"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover grayscale scale-[1.2]"
                />
              </div>
              <div className="relative z-10 max-w-lg">
                <span className="text-[9px] font-mono tracking-widest uppercase text-brand-terracotta font-bold">Innovación Texturizada</span>
                <h3 className="text-xl md:text-2xl font-light tracking-tight mt-1 mb-2">35 horas de impresión milimétrica por fragmento</h3>
                <p className="text-gray-600 text-xs leading-relaxed">
                  Al tocar el relieve, sentirás cada elevación topográfica precisa. Una obra arquitectónica orgánica que cuida el planeta mientras viste tus espacios de elegancia.
                </p>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
