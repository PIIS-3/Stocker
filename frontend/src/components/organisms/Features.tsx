import { motion } from 'framer-motion';
import { Box, Layers, AlertCircle } from 'lucide-react';

const features = [
  {
    icon: <Box className="w-8 h-8 text-brand" />,
    title: 'Control de inventario inteligente',
    description:
      'Visualiza y administra tus niveles de stock en tiempo real. Utiliza algoritmos predictivos para evitar quiebres y sobrestock.',
  },
  {
    icon: <Layers className="w-8 h-8 text-brand" />,
    title: 'Gestión de lotes',
    description:
      'Organiza tus productos por lotes, fechas de caducidad y ubicación exacta. Maximiza el rendimiento del espacio en tus almacenes.',
  },
  {
    icon: <AlertCircle className="w-8 h-8 text-brand" />,
    title: 'Trazabilidad de fallos',
    description:
      'Detecta incidencias en tiempo real. Rastrea el origen de fallos y mermas para aplicar soluciones inmediatas y mejorar la calidad.',
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 tracking-tight"
          >
            Todo lo que necesitas para tu <span className="text-brand">cadena de suministro</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-gray-600"
          >
            Stocker te ofrece herramientas avanzadas para transformar la manera en que gestionas tus
            almacenes y tiendas físicas.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="bg-gray-50 rounded-2xl p-8 hover:bg-white hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border border-gray-100 group"
            >
              <div className="w-16 h-16 bg-white rounded-xl shadow-sm flex items-center justify-center mb-6 border border-gray-100 group-hover:scale-110 group-hover:bg-brand/5 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
