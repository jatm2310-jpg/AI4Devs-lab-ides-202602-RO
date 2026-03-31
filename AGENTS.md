# AGENTS.md

## 1. Proposito

Este documento define como deben trabajar los agentes de desarrollo en este repositorio para mantener calidad tecnica, consistencia y trazabilidad.

El proyecto implementa un sistema ATS (Applicant Tracking System) para reclutamiento, con frontend en React y backend en Node.js/Express con Prisma sobre PostgreSQL.

## 2. Rol y Contexto

### Rol del agente

- Actuar como ingeniero de software full stack senior.
- Priorizar cambios pequenos, seguros y verificables.
- Mantener compatibilidad con la arquitectura y convenciones existentes.
- Entregar siempre contexto de impacto: que cambio, por que, y como se valido.

### Contexto de negocio

- El sistema permite registrar candidatos, validar datos, cargar CV, listar candidatos y descargar CV de forma protegida.
- La operacion principal la realiza el equipo de reclutamiento.
- El sistema esta orientado a entornos de aprendizaje/desarrollo, pero se debe codificar con criterios de produccion.

## 3. Stack Tecnologico

### Backend

- Node.js
- Express
- TypeScript
- Prisma ORM
- PostgreSQL
- Multer (upload de CV)
- Jest + Supertest (tests)

### Frontend

- React 18
- TypeScript
- Create React App
- Testing Library + Jest via react-scripts

### Infraestructura local

- Docker Compose para PostgreSQL

## 4. Arquitectura del Proyecto

### Estructura general

- backend/: API REST, acceso a datos, validaciones y uploads
- frontend/: UI para operacion de reclutamiento
- docs/: historias de usuario y prompts de soporte

### Principios de arquitectura

- Separacion de responsabilidades:
  - UI y estado en frontend
  - validacion de negocio y orquestacion en backend
  - persistencia en Prisma/PostgreSQL
- Backend como unica fuente de verdad de reglas de negocio.
- Validacion doble: cliente (UX) y servidor (seguridad/integridad).

## 5. Reglas de Implementacion

### Alcance de cambios

- No mezclar cambios funcionales con refactors amplios no solicitados.
- Evitar tocar archivos no relacionados con la tarea.
- Mantener nombres de funciones y variables consistentes con el dominio ATS.

### Estilo de codigo

- Preferir legibilidad antes que complejidad.
- Extraer funciones cuando una ruta/controlador crece demasiado.
- Evitar comentarios obvios; comentar solo decisiones no triviales.

### Dependencias

- Agregar librerias solo si resuelven una necesidad concreta.
- Evitar duplicidad de dependencias que ya cubre el stack.

## 6. Contratos y API

### Convenciones de endpoints

- Prefijo: /api/...
- Respuestas de error en JSON con mensaje claro.
- Validar parametros de ruta y query antes de ejecutar logica de datos.

### Upload de CV

- Tipos permitidos: PDF, DOC, DOCX
- Tamano maximo: 5 MB
- Si falla validacion de archivo, retornar error funcional explicito.

### Seguridad minima actual

- Descarga de CV protegida con header x-recruiter-key.
- Esta proteccion es temporal y de desarrollo; no tratarla como auth definitiva.

## 7. Base de Datos y Prisma

### Reglas

- Toda modificacion de datos debe reflejarse en schema.prisma.
- Si se agregan campos/modelos, actualizar lecturas y escrituras relacionadas.
- Evitar consultas sin limites en endpoints de listado.

### Integridad

- Mantener unicidad de email para Candidate.
- Manejar conflictos de unicidad devolviendo error de negocio entendible.

## 8. Frontend y UX

### Principios

- Formularios con validacion local y feedback inmediato.
- Estados claros: loading, success, error, empty.
- UI responsive para escritorio y movil.

### Integracion con backend

- Centralizar base URL via variables de entorno cuando aplique.
- No asumir que las respuestas siempre son 200; manejar errores de red y API.

## 9. Testing y Calidad

### Regla general

- Cada cambio funcional relevante debe incluir o actualizar tests.

### Backend

- Probar:
  - camino feliz
  - validaciones
  - errores de autorizacion
  - casos not found

### Frontend

- Probar al menos elementos clave de interaccion/visualizacion.

### Comandos recomendados

- Backend test: npm test (en backend/)
- Frontend test: npm test (en frontend/)
- Backend build: npm run build (en backend/)
- Frontend build: npm run build (en frontend/)

## 10. Seguridad y Secretos

- No commitear credenciales reales en archivos versionados.
- Mantener .env fuera de commits en repositorios compartidos.
- Usar .env.example para documentar variables requeridas.

## 11. Documentacion

- Actualizar README cuando cambian setup, scripts, endpoints o arquitectura.
- Mantener historias de usuario en docs/user-stories/.
- Mantener prompts tecnicos en docs/ai-prompts/.

## 12. Flujo de Trabajo Git

- Crear rama por objetivo funcional.
- Commits pequenos y descriptivos.
- Abrir PR con:
  - resumen funcional
  - impacto tecnico
  - validacion ejecutada
  - riesgos y siguientes pasos

## 13. Definicion de Terminado

Un cambio se considera terminado cuando:

- compila en backend y frontend,
- tests relevantes pasan,
- no rompe contratos existentes,
- documentacion clave esta actualizada,
- el PR explica claramente que se hizo y como se valido.

## 14. Checklist Rapido para Agentes

Antes de cerrar una tarea, verificar:

- [ ] el alcance pedido por usuario esta cubierto,
- [ ] no se expusieron secretos,
- [ ] hay validacion tecnica (tests/build),
- [ ] se actualizaron docs si corresponde,
- [ ] se reportaron limitaciones o riesgos abiertos.
