import { useState } from 'react';

const sprints = [
  {
    id: 1,
    name: 'Sprint 1',
    dates: '8 feb – 29 mar',
    status: 'done',
    focus: 'Infraestructura y Arquitectura',
    tasks: [
      {
        id: 'P3-63',
        name: 'Contenerización y Orquestación del Entorno',
        tag: 'INFRA',
        color: '#0F6E56',
        status: 'done',
      },
      {
        id: 'P3-64',
        name: 'Inicialización de Arquitectura y Boilerplates',
        tag: 'INFRA',
        color: '#0F6E56',
        status: 'done',
      },
      {
        id: 'P3-66',
        name: 'Definición de Identidad Visual y Guía de Estilos',
        tag: 'ARQ',
        color: '#534AB7',
        status: 'done',
      },
      {
        id: 'P3-65',
        name: 'Prototipado de Alta Fidelidad (Mockups)',
        tag: 'ARQ',
        color: '#534AB7',
        status: 'done',
      },
      {
        id: 'P3-136',
        name: 'Configuración de Persistencia y Migraciones',
        tag: 'INFRA',
        color: '#0F6E56',
        status: 'done',
      },
      {
        id: 'P3-137',
        name: 'Configuración del Sistema de Diseño en Código',
        tag: 'ARQ',
        color: '#534AB7',
        status: 'done',
      },
    ],
  },
  {
    id: 2,
    name: 'Sprint 2',
    dates: '1 mar – 15 mar',
    status: 'done',
    focus: 'Modelo de Datos y Vistas Base',
    tasks: [
      {
        id: 'P3-227',
        name: 'Modelado de Datos y API de Catálogo',
        tag: 'BACK',
        color: '#185FA5',
        status: 'done',
      },
      {
        id: 'P3-228',
        name: 'Implementación de Seeder de Datos Iniciales',
        tag: 'BACK',
        color: '#185FA5',
        status: 'done',
      },
      {
        id: 'P3-229',
        name: 'Integración de API y Listado Dinámico',
        tag: 'FRONT',
        color: '#D85A30',
        status: 'done',
      },
      {
        id: 'P3-230',
        name: 'Desarrollo de Vistas Públicas e Informativas',
        tag: 'FRONT',
        color: '#D85A30',
        status: 'done',
      },
      {
        id: 'P3-231',
        name: 'Desarrollo de Vistas Administrativas',
        tag: 'FRONT',
        color: '#D85A30',
        status: 'done',
      },
      {
        id: 'P3-232',
        name: 'Documentación Técnica y Diccionario de Datos',
        tag: 'GESTIÓN',
        color: '#854F0B',
        status: 'done',
      },
      {
        id: 'P3-233',
        name: 'Testing de Navegación e Integración de Datos',
        tag: 'QA',
        color: '#993556',
        status: 'done',
      },
    ],
  },
  {
    id: 3,
    name: 'Sprint 3',
    dates: '15 mar – 29 mar',
    status: 'done',
    focus: 'CRUD Completo y Automatización',
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
        name: 'Sincronización de node_modules entre Docker y Local',
        tag: 'TOOLING',
        color: '#5F5E5A',
        status: 'done',
        subtasks: [],
      },
      {
        id: 'P3-216',
        name: 'Reestructuración y Saneamiento del Backlog en Jira',
        tag: 'GESTIÓN',
        color: '#854F0B',
        status: 'done',
        subtasks: [],
      },
      {
        id: 'P3-217',
        name: 'Corrección de Syntax Error en Suite de Tests',
        tag: 'BUG',
        color: '#A32D2D',
        status: 'done',
        subtasks: [],
      },
      {
        id: 'P3-234',
        name: 'CRUD Completo de Productos (Inventario)',
        tag: 'CORE',
        color: '#0F6E56',
        status: 'done',
        subtasks: [
          {
            id: 'P3-270',
            name: 'Implementación de endpoints POST, PUT y DELETE para productos',
            status: 'done',
          },
          {
            id: 'P3-271',
            name: 'Desarrollo de formularios y lógica de creación/edición (Modales)',
            status: 'done',
          },
          {
            id: 'P3-272',
            name: 'Lógica de validación de negocio y manejo de errores CRUD',
            status: 'done',
          },
        ],
      },
      {
        id: 'P3-235',
        name: 'Gestión Integral de Categorías',
        tag: 'CORE',
        color: '#0F6E56',
        status: 'done',
        subtasks: [
          {
            id: 'P3-273',
            name: 'Endpoints CRUD completos para la entidad Category',
            status: 'done',
          },
          {
            id: 'P3-274',
            name: 'Interfaz de gestión de categorías (Listado y Operaciones)',
            status: 'done',
          },
          {
            id: 'P3-275',
            name: 'Implementación de integridad referencial (Protección de borrado)',
            status: 'done',
          },
        ],
      },
      {
        id: 'P3-236',
        name: 'CRUD de Usuarios y Gestión de Roles',
        tag: 'CORE',
        color: '#0F6E56',
        status: 'warning',
        subtasks: [
          {
            id: 'P3-276',
            name: 'Implementación de la tabla User y endpoints CRUD base',
            status: 'warning',
          },
          {
            id: 'P3-277',
            name: 'Vista de administración de usuarios y asignación de roles',
            status: 'done',
          },
          {
            id: 'P3-278',
            name: 'Lógica de validación de perfiles (Emails únicos)',
            status: 'warning',
          },
        ],
      },
      {
        id: 'P3-238',
        name: 'Automatización de Calidad con GitHub Actions',
        tag: 'DEVOPS',
        color: '#185FA5',
        status: 'done',
        subtasks: [
          {
            id: 'P3-281',
            name: 'Configuración de Workflow CI (.yml) para el Backend (Pytest)',
            status: 'done',
          },
          {
            id: 'P3-282',
            name: 'Configuración de Workflow CI para el Frontend (Lint/Build)',
            status: 'done',
          },
        ],
      },
      {
        id: 'P3-239',
        name: 'Sesión de Formación Técnica y Code Review',
        tag: 'ARQ',
        color: '#534AB7',
        status: 'done',
        subtasks: [
          {
            id: 'P3-279',
            name: 'Preparación del material didáctico sobre flujo CRUD y Arquitectura',
            status: 'done',
          },
          {
            id: 'P3-280',
            name: 'Impartición de la sesión práctica y Live Coding para el equipo',
            status: 'done',
          },
        ],
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
        id: 'P3-246',
        name: 'RoadMap del Proyecto y Cronograma de Entregas',
        tag: 'GESTIÓN',
        color: '#854F0B',
        status: 'done',
        subtasks: [],
      },
    ],
  },
];

const statusConfig = {
  done: { label: 'Completado', bg: '#085041', text: '#9FE1CB', border: '#1D9E75' },
  warning: { label: 'Con incidencias', bg: '#412402', text: '#FAC775', border: '#BA7517' },
};

const TaskStatus = ({ status }) => {
  if (status === 'done')
    return (
      <div
        style={{
          width: 18,
          height: 18,
          borderRadius: '50%',
          background: '#085041',
          border: '1.5px solid #1D9E75',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path
            d="M2 5L4.5 7.5L8 3"
            stroke="#9FE1CB"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  return (
    <div
      style={{
        width: 18,
        height: 18,
        borderRadius: '50%',
        background: '#412402',
        border: '1.5px solid #BA7517',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        <path d="M5 2.5V5.5M5 7V7.5" stroke="#FAC775" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </div>
  );
};

export default function RoadmapS3Full() {
  const [expanded, setExpanded] = useState(3);
  const [expandedTasks, setExpandedTasks] = useState({});

  const toggleTask = (id, e) => {
    e.stopPropagation();
    setExpandedTasks((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div
      style={{
        fontFamily: '"Source Sans 3", "Source Sans Pro", sans-serif',
        padding: '2rem 0',
        maxWidth: 720,
        margin: '0 auto',
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@300;400;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
        rel="stylesheet"
      />

      <div style={{ marginBottom: '2.5rem' }}>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            margin: 0,
            letterSpacing: '-0.5px',
          }}
        >
          Stocker — Roadmap Sprint 3
        </h1>
        <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', margin: '6px 0 0' }}>
          Sistema de Gestión de Almacenes · Sprints 1–3 · Feb – Mar 2025
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

          return (
            <div
              key={sprint.id}
              style={{ position: 'relative', marginBottom: i < sprints.length - 1 ? 32 : 0 }}
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
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M2.5 6L5 8.5L9.5 3.5"
                    stroke={sc.text}
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <div
                onClick={() => setExpanded(isExpanded ? null : sprint.id)}
                style={{
                  marginLeft: 48,
                  background: 'var(--color-background-secondary)',
                  border: `1px solid ${isExpanded ? sc.border : 'var(--color-border-tertiary)'}`,
                  borderRadius: 12,
                  padding: '16px 20px',
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
                        fontFamily: '"JetBrains Mono", monospace',
                        fontSize: 13,
                        fontWeight: 500,
                        color: sc.border,
                      }}
                    >
                      {sprint.name}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: 6,
                        background: sc.bg,
                        color: sc.text,
                        border: `1px solid ${sc.border}`,
                        letterSpacing: '0.3px',
                        textTransform: 'uppercase',
                      }}
                    >
                      {sc.label}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: 12,
                      color: 'var(--color-text-tertiary)',
                      fontFamily: '"JetBrains Mono", monospace',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {sprint.dates}
                  </span>
                </div>

                <p
                  style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: 'var(--color-text-primary)',
                    margin: '8px 0 0',
                  }}
                >
                  {sprint.focus}
                </p>
                <p style={{ fontSize: 12, color: 'var(--color-text-tertiary)', margin: '4px 0 0' }}>
                  {sprint.tasks.length} historias
                </p>

                {isExpanded && (
                  <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {sprint.tasks.map((task) => {
                      const hasSubtasks = task.subtasks && task.subtasks.length > 0;
                      const isTaskExpanded = expandedTasks[task.id];
                      const tc = statusConfig[task.status] || statusConfig.done;

                      return (
                        <div key={task.id}>
                          <div
                            onClick={hasSubtasks ? (e) => toggleTask(task.id, e) : undefined}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 10,
                              padding: '8px 12px',
                              background:
                                task.status === 'warning'
                                  ? '#41240210'
                                  : 'var(--color-background-primary)',
                              borderRadius: 8,
                              border: `1px solid ${task.status === 'warning' ? '#BA751730' : 'var(--color-border-tertiary)'}`,
                              cursor: hasSubtasks ? 'pointer' : 'default',
                            }}
                          >
                            <TaskStatus status={task.status} />
                            <span
                              style={{
                                fontFamily: '"JetBrains Mono", monospace',
                                fontSize: 11,
                                color: 'var(--color-text-tertiary)',
                                minWidth: 52,
                              }}
                            >
                              {task.id}
                            </span>
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 600,
                                padding: '1px 6px',
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
                                fontSize: 13,
                                color: 'var(--color-text-primary)',
                                fontWeight: 400,
                                flex: 1,
                              }}
                            >
                              {task.name}
                            </span>
                            {hasSubtasks && (
                              <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>
                                {isTaskExpanded ? '▲' : '▼'}
                              </span>
                            )}
                          </div>

                          {hasSubtasks && isTaskExpanded && (
                            <div
                              style={{
                                marginLeft: 24,
                                marginTop: 4,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 4,
                              }}
                            >
                              {task.subtasks.map((sub) => (
                                <div
                                  key={sub.id}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    padding: '6px 10px',
                                    background:
                                      sub.status === 'warning'
                                        ? '#41240210'
                                        : 'var(--color-background-primary)',
                                    borderRadius: 6,
                                    border: `1px solid ${sub.status === 'warning' ? '#BA751730' : 'var(--color-border-tertiary)'}`,
                                  }}
                                >
                                  <TaskStatus status={sub.status} />
                                  <span
                                    style={{
                                      fontFamily: '"JetBrains Mono", monospace',
                                      fontSize: 10,
                                      color: 'var(--color-text-tertiary)',
                                      minWidth: 48,
                                    }}
                                  >
                                    {sub.id}
                                  </span>
                                  <span
                                    style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}
                                  >
                                    {sub.name}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                <div style={{ textAlign: 'center', marginTop: 8 }}>
                  <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>
                    {isExpanded ? '▲ Contraer' : '▼ Ver historias'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </div>
  );
}
