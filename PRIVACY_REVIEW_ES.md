# Revisión crítica de privacidad: consulta de IA de North Harris

Fecha: 7 de octubre de 2026. Alcance: código local de la aplicación, formularios, permisos del servidor y SQL de informes. Se consultaron las fuentes oficiales al final de este documento. No se inspeccionaron respuestas reales ni se certificó la configuración de producción.

## Conclusión para la toma de decisiones

La finalidad de escuchar opiniones sobre IA puede llevarse a cabo, pero el repositorio y una autenticación por correo no bastan para autorizar la recopilación institucional. No puedo confirmar que la app publicada cumpla FERPA o HIPAA. Encontré vías concretas de exposición y las corregí localmente. La cuenta de Supabase conectada no permite acceder al proyecto de esta aplicación, por lo que los permisos efectivos, las respuestas ya almacenadas y los contratos permanecen sin verificar.

La página OTS AI Tools identifica las encuestas sensibles y los datos no públicos de estudiantes o empleados como información confidencial. También restringe el envío de datos confidenciales o restringidos a herramientas públicas de IA generativa. Esto impide tratar automáticamente la consulta como contenido público por el solo hecho de no pedir calificaciones. Esa página compara herramientas generativas: no demuestra por sí sola que Netlify o Supabase estén aprobados o prohibidos para alojar esta consulta. OTS debe evaluar el flujo concreto y los proveedores.

En el código revisado no encontré un servicio de inferencia que envíe las respuestas a un LLM. La aplicación recopila una consulta sobre IA. Si se añade análisis generativo después, requerirá otra revisión de destino, datos y autorización.

La página consultada también indica que ChatGPT y Claude no están aprobados para uso interno. Esto debe considerarse al elegir herramientas para desarrollar o analizar materiales institucionales. No determina automáticamente que una aplicación independiente, sin inferencia generativa, esté prohibida.

## Datos solicitados y pertinencia

| Datos | Finalidad | Evaluación y corrección |
| --- | --- | --- |
| Correo institucional verificado | Autenticación y elegibilidad | Se conserva para la cuenta. Verificar el dominio no acredita campus, rol ni permiso para divulgar expedientes. El servidor no lo entrega a otros miembros. |
| Nombre | Administración de participación y recuperación del trabajo | Se conserva en el perfil, pero se oculta a otros miembros. Administradores lo reciben para gestionar cuentas. No debe convertirse en un resultado público. |
| Categoría laboral, unidad, disciplina y antigüedad | Contexto y cobertura | Son atributos personales, a veces identificables por combinación. Se permite omitirlos o preferir no responder. Se eliminan del perfil entregado a otros miembros. Los informes externos ya no incluyen unidad ni disciplina. |
| Opiniones, propuestas, ejemplos, razones y comentarios | Consulta de normas | Pertinentes si son generales. Un texto sobre un alumno reconocible, una acusación académica, un paciente o una evaluación laboral puede cambiar la clasificación del dato. Hay aviso previo, reconocimiento requerido y controles limitados de identificadores. |
| Encuesta inicial y final | Comprender experiencias y necesidades | Opcional y con categorías cerradas. Se vincula al usuario en la base para actualizar respuestas. Los resultados se agregan y suprimen. Se ha corregido la descripción para no prometer anonimato absoluto. |
| Archivos | Apoyo a propuestas | Podrían contener registros, rostros o metadatos. Se bloqueó tanto la carga como la descarga. Los archivos existentes se conservan para revisión autorizada. |

Las 24 preguntas tratan sobre aprendizaje, integridad, privacidad, trabajo, equidad y gobernanza. Ninguna exige expedientes individuales. La referencia a un ejemplo práctico no autoriza a copiar información real de otra persona.

## Objeciones desde FERPA

FERPA protege registros relacionados directamente con un estudiante que mantiene la institución o alguien que actúa en su nombre. Una opinión general de un empleado no se convierte automáticamente en un registro educativo. Sin embargo, la identificación de un estudiante junto con su participación, situación académica o conducta puede requerir protección. Los datos de un empleado que también sea estudiante deben examinarse según el contexto.

No se puede asumir que un nombre o correo estudiantil es libremente divulgable por considerarlo información de directorio. Hay requisitos institucionales y exclusiones de publicación. Tampoco se presume que todos los usuarios con un dominio Lone Star tengan una necesidad legítima de ver la información de otro estudiante.

Si los proveedores mantienen registros educativos para LSC, la institución debe determinar la base de divulgación aplicable y cumplir sus condiciones, por ejemplo control sobre el uso y mantenimiento por un proveedor que actúe como funcionario escolar. Una casilla que reconoce el aviso de privacidad no reemplaza el consentimiento de divulgación que FERPA podría exigir.

Quitar nombres tampoco garantiza la desidentificación. Una unidad pequeña, una fecha, un caso reconocible o una cita literal pueden permitir identificar a alguien. Los controles estadísticos aplicados son una reducción del riesgo, no una declaración de que cada informe cumple el estándar legal.

## Objeciones desde HIPAA

HIPAA no se aplica automáticamente a una encuesta sobre IA, ni porque participe personal de enfermería. Su aplicación depende de la entidad, el origen del dato y las actividades que realiza. Los registros educativos y ciertos registros de tratamiento estudiantil bajo FERPA están excluidos de la definición de información de salud protegida de HIPAA.

El riesgo aparece si alguien incorpora información identificable de un paciente obtenida en un contexto sujeto a HIPAA. El texto libre y los archivos eran vías para ello. No encontré evidencia en el repositorio de acuerdos BAA o de una configuración de proyecto habilitada para PHI. Esto no prueba que esos contratos no existan: permanecen sin verificar.

Si se quisiera manejar PHI, la evaluación tendría que incluir a todos los proveedores y servicios que la reciben, mantienen o transmiten. El soporte de HIPAA que ofrece Supabase requiere acuerdos y configuración del cliente; no se hereda automáticamente al construir una app. Para esta finalidad, la corrección apropiada es excluir registros de pacientes y ejemplos identificables.

## Correcciones implementadas

1. Por solicitud posterior del propietario, se retiraron el bloqueo de revisión institucional y la consulta previa al envío del código. La revisión institucional y los acuerdos siguen siendo cuestiones pendientes, no requisitos técnicos de acceso.
2. Los perfiles que reciben otros miembros no incluyen nombre real, correo ni detalles demográficos. Los administradores conservan acceso para gestión de cuentas. El esquema local ya deniega acceso directo de clientes a las tablas; la configuración desplegada necesita comprobación independiente.
3. Las revisiones históricas completas y los comentarios antiguos se limitan al único administrador designado: `vhgarcia100@gmail.com`, autenticado y con correo confirmado. Los participantes conservan la edición de sus aportaciones actuales. Los roles antiguos de comité/administrador no otorgan estos privilegios. Las copias ya recibidas requieren revisión independiente.
4. Se añade un aviso claro sobre finalidad, visibilidad, almacenamiento y ejemplos permitidos. Se exige reconocer su versión antes de guardar datos de participación. Se rechazan identificadores evidentes y campos ocultos en propuestas. El control no reconoce todas las personas ni todos los datos clínicos.
5. Los archivos siguen bloqueados. Se habilitan exportaciones CSV/PDF de material detallado solo al administrador designado, mediante comprobación de identidad en el servidor. Esos archivos son confidenciales, no anónimos; deben almacenarse y compartirse conforme a las reglas institucionales. No se purgó ningún registro ni archivo.
6. Los borradores del navegador y las sesiones usan almacenamiento de la pestaña. Los borradores de la base siguen disponibles para volver y editar. Las entradas antiguas migran cuando se accede a ellas. La restauración de pestañas depende del navegador.
7. El SQL de informes omite demografía granular, etiquetas libres y denominadores de matrícula. Exige al menos cinco autores distintos en las métricas de contribuciones y suprime toda una distribución cuando existe una celda pequeña. La app limita también cifras pequeñas en sus resúmenes. El historial de publicaciones y la combinación de resultados requieren revisión humana.

## Qué falta para aprobar uso real en North Harris

Un responsable institucional debe confirmar el propósito y la audiencia, clasificar los datos, revisar el alojamiento y los contratos, definir acceso administrativo, conservación y respuesta a incidentes, y autorizar el formato de los resultados. Si participan estudiantes, debe resolver específicamente la base de tratamiento y divulgación bajo FERPA. Si se pretendiera investigar formalmente, debe determinar el proceso institucional aplicable.

Antes de reabrir la recopilación, un administrador autorizado debe instalar las correcciones, aplicar `database/privacy-reporting-hardening.sql`, verificar los permisos reales y revisar el contenido anterior. Los informes ya exportados o publicados no cambian al modificar el código. La cuenta conectada no permitió realizar esas comprobaciones ni modificar esta base de producción.

## Fuentes oficiales

La compilación y la comprobación de tipos finalizaron correctamente. Pasaron 19 pruebas locales, incluidas consultas SQL sobre supresión complementaria, repetición de aportaciones por un solo autor y exclusión de campos personales. Esas pruebas verifican controles técnicos locales; no verifican contratos, configuración desplegada ni ausencia de información sensible en registros históricos.

- [LSC OTS AI Tools y clasificación de datos](https://www.lonestar.edu/OTS-AI-Tools).
- [Definición FERPA de información identificable](https://studentprivacy.ed.gov/content/personally-identifiable-information-education-records).
- [Estándar de desidentificación FERPA](https://studentprivacy.ed.gov/faq/what-constitutes-de-identified-records-and-information).
- [Departamento de Educación: privacidad en servicios educativos en línea](https://studentprivacy.ed.gov/resources/protecting-student-privacy-while-using-online-educational-services-requirements-and-best).
- [HHS: FERPA o HIPAA en clínicas de instituciones postsecundarias](https://www.hhs.gov/hipaa/for-professionals/faq/does-ferpa-or-hipaa-apply-to-records-on-students-at-health-clinics/index.html).
- [HHS: HIPAA y servicios en la nube](https://www.hhs.gov/hipaa/for-professionals/special-topics/health-information-technology/cloud-computing/index.html).
- [Supabase: responsabilidades y requisitos HIPAA](https://supabase.com/docs/guides/security/hipaa-compliance).
