import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brand/10 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full bg-brand/5 blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10 w-full grid lg:grid-cols-2 gap-12 items-center">
        <div className="flex flex-col items-start text-left max-w-2xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand/10 text-brand font-medium text-sm mb-6 border border-brand/20"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand"></span>
            </span>
            SGA Sistema de Gestión
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-[1.1] mb-6 tracking-tight"
          >
            Optimiza almacenes y <span className="text-brand">tiendas físicas</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed max-w-lg"
          >
            Control de inventario inteligente, gestión de lotes y trazabilidad de fallos en tiempo real para llevar tu logística al siguiente nivel.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
          >
            <button className="bg-brand text-white px-8 py-4 rounded-xl font-semibold hover:bg-brand-dark transition-all transform hover:-translate-y-1 shadow-xl shadow-brand/30 flex items-center justify-center gap-2 group text-lg">
              Empezar ahora
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9, x: 20 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative lg:h-[600px] flex justify-center items-center perspective-1000"
        >
          {/* Abstract Dashboard Illustration */}
          <div className="relative w-full max-w-md aspect-[4/3] bg-white rounded-2xl shadow-2xl shadow-brand/20 border border-gray-100 p-6 overflow-hidden flex flex-col gap-4 transform rotate-y-[-5deg] rotate-x-[5deg]">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-2">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
              </div>
              <div className="h-4 w-24 bg-gray-100 rounded-full"></div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-brand/5 rounded-xl p-4 flex flex-col gap-2">
                <div className="text-brand text-sm font-medium">Inventario</div>
                <div className="text-2xl font-bold text-gray-800">12,450</div>
                <div className="text-xs text-green-600">+14% esta semana</div>
              </div>
              <div className="bg-brand/5 rounded-xl p-4 flex flex-col gap-2">
                <div className="text-brand text-sm font-medium">Lotes Activos</div>
                <div className="text-2xl font-bold text-gray-800">342</div>
                <div className="text-xs text-brand">+5 nuevos</div>
              </div>
            </div>
            
            <div className="flex-1 rounded-xl bg-gray-50 border border-gray-100 p-4 relative overflow-hidden">
               <div className="absolute bottom-0 left-0 w-full h-[60%] bg-gradient-to-t from-brand/20 to-transparent"></div>
               {/* Decorative graph bars */}
               <div className="flex items-end justify-between h-full w-full px-2 gap-2 relative z-10">
                 {[40, 70, 45, 90, 65, 80, 55].map((height, i) => (
                   <motion.div 
                     key={i} 
                     initial={{ height: 0 }}
                     animate={{ height: `${height}%` }}
                     transition={{ duration: 1, delay: 0.5 + (i * 0.1) }}
                     className="w-full bg-brand rounded-t-sm opacity-80"
                   ></motion.div>
                 ))}
               </div>
            </div>
          </div>
          
          {/* Floating UI Elements */}
          <motion.div 
             animate={{ y: [-10, 10, -10] }}
             transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
             className="absolute -right-8 -top-8 glass p-4 rounded-xl flex items-center gap-4 shadow-xl pointer-events-none"
          >
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold">✓</div>
            <div>
              <div className="text-sm font-bold text-gray-800">Lote #8493</div>
              <div className="text-xs text-gray-500">Trazabilidad OK</div>
            </div>
          </motion.div>
          
          <motion.div 
             animate={{ y: [10, -10, 10] }}
             transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
             className="absolute -left-12 bottom-12 glass p-4 rounded-xl flex items-center gap-4 shadow-xl pointer-events-none"
          >
            <div className="w-12 h-12 bg-brand/20 text-brand rounded-full flex items-center justify-center font-bold">!</div>
            <div>
              <div className="text-sm font-bold text-gray-800">Alerta Stock Bajo</div>
              <div className="text-xs text-gray-500">Producto SK-492</div>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}
