# US-001 - Alta de Candidato en el Sistema

## Estado

- Refinada

## Titulo

Alta de candidato con validacion, carga de CV y visualizacion en dashboard de reclutamiento.

## Historia de usuario

Como reclutador
quiero registrar un candidato en el sistema con su informacion principal y su CV
para centralizar el seguimiento del proceso de seleccion y disponer de su perfil en una unica plataforma.

## Objetivo de negocio

Reducir la dispersion de informacion de candidatos, mejorar la calidad del registro inicial y acelerar el trabajo operativo del equipo de reclutamiento.

## Contexto funcional

El sistema debe permitir que un reclutador cree un candidato desde una interfaz web. El registro debe persistirse en una base de datos PostgreSQL, y el CV debe almacenarse de forma controlada para poder descargarse posteriormente desde el dashboard.

## Alcance

Incluye:

- formulario de alta de candidato,
- validaciones de cliente y servidor,
- subida de CV,
- almacenamiento del candidato,
- sugerencias de educacion y experiencia,
- listado paginado,
- descarga protegida de CV.

No incluye:

- autenticacion completa de usuarios,
- workflow de entrevistas,
- evaluaciones tecnicas,
- integraciones con ATS externos,
- almacenamiento cloud de archivos.

## Actores

- Reclutador: usuario principal que registra y consulta candidatos.
- Sistema ATS: valida, persiste y expone la informacion.

## Supuestos

- La base de datos PostgreSQL esta disponible.
- El backend expone una API REST accesible desde el frontend.
- El reclutador tiene permiso funcional para registrar candidatos.
- La proteccion de descarga por llave es temporal para entorno de desarrollo.

## Reglas de negocio

- Todos los campos obligatorios deben estar informados antes de guardar.
- El email debe tener un formato valido.
- No puede existir mas de un candidato con el mismo email.
- El CV solo puede subirse en formatos PDF, DOC o DOCX.
- El CV no puede superar los 5 MB.
- El sistema debe registrar fecha de creacion del candidato.
- El sistema debe indicar si un candidato dispone o no de CV asociado.

## Datos requeridos

Campos obligatorios:

- Nombre
- Apellido
- Correo electronico
- Telefono
- Direccion
- Educacion
- Experiencia

Campos opcionales:

- CV

## Criterios de aceptacion

### CA-01 - Creacion exitosa de candidato

Dado que un reclutador completa correctamente todos los campos requeridos
y adjunta un CV valido o decide no adjuntarlo
cuando envia el formulario
entonces el sistema crea el candidato
y muestra un mensaje de confirmacion exitoso.

### CA-02 - Validacion de campos obligatorios

Dado que un reclutador deja uno o mas campos obligatorios vacios
cuando intenta guardar el candidato
entonces el sistema bloquea el envio
y muestra mensajes de error claros por validacion.

### CA-03 - Validacion de formato de email

Dado que el reclutador introduce un correo con formato invalido
cuando intenta guardar el formulario
entonces el sistema rechaza la operacion
y muestra un mensaje indicando que el email no es valido.

### CA-04 - Validacion de archivo CV

Dado que el reclutador adjunta un archivo que no es PDF, DOC o DOCX
o supera el tamano maximo permitido
cuando intenta registrar el candidato
entonces el sistema rechaza el archivo
y muestra un mensaje de error especifico.

### CA-05 - Deteccion de duplicado por email

Dado que ya existe un candidato registrado con el mismo correo electronico
cuando el reclutador intenta crear otro candidato con ese email
entonces el sistema rechaza la operacion
y comunica que el correo ya existe.

### CA-06 - Visualizacion del candidato en el dashboard

Dado que el candidato fue creado correctamente
cuando el dashboard recarga el listado
entonces el nuevo candidato aparece en la lista paginada
con sus datos principales y con indicador de disponibilidad de CV.

### CA-07 - Descarga de CV protegido

Dado que un candidato tiene CV registrado
y la solicitud incluye credenciales de acceso validas
cuando el reclutador solicita la descarga
entonces el sistema devuelve el archivo correspondiente.

### CA-08 - Acceso denegado a descarga sin autorizacion

Dado que la solicitud de descarga no incluye la llave requerida o es incorrecta
cuando se intenta descargar el CV
entonces el sistema responde con error de autorizacion.

## Requisitos no funcionales

- La UI debe ser usable en escritorio y movil.
- Los mensajes de error deben ser comprensibles y accionables.
- La API debe responder en formato JSON para errores funcionales.
- La solucion debe ser testeable automaticamente.
- La implementacion debe preservar separacion de responsabilidades entre frontend, backend y persistencia.

## Dependencias tecnicas

- React + TypeScript en frontend.
- Node.js + Express + TypeScript en backend.
- Prisma ORM.
- PostgreSQL.
- Multer para subida de archivos.
- Docker Compose para base de datos local.

## Casos borde a contemplar

- envio sin CV,
- paginacion sin resultados,
- archivo inexistente en disco aunque exista referencia en base de datos,
- error de conexion entre frontend y backend,
- reintento de carga tras error validacion.

## Definicion de terminado

La historia se considera terminada cuando:

- el formulario permite alta valida de candidato,
- backend y frontend validan datos clave,
- el candidato se persiste en base de datos,
- el CV se almacena y puede descargarse de forma controlada,
- el listado paginado muestra los nuevos registros,
- existen pruebas automatizadas del flujo principal,
- la documentacion tecnica y funcional esta actualizada.