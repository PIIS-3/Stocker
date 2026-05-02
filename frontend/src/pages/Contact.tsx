import { motion } from 'framer-motion';

export default function Contact() {
  return (
    <div className="pt-32 pb-24 px-6 max-w-4xl mx-auto min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">Contacto</h1>
        <p className="text-lg text-gray-600 mb-12">
          ¿Tienes alguna duda o sugerecia? Estamos aquí para ayudarte a optimizar la gestión de tus
          almacenes.
        </p>

        <form className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Nombre completo</label>
              <input
                type="text"
                className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                placeholder="Juan Pérez"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Correo electrónico</label>
              <input
                type="email"
                className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                placeholder="juan@ejemplo.com"
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Mensaje</label>
            <textarea
              rows={5}
              className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all resize-none"
              placeholder="¿En qué podemos ayudarte?"
            ></textarea>
          </div>
          <button
            type="button"
            className="bg-brand text-white px-8 py-4 rounded-xl font-semibold hover:bg-brand-dark transition-all transform hover:-translate-y-1 shadow-md self-start"
          >
            Enviar Mensaje
          </button>
        </form>
      </motion.div>
    </div>
  );
}
