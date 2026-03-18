import { motion } from 'framer-motion';

export default function Privacy() {
  return (
    <div className="pt-32 pb-24 px-6 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">Política de Privacidad</h1>
        
        <article className="prose prose-gray max-w-none prose-headings:text-gray-900 prose-p:text-gray-600 bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100">
          <p className="lead text-lg mb-8">
            En Stocker, respetamos su privacidad y nos comprometemos a proteger sus datos personales. Esta política de privacidad le informará sobre cómo cuidamos sus datos personales cuando visita nuestro sitio web o utiliza nuestra aplicación.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">1. La información que recopilamos</h2>
          <p className="mb-6">
            Recopilamos varios tipos de información de y sobre los usuarios de nuestra aplicación, incluyendo información que sirve para identificarle personalmente como nombre, dirección postal, dirección de correo electrónico, y número de teléfono.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">2. Cómo usamos su información</h2>
          <p className="mb-6">
            Utilizamos la información que recopilamos sobre usted o que nos proporciona, incluyendo cualquier información personal, para:
          </p>
          <ul className="list-disc pl-6 mb-6 space-y-2 text-gray-600">
            <li>Presentar nuestra aplicación y sus contenidos.</li>
            <li>Proporcionarle información, productos o servicios que nos solicite.</li>
            <li>Cumplir con nuestras obligaciones comerciales y operativas relacionadas con nuestro Sistema de Gestión de Almacenes.</li>
            <li>Notificarle sobre cambios en nuestra aplicación o cualquier producto o servicio que ofrecemos a través de ella.</li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4">3. Seguridad de los datos</h2>
          <p className="mb-6">
            Hemos implementado medidas diseñadas para asegurar su información personal frente a pérdidas accidentales y frente a accesos, uso, alteración y exposición no autorizados. Al utilizar sistemas basados en autenticación y cifrado (hashes), protegemos la integridad del acceso a los perfiles de los empleados.
          </p>

          <p className="text-sm text-gray-500 mt-12 pt-8 border-t border-gray-100">
            Última actualización: {new Date().toLocaleDateString()}
          </p>
        </article>
      </motion.div>
    </div>
  );
}
