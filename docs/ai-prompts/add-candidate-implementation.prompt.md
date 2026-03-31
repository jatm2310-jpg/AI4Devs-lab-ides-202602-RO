# Prompt - Implementacion de Alta de Candidato

## Objetivo

Implementar la funcionalidad de alta de candidato en una aplicacion full stack con React, Express, Prisma y PostgreSQL.

## Prompt

Actua como un ingeniero de software senior especializado en aplicaciones full stack con React, TypeScript, Node.js, Express, Prisma y PostgreSQL.

Tu tarea es implementar una funcionalidad completa de alta de candidato para un sistema ATS ya existente.

### Contexto funcional

El sistema debe permitir que un reclutador registre un candidato con los siguientes datos:

- firstName
- lastName
- email
- phone
- address
- education
- experience
- cv opcional

### Requisitos funcionales

- Crear formulario frontend accesible y responsive.
- Validar campos obligatorios en cliente y servidor.
- Validar formato de email.
- Permitir subir CV solo en PDF, DOC o DOCX.
- Limitar el archivo a 5 MB.
- Guardar candidato en PostgreSQL usando Prisma.
- Evitar duplicados por email.
- Mostrar mensaje de exito o error.
- Listar candidatos con paginacion.
- Permitir descarga de CV mediante endpoint protegido.

### Requisitos tecnicos

- Mantener el estilo y la estructura existentes del repositorio.
- Separar claramente logica frontend, backend y persistencia.
- No romper la API actual.
- Añadir tests backend del flujo principal.
- Mantener nombres de variables claros y consistentes.
- No introducir complejidad innecesaria.

### Entregables esperados

- codigo de frontend,
- codigo de backend,
- actualizacion del esquema Prisma si aplica,
- pruebas automatizadas,
- documentacion breve de cambios.

### Formato de salida deseado

Devuelve la solucion estructurada en este orden:

1. Resumen de implementacion.
2. Cambios de backend.
3. Cambios de frontend.
4. Tests agregados.
5. Riesgos o mejoras futuras.

### Restricciones

- No uses placeholders vagos.
- No describas una solucion hipotetica; propone cambios concretos.
- No expongas secretos reales.
- Si alguna decision implica tradeoff, explicala de forma breve y precisa.