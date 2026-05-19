import { useState } from 'react';

const sprints = [
  {
    id: 1,
    name: 'Sprint 1',
    dates: '8 feb – 29 mar',
    status: 'done',
    focus: 'Infraestructura y Arquitectura',
    points: 21,
    tasks: [
      {
        id: 'P3-63',
        name: 'Contenerización y Orquestación del Entorno',
        tag: 'INFRA',
        color: '#0F6E56',
        status: 'done',
        subtasks: [],
      },
      {
        id: 'P3-64',
        name: 'Inicialización de Arquitectura y Boilerplates',
        tag: 'INFRA',
        color: '#0F6E56',
        status: 'done',
        subtasks: [],
      },
      {
        id: 'P3-66',
        name: 'Definición de Identidad Visual y Guía de Estilos',
        tag: 'ARQ',
        color: '#534AB7',
        status: 'done',
        subtasks: [],
      },
      {
        id: 'P3-65',
        name: 'Prototipado de Alta Fidelidad (Mockups)',
        tag: 'ARQ',
        color: '#534AB7',
        status: 'done',
        subtasks: [],
      },
      {
        id: 'P3-136',
        name: 'Configuración de Persistencia y Migraciones',
        tag: 'INFRA',
        color: '#0F6E56',
        status: 'done',
        subtasks: [],
      },
      {
        id: 'P3-137',
        name: 'Configuración del Sistema de Diseño en Código',
        tag: 'ARQ',
        color: '#534AB7',
        status: 'done',
        subtasks: [],
      },
    ],
  },
  {
    id: 2,
    name: 'Sprint 2',
    dates: '1 mar – 15 mar',
    status: 'done',
    focus: 'Modelo de Datos y Vistas Base',
    points: 27,
    tasks: [
      {
        id: 'P3-227',
        name: 'Modelado de Datos y API de Catálogo',
        tag: 'BACK',
        color: '#185FA5',
        status: 'done',
        subtasks: [],
      },
      {
        id: 'P3-228',
        name: 'Implementación de Seeder de Datos Iniciales',
        tag: 'BACK',
        color: '#185FA5',
        status: 'done',
        subtasks: [],
      },
      {
        id: 'P3-229',
        name: 'Integración de API y Listado Dinámico',
        tag: 'FRONT',
        color: '#D85A30',
        status: 'done',
        subtasks: [],
      },
      {
        id: 'P3-230',
        name: 'Desarrollo de Vistas Públicas e Informativas',
        tag: 'FRONT',
        color: '#D85A30',
        status: 'done',
        subtasks: [],
      },
      {
        id: 'P3-231',
        name: 'Desarrollo de Vistas Administrativas',
        tag: 'FRONT',
        color: '#D85A30',
        status: 'done',
        subtasks: [],
      },
      {
        id: 'P3-232',
        name: 'Documentación Técnica y Diccionario de Datos',
        tag: 'GESTIÓN',
        color: '#854F0B',
        status: 'done',
        subtasks: [],
      },
      {
        id: 'P3-233',
        name: 'Testing de Navegación e Integración de Datos',
        tag: 'QA',
        color: '#993556',
        status: 'done',
        subtasks: [],
      },
    ],
  },
  {
    id: 3,
    name: 'Sprint 3',
    dates: '15 mar – 15 abr',
    status: 'done',
    focus: 'CRUD Core, CI y Documentación',
    points: 30,
    tasks: [
      {
        id: 'P3-168',
        name: 'Corrección de .gitignore para .env.example',
        tag: 'GIT',
        color: '#5F5E5A',
        status: 'done',
        subtasks: [],
      },
      {
        id: 'P3-207',
        name: 'Sincronización de node_modules local',
        tag: 'TOOLING',
        color: '#5F5E5A',
        status: 'done',
        subtasks: [],
      },
      {
        id: 'P3-216',
        name: 'Saneamiento del Backlog y Tablero Jira',
        tag: 'GESTIÓN',
        color: '#854F0B',
        status: 'done',
        subtasks: [],
      },
      {
        id: 'P3-235',
        name: 'CRUDs de Gestión Core (Categorías, Tiendas, Empleados)',
        tag: 'BACK',
        color: '#185FA5',
        status: 'done',
        subtasks: [],
      },
      {
        id: 'P3-237',
        name: 'Suite de Pruebas Unitarias para Backend',
        tag: 'QA',
        color: '#993556',
        status: 'done',
        subtasks: [],
      },
      {
        id: 'P3-238',
        name: 'Automatización de Integración Continua (CI)',
        tag: 'DEVOPS',
        color: '#0F6E56',
        status: 'done',
        subtasks: [],
      },
      {
        id: 'P3-241',
        name: 'Seguimiento de Métricas de Sprint y Velocity',
        tag: 'GESTIÓN',
        color: '#854F0B',
        status: 'done',
        subtasks: [],
      },
      {
        id: 'P3-288',
        name: 'Población de Datos y Documentación Técnica',
        tag: 'DATA',
        color: '#534AB7',
        status: 'done',
        subtasks: [],
      },
      {
        id: 'P3-289',
        name: 'Lógica de Integración y Servicios CRUD (Frontend)',
        tag: 'FRONT',
        color: '#D85A30',
        status: 'done',
        subtasks: [],
      },
      {
        id: 'P3-290',
        name: 'Interfaz de Gestión con Atomic Design',
        tag: 'FRONT',
        color: '#D85A30',
        status: 'done',
        subtasks: [],
      },
    ],
  },
  {
    id: 4,
    name: 'Sprint 4',
    dates: '15 abr – 29 abr',
    status: 'done',
    focus: 'Autenticación, Seguridad y Documentación',
    points: 35,
    tasks: [
      {
        id: 'P3-243',
        name: 'Sistema de Autenticación con JWT y Hashing',
        tag: 'AUTH',
        color: '#993556',
        status: 'done',
        subtasks: [],
      },
      {
        id: 'P3-245',
        name: 'Control de Acceso basado en Roles (RBAC)',
        tag: 'AUTH',
        color: '#993556',
        status: 'done',
        subtasks: [],
      },
      {
        id: 'P3-244',
        name: 'Gestión de Sesión y Rutas Protegidas (Frontend)',
        tag: 'AUTH',
        color: '#993556',
        status: 'done',
        subtasks: [],
      },
      {
        id: 'P3-236',
        name: 'CRUD de Usuarios y Gestión de Roles',
        tag: 'BACK',
        color: '#185FA5',
        status: 'done',
        subtasks: [],
      },
      {
        id: 'P3-286',
        name: 'Revisión y limpieza de comentarios en CRUD',
        tag: 'DOCS',
        color: '#854F0B',
        status: 'done',
        subtasks: [],
      },
      {
        id: 'P3-242',
        name: 'Formación Técnica y Estandarización de GitFlow',
        tag: 'ARQ',
        color: '#534AB7',
        status: 'done',
        subtasks: [],
      },
      {
        id: 'P3-287',
        name: 'Automatización de Estándares de Código en CI',
        tag: 'QA',
        color: '#0F6E56',
        status: 'done',
        subtasks: [],
      },
      {
        id: 'P3-310',
        name: 'Suite de Pruebas Frontend y Automatización CI',
        tag: 'QA',
        color: '#0F6E56',
        status: 'done',
        subtasks: [],
      },
      {
        id: 'P3-304',
        name: 'Elaboración de Guías Técnicas de Desarrollo',
        tag: 'DOCS',
        color: '#854F0B',
        status: 'done',
        subtasks: [],
      },
      {
        id: 'P3-240',
        name: 'Documentación de API (OpenAPI) y Contribución',
        tag: 'DOCS',
        color: '#854F0B',
        status: 'done',
        subtasks: [],
      },
    ],
  },
  {
    id: 5,
    name: 'Sprint 5',
    dates: '30 abr – 16 may',
    status: 'done',
    focus: 'Seguridad, Calidad y Experiencia de Usuario',
    points: 24,
    tasks: [
      {
        id: 'P3-317',
        name: 'Correcciones de seguridad y mejoras en autenticación de empleados',
        tag: 'BACK',
        color: '#185FA5',
        status: 'done',
        subtasks: [
          { id: 'P3-330', name: 'Hashing de contraseña en EmployeeCreate', status: 'done' },
          { id: 'P3-331', name: 'Endpoint GET /employees/me', status: 'done' },
          { id: 'P3-332', name: 'fix: get_current_admin lee el rol desde la BD', status: 'done' },
          {
            id: 'P3-333',
            name: 'Actualizar tests de employees tras cambios de seguridad',
            status: 'done',
          },
        ],
      },
      {
        id: 'P3-318',
        name: 'Crear el middleware con FastAPI',
        tag: 'BACK',
        color: '#185FA5',
        status: 'done',
        subtasks: [],
      },
      {
        id: 'P3-316',
        name: 'Creación de nuevos Tests',
        tag: 'QA',
        color: '#993556',
        status: 'done',
        subtasks: [
          { id: 'P3-319', name: 'Productos CRUD + Auth', status: 'done' },
          { id: 'P3-320', name: 'Productos API', status: 'done' },
        ],
      },
      {
        id: 'P3-325',
        name: 'Crear página de ajustes del dashboard',
        tag: 'FRONT',
        color: '#D85A30',
        status: 'done',
        subtasks: [],
      },
      {
        id: 'P3-329',
        name: 'Pipeline de Calidad Backend (Ruff, MyPy, pytest-cov)',
        tag: 'QA',
        color: '#993556',
        status: 'done',
        subtasks: [],
      },
      {
        id: 'P3-334',
        name: 'Información del Sprint 5',
        tag: 'GESTIÓN',
        color: '#854F0B',
        status: 'done',
        subtasks: [
          { id: 'P3-335', name: 'Incorporación del SP5 al Roadmap', status: 'done' },
          { id: 'P3-336', name: 'Creación de métricas del SP5', status: 'done' },
          {
            id: 'P3-353',
            name: 'Creación del sprint 5 y sus historias/tareas/issues en Jira',
            status: 'done',
          },
        ],
      },
      {
        id: 'P3-337',
        name: 'Estandarización de arquitectura frontend CRUD',
        tag: 'FRONT',
        color: '#D85A30',
        status: 'done',
        subtasks: [
          {
            id: 'P3-338',
            name: 'Hook useCrud centralizado para estados, modales y paginación',
            status: 'done',
          },
          {
            id: 'P3-339',
            name: 'Refactorizar formularios (ProductForm, UserForm, StoreForm, CategoryForm)',
            status: 'done',
          },
          { id: 'P3-340', name: 'Migrar gestión de datos a React Query', status: 'done' },
          {
            id: 'P3-341',
            name: 'Nuevo componente CrudTable en sustitución de DataTable',
            status: 'done',
          },
          { id: 'P3-342', name: 'Añadir ProtectedRoute y ScrollToTop', status: 'done' },
        ],
      },
      {
        id: 'P3-343',
        name: 'Mantenimiento y calidad del código frontend',
        tag: 'QA',
        color: '#993556',
        status: 'done',
        subtasks: [
          {
            id: 'P3-344',
            name: 'Resolver errores de linting en Settings.tsx y AdminHeader.tsx',
            status: 'done',
          },
          {
            id: 'P3-345',
            name: 'Corregir formato en crud_guide.html para cumplir editorconfig',
            status: 'done',
          },
        ],
      },
      {
        id: 'P3-346',
        name: 'Sistema RBAC y mejoras de UX',
        tag: 'FRONT',
        color: '#D85A30',
        status: 'done',
        subtasks: [
          {
            id: 'P3-347',
            name: 'Implementar permisos dinámicos para SuperAdmin, Manager y Staff',
            status: 'done',
          },
          {
            id: 'P3-348',
            name: 'Crear middleware RoleProtectedRoute para bloquear acceso por rol',
            status: 'done',
          },
          {
            id: 'P3-349',
            name: 'Crear Staff Dashboard específico para personal de tienda',
            status: 'done',
          },
          {
            id: 'P3-350',
            name: 'Ocultar botones de acción según permisos del usuario',
            status: 'done',
          },
          {
            id: 'P3-351',
            name: 'Funcionalidad Copiar Usuario en lista de empleados',
            status: 'done',
          },
          {
            id: 'P3-352',
            name: 'Centralizar notificaciones y sonidos en panel de Ajustes',
            status: 'done',
          },
        ],
      },
    ],
  },
];

const statusConfig: Record<string, { label: string; bg: string; text: string; border: string }> = {
  done: { label: 'Completado', bg: '#085041', text: '#9FE1CB', border: '#1D9E75' },
  active: { label: 'En curso', bg: '#0C2340', text: '#7AB8F5', border: '#2E7BC4' },
};

const TaskStatusDone = () => (
  <div
    style={{
      width: 16,
      height: 16,
      borderRadius: '50%',
      background: '#085041',
      border: '1.5px solid #1D9E75',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }}
  >
    <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
      <path
        d="M1.5 4.5L3.5 6.5L7.5 2.5"
        stroke="#9FE1CB"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </div>
);

const TaskStatusActive = () => (
  <div
    style={{
      width: 16,
      height: 16,
      borderRadius: '50%',
      background: '#2D2000',
      border: '1.5px solid #D4A017',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }}
  >
    <div
      style={{
        width: 6,
        height: 6,
        borderRadius: '50%',
        background: '#D4A017',
        animation: 'taskPulse 1.5s infinite',
      }}
    />
  </div>
);

const SubtaskDot = ({ status }: { status: string }) => (
  <div
    style={{
      width: 10,
      height: 10,
      borderRadius: '50%',
      background: status === 'done' ? '#085041' : '#2D2000',
      border: `1.5px solid ${status === 'done' ? '#1D9E75' : '#D4A017'}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }}
  >
    {status === 'done' ? (
      <svg width="6" height="6" viewBox="0 0 6 6" fill="none">
        <path
          d="M1 3L2.5 4.5L5 1.5"
          stroke="#9FE1CB"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ) : (
      <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#D4A017' }} />
    )}
  </div>
);

export default function RoadmapSprint4() {
  const [expanded, setExpanded] = useState<number | null>(5);
  const totalSP = sprints.reduce((a, s) => a + s.points, 0);
  const doneSprints = sprints.filter((s) => s.status === 'done').length;

  return (
    <div
      style={{
        fontFamily: "'Source Sans 3', 'Source Sans Pro', sans-serif",
        padding: '2rem 0',
        maxWidth: 720,
        margin: '0 auto',
      }}
    >
      <style>{`
        @keyframes sprintPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.65); }
        }
        @keyframes taskPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.7); }
        }
      `}</style>
      <link
        href="https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@300;400;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
        rel="stylesheet"
      />

      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div style={{ width: 4, height: 28, borderRadius: 2, background: '#1D9E75' }} />
          <h1
            style={{
              fontSize: 26,
              fontWeight: 700,
              color: 'var(--color-text-primary)',
              margin: 0,
              letterSpacing: '-0.5px',
            }}
          >
            Stocker — Roadmap Completo
          </h1>
        </div>
        <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: '0 0 0 16px' }}>
          Sistema de Gestión de Almacenes · 5 Sprints · Feb – May 2026 · {totalSP} Story Points
          totales
        </p>
      </div>

      <div style={{ position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            left: 18,
            top: 8,
            bottom: 8,
            width: 2,
            background: 'var(--color-border-tertiary)',
            borderRadius: 1,
          }}
        />

        {sprints.map((sprint, i) => {
          const sc = statusConfig[sprint.status];
          const isExpanded = expanded === sprint.id;
          const isActive = sprint.status === 'active';

          return (
            <div
              key={sprint.id}
              style={{ position: 'relative', marginBottom: i < sprints.length - 1 ? 28 : 0 }}
            >
              <div
                style={{
                  position: 'absolute',
                  left: 8,
                  top: 6,
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  background: sc.bg,
                  border: `2.5px solid ${sc.border}`,
                  zIndex: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {isActive ? (
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: sc.border,
                      animation: 'sprintPulse 1.5s infinite',
                    }}
                  />
                ) : (
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                    <path
                      d="M2 5.5L4.5 8L9 3"
                      stroke={sc.text}
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>

              <div
                onClick={() => setExpanded(isExpanded ? null : sprint.id)}
                style={{
                  marginLeft: 48,
                  background: 'var(--color-background-secondary)',
                  border: `1px solid ${isExpanded ? sc.border : 'var(--color-border-tertiary)'}`,
                  borderRadius: 12,
                  padding: '14px 18px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 12,
                        fontWeight: 500,
                        color: sc.border,
                      }}
                    >
                      {sprint.name}
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        padding: '2px 7px',
                        borderRadius: 5,
                        background: sc.bg,
                        color: sc.text,
                        border: `1px solid ${sc.border}`,
                        letterSpacing: '0.3px',
                        textTransform: 'uppercase',
                      }}
                    >
                      {sc.label}
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        padding: '2px 7px',
                        borderRadius: 5,
                        background: 'var(--color-background-primary)',
                        color: 'var(--color-text-tertiary)',
                        border: '1px solid var(--color-border-tertiary)',
                      }}
                    >
                      {sprint.points} SP
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: 11,
                      color: 'var(--color-text-tertiary)',
                      fontFamily: "'JetBrains Mono', monospace",
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {sprint.dates}
                  </span>
                </div>

                <p
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: 'var(--color-text-primary)',
                    margin: '8px 0 4px',
                  }}
                >
                  {sprint.focus}
                </p>
                <p style={{ fontSize: 11, color: 'var(--color-text-tertiary)', margin: 0 }}>
                  {sprint.tasks.length} historias
                </p>

                {isExpanded && (
                  <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {sprint.tasks.map((task) => (
                      <div key={task.id}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 9,
                            padding: '7px 10px',
                            background: 'var(--color-background-primary)',
                            borderRadius: 7,
                            border: '1px solid var(--color-border-tertiary)',
                          }}
                        >
                          {task.status === 'done' ? <TaskStatusDone /> : <TaskStatusActive />}
                          <span
                            style={{
                              fontFamily: "'JetBrains Mono', monospace",
                              fontSize: 10,
                              color: 'var(--color-text-tertiary)',
                              minWidth: 48,
                            }}
                          >
                            {task.id}
                          </span>
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 600,
                              padding: '1px 5px',
                              borderRadius: 4,
                              background: task.color + '20',
                              color: task.color,
                              letterSpacing: '0.3px',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {task.tag}
                          </span>
                          <span
                            style={{
                              fontSize: 12,
                              color: 'var(--color-text-primary)',
                              fontWeight: 400,
                            }}
                          >
                            {task.name}
                          </span>
                        </div>

                        {task.subtasks && task.subtasks.length > 0 && (
                          <div
                            style={{
                              marginLeft: 16,
                              marginTop: 3,
                              marginBottom: 2,
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 3,
                              paddingLeft: 10,
                              borderLeft: '2px solid var(--color-border-tertiary)',
                            }}
                          >
                            {task.subtasks.map((sub) => (
                              <div
                                key={sub.id}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 7,
                                  padding: '5px 8px',
                                  background: 'var(--color-background-primary)',
                                  borderRadius: 5,
                                  border: '1px solid var(--color-border-tertiary)',
                                  opacity: 0.9,
                                }}
                              >
                                <SubtaskDot status={sub.status} />
                                <span
                                  style={{
                                    fontFamily: "'JetBrains Mono', monospace",
                                    fontSize: 9,
                                    color: 'var(--color-text-tertiary)',
                                    minWidth: 44,
                                  }}
                                >
                                  {sub.id}
                                </span>
                                <span
                                  style={{
                                    fontSize: 11,
                                    color:
                                      sub.status === 'done'
                                        ? 'var(--color-text-secondary)'
                                        : 'var(--color-text-primary)',
                                    fontWeight: 400,
                                  }}
                                >
                                  {sub.name}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ textAlign: 'center', marginTop: 8 }}>
                  <span style={{ fontSize: 10, color: 'var(--color-text-tertiary)' }}>
                    {isExpanded ? '▲ Contraer' : '▼ Ver historias'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          marginTop: 32,
          marginLeft: 48,
          padding: '12px 18px',
          background: 'var(--color-background-secondary)',
          border: '1px solid var(--color-border-tertiary)',
          borderRadius: 12,
          display: 'flex',
          gap: 32,
        }}
      >
        {[
          { label: 'Story Points totales', value: totalSP },
          { label: 'Sprints completados', value: `${doneSprints} / ${sprints.length}` },
          { label: 'Velocity media', value: Math.round(totalSP / sprints.length) + ' SP' },
        ].map((stat) => (
          <div key={stat.label}>
            <p
              style={{
                fontSize: 10,
                color: 'var(--color-text-tertiary)',
                margin: '0 0 4px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              {stat.label}
            </p>
            <p
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: '#1D9E75',
                margin: 0,
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              {stat.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
