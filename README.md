# AI4Devs - Talent Tracking System

Aplicacion full stack para gestion de candidatos construida con React en el frontend y Node.js + Express en el backend. El proyecto usa PostgreSQL como base de datos relacional y Prisma como ORM.

La solucion implementa un flujo de alta de candidatos con validacion de datos, carga de CV, sugerencias de campos, listado paginado y descarga protegida de archivos.

## Tabla de contenidos

- Vision general
- Stack tecnologico
- Funcionalidades principales
- Arquitectura del proyecto
- Estructura de carpetas
- Requisitos previos
- Configuracion local
- Variables de entorno
- Base de datos y Prisma
- Ejecucion del proyecto
- Scripts disponibles
- API disponible
- Testing y build
- Documentacion funcional y prompts
- Buenas practicas y notas operativas
- Proximos pasos recomendados

## Vision general

Este repositorio contiene un sistema de seguimiento de talento orientado a reclutamiento. Actualmente permite:

- registrar candidatos desde una interfaz web,
- validar datos obligatorios en cliente y servidor,
- cargar CV en formato PDF o Word,
- consultar sugerencias de campos basadas en datos recientes,
- listar candidatos con paginacion,
- descargar CV mediante una ruta protegida.

## Stack tecnologico

### Frontend

- React 18
- TypeScript
- Create React App
- Testing Library
- Jest a traves de react-scripts

### Backend

- Node.js
- Express
- TypeScript
- Prisma ORM
- Multer para subida de archivos
- CORS
- Jest
- Supertest

### Base de datos e infraestructura

- PostgreSQL
- Docker Compose para entorno local de base de datos

## Funcionalidades principales

- Alta de candidatos con los campos:
  - nombre,
  - apellido,
  - correo electronico,
  - telefono,
  - direccion,
  - educacion,
  - experiencia,
  - CV opcional.
- Validacion de email y campos requeridos.
- Control de tipo de archivo CV: PDF, DOC, DOCX.
- Limite de tamano de archivo CV: 5 MB.
- Listado paginado de candidatos.
- Descarga protegida de CV usando cabecera `x-recruiter-key`.
- Sugerencias para educacion y experiencia a partir de registros recientes.

## Arquitectura del proyecto

El proyecto esta dividido en dos aplicaciones independientes:

- `frontend/`: interfaz web para reclutamiento.
- `backend/`: API REST y acceso a datos.

El frontend consume la API del backend por HTTP. El backend persiste la informacion en PostgreSQL mediante Prisma y almacena los archivos subidos en disco dentro de la carpeta `backend/uploads`.

## Estructura de carpetas

```text
.
|-- backend/
|   |-- prisma/
|   |   `-- schema.prisma
|   |-- src/
|   |   |-- index.ts
|   |   `-- tests/
|   |       `-- app.test.ts
|   |-- package.json
|   `-- tsconfig.json
|-- frontend/
|   |-- public/
|   |-- src/
|   |   |-- App.tsx
|   |   |-- App.css
|   |   `-- tests/
|   |       `-- App.test.tsx
|   |-- package.json
|   `-- tsconfig.json
|-- docker-compose.yml
`-- README.md
```

## Requisitos previos

Antes de ejecutar el proyecto, asegurate de tener instalado:

- Node.js 18 o superior recomendado.
- npm.
- Docker Desktop o Docker Engine con Docker Compose.

## Configuracion local

### 1. Clonar el repositorio

```bash
git clone https://github.com/LIDR-academy/AI4Devs-lab-ides-202602-RO.git
cd AI4Devs-lab-ides-202602-RO
```

### 2. Instalar dependencias

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 3. Configurar variables de entorno del backend

El backend utiliza un archivo `.env` con la conexion a PostgreSQL y la llave de acceso para descarga de CV.

Variables esperadas:

- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `DB_PORT`
- `DATABASE_URL`
- `RECRUITER_ACCESS_KEY`

Ejemplo de configuracion:

```env
DB_USER=LTIdbUser
DB_PASSWORD=your_password
DB_NAME=LTIdb
DB_PORT=5433
DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@localhost:${DB_PORT}/${DB_NAME}"
RECRUITER_ACCESS_KEY=dev-recruiter-key
```

### 4. Levantar la base de datos

Desde la raiz del proyecto:

```bash
docker compose up -d
```

La base de datos queda expuesta localmente en:

- Host: `localhost`
- Port: `5433`
- Motor: PostgreSQL

Para detenerla:

```bash
docker compose down
```

## Variables de entorno

### Backend

| Variable | Descripcion |
|---|---|
| `DB_USER` | Usuario de PostgreSQL |
| `DB_PASSWORD` | Password de PostgreSQL |
| `DB_NAME` | Nombre de la base de datos |
| `DB_PORT` | Puerto local del contenedor PostgreSQL |
| `DATABASE_URL` | Cadena de conexion usada por Prisma |
| `RECRUITER_ACCESS_KEY` | Llave para proteger la descarga de CV |

### Frontend

El frontend funciona sin configuracion adicional, pero admite estas variables opcionales:

| Variable | Descripcion |
|---|---|
| `REACT_APP_API_URL` | URL base del backend. Por defecto: `http://localhost:3010` |
| `REACT_APP_RECRUITER_ACCESS_KEY` | Llave usada por el cliente para la descarga de CV |

Nota: exponer `REACT_APP_RECRUITER_ACCESS_KEY` en cliente solo es aceptable para desarrollo. En produccion deberia sustituirse por autenticacion real del lado servidor.

## Base de datos y Prisma

El esquema Prisma define actualmente dos modelos:

- `User`
- `Candidate`

El modelo `Candidate` almacena informacion de perfil, metadatos del CV y fecha de creacion.

Para generar el cliente Prisma:

```bash
cd backend
npx prisma generate
```

Para sincronizar el esquema con la base de datos en desarrollo:

```bash
cd backend
npx prisma db push
```

## Ejecucion del proyecto

### Backend

```bash
cd backend
npm run dev
```

La API quedara disponible en:

- `http://localhost:3010`

### Frontend

En otra terminal:

```bash
cd frontend
npm start
```

La aplicacion quedara disponible en:

- `http://localhost:3000`

## Scripts disponibles

### Backend

```bash
npm run dev
npm run build
npm start
npm test
npm run prisma:init
npm run prisma:generate
npm run start:prod
```

Descripcion:

- `npm run dev`: arranca el backend en modo desarrollo con recarga.
- `npm run build`: compila TypeScript a `dist/`.
- `npm start`: ejecuta la version compilada.
- `npm test`: ejecuta tests con Jest.
- `npm run prisma:init`: inicializa Prisma.
- `npm run prisma:generate`: genera el cliente Prisma.
- `npm run start:prod`: build + arranque en modo produccion.

### Frontend

```bash
npm start
npm run build
npm test
```

Descripcion:

- `npm start`: arranca la aplicacion React en desarrollo.
- `npm run build`: genera el bundle de produccion.
- `npm test`: ejecuta tests del frontend con `react-scripts`.

## API disponible

### `GET /`

Health check simple del backend.

Respuesta esperada:

```text
ATS backend running
```

### `GET /api/candidates/suggestions`

Devuelve sugerencias de `education` y `experience` a partir de registros recientes.

### `GET /api/candidates?page=1&limit=8`

Devuelve listado paginado de candidatos.

Ejemplo de respuesta:

```json
{
  "items": [
    {
      "id": 1,
      "firstName": "Ana",
      "lastName": "Lopez",
      "email": "ana@example.com",
      "phone": "+34111111111",
      "address": "Calle 123",
      "education": "Ingenieria",
      "experience": "3 anos en seleccion",
      "cvFileName": "cv.pdf",
      "createdAt": "2026-01-01T00:00:00.000Z",
      "hasCv": true
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 8,
    "totalPages": 1
  }
}
```

### `POST /api/candidates`

Crea un nuevo candidato mediante `multipart/form-data`.

Campos admitidos:

- `firstName`
- `lastName`
- `email`
- `phone`
- `address`
- `education`
- `experience`
- `cv`

### `GET /api/candidates/:id/cv`

Descarga el CV del candidato. Requiere la cabecera:

```http
x-recruiter-key: dev-recruiter-key
```

## Testing y build

### Ejecutar tests

Backend:

```bash
cd backend
npm test
```

Frontend:

```bash
cd frontend
npm test
```

### Generar builds

Backend:

```bash
cd backend
npm run build
```

Frontend:

```bash
cd frontend
npm run build
```

## Documentacion funcional y prompts

El proyecto incluye documentacion funcional y artefactos de prompt engineering en la carpeta `docs/`.

### Historias de usuario

- `docs/user-stories/US-001-add-candidate.md`: historia de usuario refinada para la funcionalidad de alta de candidato.

### Prompts y meta-prompts

- `docs/ai-prompts/add-candidate-implementation.prompt.md`: prompt reutilizable para implementar la solucion.
- `docs/ai-prompts/add-candidate-refinement.meta-prompt.md`: meta-prompt para refinar historias de usuario o prompts tecnicos futuros.

Estos documentos estan pensados para mantener alineadas la vision funcional, la implementacion tecnica y futuras iteraciones asistidas por AI.

## Buenas practicas y notas operativas

- No subas secretos reales al repositorio.
- No uses la llave `RECRUITER_ACCESS_KEY` expuesta en frontend en un entorno productivo.
- Manten sincronizado el esquema Prisma con la base de datos usando `prisma db push` o migraciones cuando el proyecto evolucione.
- La carpeta `backend/uploads` debe considerarse almacenamiento local de desarrollo. Para produccion conviene mover los archivos a almacenamiento externo.
- El puerto local de PostgreSQL es `5433`, no `5432`, para evitar conflictos comunes con instalaciones locales existentes.
- El frontend usa Create React App. Actualmente funciona correctamente, pero CRA ya no es una base especialmente moderna para proyectos nuevos.

## Proximos pasos recomendados

- Sustituir la descarga protegida por llave estatica por autenticacion/autorizacion real.
- Incorporar migraciones Prisma versionadas.
- Anadir documentacion OpenAPI si se va a exponer la API a terceros.
- Integrar almacenamiento externo para CV.
- Anadir pipeline CI para test y build automaticos.
