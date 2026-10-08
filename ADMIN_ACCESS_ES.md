# Acceso de empleados y administrador único

Actualización: 7 de octubre de 2026. Cambios locales; todavía no desplegados.

## Cambios realizados

- Se retiró el bloqueo operativo de revisión institucional y su comprobación antes de solicitar el código.
- Participan empleados, no estudiantes: correo confirmado `@lonestar.edu`, nombre completo, categoría laboral y declaración obligatoria de ser empleado. El servidor rechaza `@my.lonestar.edu`. Un dominio y una declaración no prueban la relación laboral frente a Recursos Humanos; si se necesita esa verificación, debe integrarse una fuente institucional autorizada.
- Las opiniones, notas y aportaciones actuales se pueden guardar y volver a editar durante las rondas abiertas. El administrador puede leerlas, incluidos borradores guardados. La app explica esta visibilidad antes de participar.
- Solo la identidad verificada `vhgarcia100@gmail.com` tiene privilegios administrativos. Su correo es el nombre de usuario. Cambiar la categoría del perfil a “Administrator” o conservar un rol antiguo no concede esos permisos.
- Solo ese administrador recibe historias completas y exportaciones CSV/PDF. Los participantes no reciben el historial, pero sí su versión actual editable.
- Los informes de pulso se exportan como agregados con supresión, no como respuestas individuales identificadas. Las descargas detalladas no son anónimas. CSV conserva Unicode; el PDF conserva caracteres latinos y representa caracteres adicionales como U+hex.
- Se mantienen las advertencias de privacidad, el rechazo de identificadores evidentes y el bloqueo de adjuntos. El permiso de exportación no puede impedir capturas de pantalla, copiar texto o fotografiar una pantalla.

## Cuenta creada por el propietario; acceso real pendiente de verificar

El propietario informó que creó manualmente el usuario `vhgarcia100@gmail.com` en Supabase el 7 de octubre de 2026. No crear un duplicado ni cambiar su contraseña automáticamente. La confirmación del correo y el inicio de sesión real todavía no se verificaron: la cuenta conectada no tiene acceso al proyecto `tpmvahgtmxtgshedtusy`, y el archivo local solo contiene credenciales públicas. No se guardó la contraseña proporcionada en ningún archivo del proyecto. Conviene usar una contraseña nueva y exclusiva que no se haya compartido en la conversación.

Referencia de configuración para el propietario (pasos 1–3 ya realizados según su confirmación):

1. Abrir el proyecto correcto en Supabase.
2. Ir a **Authentication → Users → Add user → Create new user**.
3. Introducir el correo `vhgarcia100@gmail.com` y una contraseña exclusiva. Confirmar el correo si el panel ofrece esa opción; esta cuenta es la excepción administrativa autorizada por el propietario.
4. Desplegar estos cambios en Netlify.
5. En la página Profile, abrir **Administrator sign-in** e ingresar la contraseña. El servidor asigna el rol únicamente a ese correo confirmado.
6. Completar el perfil y abrir **Administration**. Crear una ronda **Collect / Open** habilita la recopilación. Las rondas cerradas siguen impidiendo nuevas aportaciones; eso es un control de consulta, no el bloqueo retirado.

Alternativa para un responsable técnico autorizado: ejecutar `scripts/create-admin.ps1` en una terminal PowerShell de confianza. Solicita la clave secreta del servidor y la contraseña de forma oculta; llama a Supabase Auth Admin en el proyecto correcto. No requiere editar tablas de autenticación ni coloca secretos en el navegador. Si el usuario ya existe, no modifica su contraseña.

## Verificación y despliegue

`npm run check` valida compilación, tipos y pruebas locales. Las pruebas cubren rechazo de estudiantes, identidad administrativa única, permisos no delegables, historias, llamadas directas de exportación y archivos CSV/PDF. Esto no constituye una prueba de autenticación real, despliegue exitoso, aprobación institucional ni certificación FERPA/HIPAA.

Resultado local: compilación y tipos correctos; 24 pruebas aprobadas. La comprobación de navegador verificó rechazo del correo estudiantil antes de solicitar el código, formulario separado del administrador con contraseña oculta, ausencia de exportaciones para participantes y guardado del perfil en el modo ficticio. La conexión real API/base de datos no se comprobó: faltan credenciales locales del servidor y acceso autorizado al proyecto conectado.

La implementación siguió la guía de seguridad/autenticación de Supabase y la comprobación local de navegador; [creación de usuarios](https://supabase.com/docs/reference/javascript/auth-admin-createuser) y [acceso con contraseña](https://supabase.com/docs/reference/javascript/auth-signinwithpassword) son operaciones de Supabase Auth, no contraseñas incorporadas al código.

Mantener `SUPABASE_SECRET_KEY` únicamente en la configuración del servidor en Netlify. No cambiar RLS para conceder acceso directo a clientes. La corrección agregada anterior `database/privacy-reporting-hardening.sql` continúa pendiente de verificación en producción.
