import { useState } from "react";

const sprints = [
  {
    id: 1,
    name: "Sprint 1",
    dates: "8 feb – 29 mar",
    status: "done",
    focus: "Infraestructura y Arquitectura",
    points: 21,
    tasks: [
      { id: "P3-63", name: "Contenerización y Orquestación del Entorno", tag: "INFRA", color: "#0F6E56", status: "done" },
      { id: "P3-64", name: "Inicialización de Arquitectura y Boilerplates", tag: "INFRA", color: "#0F6E56", status: "done" },
      { id: "P3-66", name: "Definición de Identidad Visual y Guía de Estilos", tag: "ARQ", color: "#534AB7", status: "done" },
      { id: "P3-65", name: "Prototipado de Alta Fidelidad (Mockups)", tag: "ARQ", color: "#534AB7", status: "done" },
      { id: "P3-136", name: "Configuración de Persistencia y Migraciones", tag: "INFRA", color: "#0F6E56", status: "done" },
      { id: "P3-137", name: "Configuración del Sistema de Diseño en Código", tag: "ARQ", color: "#534AB7", status: "done" },
    ],
  },
  {
    id: 2,
    name: "Sprint 2",
    dates: "1 mar – 15 mar",
    status: "done",
    focus: "Modelo de Datos y Vistas Base",
    points: 27,
    tasks: [
      { id: "P3-227", name: "Modelado de Datos y API de Catálogo", tag: "BACK", color: "#185FA5", status: "done" },
      { id: "P3-228", name: "Implementación de Seeder de Datos Iniciales", tag: "BACK", color: "#185FA5", status: "done" },
      { id: "P3-229", name: "Integración de API y Listado Dinámico", tag: "FRONT", color: "#D85A30", status: "done" },
      { id: "P3-230", name: "Desarrollo de Vistas Públicas e Informativas", tag: "FRONT", color: "#D85A30", status: "done" },
      { id: "P3-231", name: "Desarrollo de Vistas Administrativas", tag: "FRONT", color: "#D85A30", status: "done" },
      { id: "P3-232", name: "Documentación Técnica y Diccionario de Datos", tag: "GESTIÓN", color: "#854F0B", status: "done" },
      { id: "P3-233", name: "Testing de Navegación e Integración de Datos", tag: "QA", color: "#993556", status: "done" },
    ],
  },
  {
    id: 3,
    name: "Sprint 3",
    dates: "15 mar – 15 abr",
    status: "done",
    focus: "CRUD Core, CI y Documentación",
    points: 30,
    tasks: [
      { id: "P3-168", name: "Corrección de .gitignore para .env.example", tag: "GIT", color: "#5F5E5A", status: "done" },
      { id: "P3-207", name: "Sincronización de node_modules local", tag: "TOOLING", color: "#5F5E5A", status: "done" },
      { id: "P3-216", name: "Saneamiento del Backlog y Tablero Jira", tag: "GESTIÓN", color: "#854F0B", status: "done" },
      { id: "P3-235", name: "CRUDs de Gestión Core (Categorías, Tiendas, Empleados)", tag: "BACK", color: "#185FA5", status: "done" },
      { id: "P3-237", name: "Suite de Pruebas Unitarias para Backend", tag: "QA", color: "#993556", status: "done" },
      { id: "P3-238", name: "Automatización de Integración Continua (CI)", tag: "DEVOPS", color: "#0F6E56", status: "done" },
      { id: "P3-241", name: "Seguimiento de Métricas de Sprint y Velocity", tag: "GESTIÓN", color: "#854F0B", status: "done" },
      { id: "P3-288", name: "Población de Datos y Documentación Técnica", tag: "DATA", color: "#534AB7", status: "done" },
      { id: "P3-289", name: "Lógica de Integración y Servicios CRUD (Frontend)", tag: "FRONT", color: "#D85A30", status: "done" },
      { id: "P3-290", name: "Interfaz de Gestión con Atomic Design", tag: "FRONT", color: "#D85A30", status: "done" },
    ],
  },
  {
    id: 4,
    name: "Sprint 4",
    dates: "15 abr – 29 abr",
    status: "done",
    focus: "Autenticación, Seguridad y Documentación",
    points: 35,
    tasks: [
      { id: "P3-243", name: "Sistema de Autenticación con JWT y Hashing", tag: "AUTH", color: "#993556", status: "done" },
      { id: "P3-245", name: "Control de Acceso basado en Roles (RBAC)", tag: "AUTH", color: "#993556", status: "done" },
      { id: "P3-244", name: "Gestión de Sesión y Rutas Protegidas (Frontend)", tag: "AUTH", color: "#993556", status: "done" },
      { id: "P3-236", name: "CRUD de Usuarios y Gestión de Roles", tag: "BACK", color: "#185FA5", status: "done" },
      { id: "P3-286", name: "Revisión y limpieza de comentarios en CRUD", tag: "DOCS", color: "#854F0B", status: "done" },
      { id: "P3-242", name: "Formación Técnica y Estandarización de GitFlow", tag: "ARQ", color: "#534AB7", status: "done" },
      { id: "P3-287", name: "Automatización de Estándares de Código en CI", tag: "QA", color: "#0F6E56", status: "done" },
      { id: "P3-310", name: "Suite de Pruebas Frontend y Automatización CI", tag: "QA", color: "#0F6E56", status: "done" },
      { id: "P3-304", name: "Elaboración de Guías Técnicas de Desarrollo", tag: "DOCS", color: "#854F0B", status: "done" },
      { id: "P3-240", name: "Documentación de API (OpenAPI) y Contribución", tag: "DOCS", color: "#854F0B", status: "done" },
    ],
  },
];

const statusConfig = {
  done: { label: "Completado", bg: "#085041", text: "#9FE1CB", border: "#1D9E75" },
};

const TaskStatus = () => (
  <div style={{
    width: 16, height: 16, borderRadius: "50%",
    background: "#085041", border: "1.5px solid #1D9E75",
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
  }}>
    <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
      <path d="M1.5 4.5L3.5 6.5L7.5 2.5" stroke="#9FE1CB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </div>
);

export default function RoadmapSprint4() {
  const [expanded, setExpanded] = useState(4);
  const totalSP = sprints.reduce((a, s) => a + s.points, 0);

  return (
    <div style={{ fontFamily: "'Source Sans 3', 'Source Sans Pro', sans-serif", padding: "2rem 0", maxWidth: 720, margin: "0 auto" }}>
      <link href="https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@300;400;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />

      <div style={{ marginBottom: "2.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <div style={{ width: 4, height: 28, borderRadius: 2, background: "#1D9E75" }} />
          <h1 style={{ fontSize: 26, fontWeight: 700, color: "var(--color-text-primary)", margin: 0, letterSpacing: "-0.5px" }}>
            Stocker — Roadmap Completo
          </h1>
        </div>
        <p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: "0 0 0 16px" }}>
          Sistema de Gestión de Almacenes · 4 Sprints · Feb – Abr 2026 · {totalSP} Story Points totales
        </p>
      </div>

      <div style={{ position: "relative" }}>
        <div style={{ position: "absolute", left: 18, top: 8, bottom: 8, width: 2, background: "var(--color-border-tertiary)", borderRadius: 1 }} />

        {sprints.map((sprint, i) => {
          const sc = statusConfig[sprint.status];
          const isExpanded = expanded === sprint.id;

          return (
            <div key={sprint.id} style={{ position: "relative", marginBottom: i < sprints.length - 1 ? 28 : 0 }}>
              <div style={{
                position: "absolute", left: 8, top: 6, width: 22, height: 22, borderRadius: "50%",
                background: sc.bg, border: `2.5px solid ${sc.border}`, zIndex: 2,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                  <path d="M2 5.5L4.5 8L9 3" stroke={sc.text} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              <div
                onClick={() => setExpanded(isExpanded ? null : sprint.id)}
                style={{
                  marginLeft: 48,
                  background: "var(--color-background-secondary)",
                  border: `1px solid ${isExpanded ? sc.border : "var(--color-border-tertiary)"}`,
                  borderRadius: 12, padding: "14px 18px", cursor: "pointer", transition: "all 0.2s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 500, color: sc.border }}>
                      {sprint.name}
                    </span>
                    <span style={{
                      fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 5,
                      background: sc.bg, color: sc.text, border: `1px solid ${sc.border}`,
                      letterSpacing: "0.3px", textTransform: "uppercase",
                    }}>
                      {sc.label}
                    </span>
                    <span style={{
                      fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 5,
                      background: "var(--color-background-primary)", color: "var(--color-text-tertiary)",
                      border: "1px solid var(--color-border-tertiary)",
                    }}>
                      {sprint.points} SP
                    </span>
                  </div>
                  <span style={{ fontSize: 11, color: "var(--color-text-tertiary)", fontFamily: "'JetBrains Mono', monospace", whiteSpace: "nowrap" }}>
                    {sprint.dates}
                  </span>
                </div>

                <p style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text-primary)", margin: "8px 0 4px" }}>
                  {sprint.focus}
                </p>
                <p style={{ fontSize: 11, color: "var(--color-text-tertiary)", margin: 0 }}>
                  {sprint.tasks.length} historias
                </p>

                {isExpanded && (
                  <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 5 }}>
                    {sprint.tasks.map((task) => (
                      <div key={task.id} style={{
                        display: "flex", alignItems: "center", gap: 9,
                        padding: "7px 10px",
                        background: "var(--color-background-primary)",
                        borderRadius: 7,
                        border: "1px solid var(--color-border-tertiary)",
                      }}>
                        <TaskStatus />
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "var(--color-text-tertiary)", minWidth: 48 }}>
                          {task.id}
                        </span>
                        <span style={{
                          fontSize: 10, fontWeight: 600, padding: "1px 5px", borderRadius: 4,
                          background: task.color + "20", color: task.color, letterSpacing: "0.3px", whiteSpace: "nowrap",
                        }}>
                          {task.tag}
                        </span>
                        <span style={{ fontSize: 12, color: "var(--color-text-primary)", fontWeight: 400 }}>
                          {task.name}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ textAlign: "center", marginTop: 8 }}>
                  <span style={{ fontSize: 10, color: "var(--color-text-tertiary)" }}>
                    {isExpanded ? "▲ Contraer" : "▼ Ver historias"}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{
        marginTop: 32, marginLeft: 48,
        padding: "12px 18px",
        background: "var(--color-background-secondary)",
        border: "1px solid var(--color-border-tertiary)",
        borderRadius: 12,
        display: "flex", gap: 32,
      }}>
        {[
          { label: "Story Points totales", value: totalSP },
          { label: "Sprints completados", value: "4 / 4" },
          { label: "Velocity media", value: Math.round(totalSP / 4) + " SP" },
        ].map((stat) => (
          <div key={stat.label}>
            <p style={{ fontSize: 10, color: "var(--color-text-tertiary)", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              {stat.label}
            </p>
            <p style={{ fontSize: 18, fontWeight: 700, color: "#1D9E75", margin: 0, fontFamily: "'JetBrains Mono', monospace" }}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
