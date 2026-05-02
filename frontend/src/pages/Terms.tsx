import { motion } from 'framer-motion';

export default function Terms() {
  return (
    <div className="pt-32 pb-24 px-6 max-w-4xl mx-auto min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">Términos de Servicio</h1>

        <article className="prose prose-gray max-w-none prose-headings:text-gray-900 prose-p:text-gray-600 bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100">
          <p className="lead text-lg mb-8">
            Bienvenido a Stocker. Estos términos de servicio ("Términos", "Acuerdo") es un acuerdo
            entre el operador del sitio Stocker ("Operador del Sitio web", "nosotros") y usted
            ("Usuario", "usted"). Este Acuerdo establece las condiciones generales de uso de nuestra
            plataforma y sistema de gestión.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">1. Cuentas y membresía</h2>
          <p className="mb-6">
            Si crea una cuenta en el sistema de gestión como empleado o administrador, usted es
            responsable de mantener la seguridad de su cuenta y es totalmente responsable de las
            actividades que ocurran bajo la cuenta y cualquier otra acción tomada en relación con
            ella.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">2. Contenido del usuario</h2>
          <p className="mb-6">
            No somos dueños de ningún dato, información o material (registro de inventarios,
            información de lotes, trazabilidad) que envíe en el Sitio web durante el uso del
            Servicio. Usted será el único responsable de la precisión, calidad, integridad,
            legalidad, confiabilidad, idoneidad y propiedad intelectual o el derecho a usar todo el
            Contenido del Usuario.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">3. Limitación de responsabilidad</h2>
          <p className="mb-6">
            En la máxima medida permitida por la ley aplicable, en ningún caso el Operador de la
            plataforma será responsable frente a ninguna persona por daños indirectos, incidentales,
            o consecuentes derivados del uso del sistema de control de inventario.
          </p>

          <p className="text-sm text-gray-500 mt-12 pt-8 border-t border-gray-100">
            Última actualización: {new Date().toLocaleDateString()}
          </p>
        </article>
      </motion.div>
    </div>
  );
}
