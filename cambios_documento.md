# Actualización de la sección de EMPLEADORES del informe (n = 53 → n = 80)

> Fuente: base PostgreSQL del sistema, encuesta **"Encuesta a Empleadores - Carrera de Ingeniería de Sistemas"** (`survey_id = 14`, 80 submissions).
> Lógica replicada **exactamente** del dashboard (`StatsService.java`): `answered()` excluye respuestas *no aplicables* y `normalized_value` vacío; los % de cada categoría se calculan sobre el nº de respuestas de esa pregunta; en Likert la media/DE mapean solo las opciones con valor numérico (**"No sabe" queda fuera de la media y la DE**, pero cuenta en el denominador de los %); las preguntas abiertas se categorizan con los **17 grupos de palabras clave** fijos del backend (`KEYWORD_GROUPS`).
> **No se tocó nada de titulados (n = 148).**

## Notas importantes antes de empezar (leer)

1. **Escala Likert real.** La escala de empleadores en la BD (`likert_scales.id = 6`) tiene **solo 3 opciones de respuesta** mapeadas a `{1, 3, 4}`:
   `Totalmente desacuerdo = 1`, `Parcialmente de acuerdo = 3`, `Totalmente de acuerdo = 4`, `No sabe = (sin número)`. **No existe el valor 2 ni la etiqueta "De acuerdo".**
   Por eso el **"Acuerdo favorable"** = las **dos categorías superiores** = `Parcialmente de acuerdo` + `Totalmente de acuerdo` (que es lo que calcula el dashboard). Donde el informe dice *"De acuerdo o Totalmente de acuerdo"* debe entenderse como *"Parcialmente de acuerdo o Totalmente de acuerdo"*. **← revisar la redacción literal.**

2. **Base de los %.** Para preguntas cerradas todas las 80 organizaciones respondieron (n válidas = 80), así que *% sobre total = % sobre válidas*. Para las **preguntas abiertas** (P10, P11, P12) hubo **79 respuestas válidas** (1 en blanco), por eso se dan **ambos** porcentajes.

3. **"Acuerdo favorable" sobre el total (n = 80)**, igual que en el documento original (que lo calculaba sobre 53). La media/DE sí excluyen "No sabe".

4. **El documento ya estaba parcialmente actualizado**: §1.1 ya dice "80" y §1.3 ya usa un valor nuevo (69,6 %). El resto (§4, Tabla 11, §4.1, §4.2.1, §4.2.2, Tabla 13 + radar, §5.2, §6.1, §6.2.3) sigue en n = 53. Abajo se cubren **todos** los lugares.

5. **[REVISAR]** marca los puntos donde con los datos nuevos **cambia el orden de los ítems o deja de ser cierta una afirmación**.

---

## 1.1 Antecedentes del estudio (línea 62)

**TEXTO ACTUAL**
> […] Esto permitió trabajar con 148 titulados y 80 organizaciones empleadoras, y centralizar su procesamiento […]

**TEXTO NUEVO** — *sin cambios* (ya dice 80). ✔

---

## 1.3 Justificación (línea 77, primer bullet)

**TEXTO ACTUAL**
> * Pertinencia académica. Los resultados muestran que el 71,6 % de los titulados considera que el principal aspecto a mejorar es la actualización constante del plan de estudios. A su vez, el **69,6 %** de los empleadores señala la inteligencia artificial y el  machine learning como el área de mayor interés. […]

**TEXTO NUEVO**
> * Pertinencia académica. Los resultados muestran que el 71,6 % de los titulados considera que el principal aspecto a mejorar es la actualización constante del plan de estudios. A su vez, el **68,8 %** de los empleadores señala la inteligencia artificial y el machine learning como el área de mayor interés. […]

> Nota: IA/Agentes = **55 menciones**. Sobre el total (n = 80) = **68,8 %**; sobre respuestas válidas (n = 79) = **69,6 %**. El valor actual (69,6 %) es el de "respuestas válidas"; como la frase dice *"de los empleadores"* corresponde el **68,8 %** (sobre el total). Si prefieren mantener el 69,6 %, añadir "de las respuestas válidas". (El 71,6 % es de titulados: **no se toca**.)

---

## 4. Análisis de la Oferta Laboral — introducción (líneas 575–576)

**TEXTO ACTUAL**
> […] La información analizada proviene del conjunto consolidado de la "Encuesta a Empleadores" ( organizaciones), complementada con la valoración de pertinencia curricular reportada por los titulados ().
> De las **53** organizaciones encuestadas, el **75,5% (40)** corresponde al sector privado y el **24,5% (13)** al sector público. En cuanto a su tamaño, destacan las grandes empresas de 100 o más funcionarios (**37,7%, 20** organizaciones) y las microempresas de hasta 10 funcionarios (**32,1%, 17** organizaciones), seguidas de las pequeñas (**17,0%, 9**) y medianas (**13,2%, 7**). El rubro principal predominante es el desarrollo de software con el **39,6% (21)**, seguido por servicios de TI, telecomunicaciones/redes y startups tecnológicas (con **7,5% cada uno**).

**TEXTO NUEVO** · **[REVISAR]** (cambia el orden de tamaño y la afirmación "7,5 % cada uno")
> […] La información analizada proviene del conjunto consolidado de la "Encuesta a Empleadores" (**80 organizaciones**), complementada con la valoración de pertinencia curricular reportada por los titulados (**148**).
> De las **80** organizaciones encuestadas, el **78,8 % (63)** corresponde al sector privado y el **21,2 % (17)** al sector público. En cuanto a su tamaño, destacan las microempresas de hasta 10 funcionarios (**37,5 %, 30** organizaciones) y las grandes empresas de 100 o más funcionarios (**28,8 %, 23** organizaciones), seguidas de las pequeñas (**18,8 %, 15**) y medianas (**15,0 %, 12**). El rubro principal predominante es el desarrollo de software con el **41,2 % (33)**, seguido de lejos por los servicios de TI (**11,2 %, 9**); el resto se reparte en rubros con **5,0 % o menos** (telecomunicaciones/redes, instituciones públicas/gobierno, salud y startups tecnológicas, con 4 organizaciones —5,0 %— cada uno), más un **7,5 % (6)** en "Otros".

> Cambios de fondo: ahora **micro** es el tamaño más frecuente (antes era "grandes"); y ya **no** es cierto que servicios de TI/telecom/startups empaten en 7,5 % (servicios de TI sube a 11,2 % y queda solo).

---

## Tabla 11 — Indicadores de empleabilidad, contratación y cargos (líneas 577–654)

**Título ACTUAL:** `Tabla 11: Indicadores de empleabilidad, contratación y cargos desempeñados según empleadores () `
**Título NUEVO:** `Tabla 11: Indicadores de empleabilidad, contratación y cargos desempeñados según empleadores (n = 80)`
**Fuente ACTUAL (línea 654):** `Fuente: Elaboración propia con base en la encuesta consolidada a empleadores (), UMSS (2026).`
**Fuente NUEVO:** `Fuente: Elaboración propia con base en la encuesta consolidada a empleadores (n = 80), UMSS (2026).`

**Tabla completa NUEVA** (mismo orden de filas; % sobre n = 80):

| Variable | Categoría | Cantidad | % |
|---|---|---|---|
| Contratación en los últimos 5 años | Sí contrató ingenieros de sistemas | 66 | 82,5 |
|  | No contrató | 14 | 17,5 |
| Proyección de incorporación futura | Sí, dependiendo del crecimiento o nuevos proyectos | 45 | 56,2 |
|  | Sí, existe una alta probabilidad de contratación | 23 | 28,8 |
|  | No se tiene prevista la contratación actualmente | 12 | 15,0 |
| Nivel académico demandado | Licenciatura | 59 | 73,8 |
|  | Especialidad | 13 | 16,2 |
|  | Diplomado | 5 | 6,2 |
|  | Maestría | 3 | 3,8 |
| Medio principal de convocatoria | Internet y Redes sociales | 39 | 48,8 |
|  | Postulación competitiva (convocatorias) | 14 | 17,5 |
|  | Otros medios | 11 | 13,8 |
|  | Recomendación de terceros | 9 | 11,2 |
|  | Medios escritos/audiovisuales u oferta personal | 7 | 8,8 |
| Cargos desempeñados (selección múltiple) | Técnico (desarrollo, BD, redes, soporte TI) | 59 | 73,8 |
|  | Analista (sistemas, datos, procesos) | 32 | 40,0 |
|  | Especialista (ciberseguridad, arquitectura, infra.) | 32 | 40,0 |
|  | De apoyo / asistencia tecnológica | 31 | 38,8 |
|  | Supervisor / Coordinador de área tecnológica | 21 | 26,2 |
|  | Jefatura o Gerencial (proyectos, dirección TI) | 16 | 20,0 |
|  | Consultor tecnológico | 11 | 13,8 |

Notas sobre la Tabla 11:
- **Nivel académico:** se mantienen Doctorado y Post-doctorado en 0 (no se listan, igual que antes).
- **Proyección:** "No requiere profesionales del área de Sistemas" = 0 (no se lista, igual que antes).
- **"Medios escritos/audiovisuales u oferta personal" = 7** es la suma de *Medios escritos y audiovisuales* (3) + *Oferta profesional personal* (4), como en la fila combinada original.
- **[REVISAR] Cargos:** *Analista* y *Especialista* ahora **empatan en 32 (40,0 %)**, y *De apoyo* queda muy cerca (31; 38,8 %). El orden de filas se mantiene, pero conviene decir "Analista y Especialista (40,0 % cada uno)".
- En el dashboard, la pregunta de cargos muestra además 3 menciones sueltas de texto libre ("Otro"): *Control de calidad de software* (1), *Docentes* (1) y un duplicado *"Analista,…"* (1). Se recomienda **no** incluirlas en la tabla (coherente con el documento original, que ya omitía "Otro").

**Párrafo posterior a la Tabla 11 (línea 655)**

**TEXTO ACTUAL**
> Como muestra la Tabla 11, existe una absorción laboral activa: el **79,2%** de las empresas ha contratado titulados de la carrera en el último quinquenio y el **81,1% (43 de 53)** prevé incorporar nuevos profesionales (**30,2%** con alta probabilidad y **50,9%** sujeto a nuevos proyectos). El grado de Licenciatura sigue siendo el requisito base de entrada (**71,7%**), aunque un **28,3%** ya exige formación posgradual (Especialidad **15,1%**, Diplomado **7,5%** y Maestría **5,7%**).

**TEXTO NUEVO**
> Como muestra la Tabla 11, existe una absorción laboral activa: el **82,5 %** de las empresas ha contratado titulados de la carrera en el último quinquenio y el **85,0 % (68 de 80)** prevé incorporar nuevos profesionales (**28,8 %** con alta probabilidad y **56,2 %** sujeto a nuevos proyectos). El grado de Licenciatura sigue siendo el requisito base de entrada (**73,8 %**), aunque un **26,2 %** ya exige formación posgradual (Especialidad **16,2 %**, Diplomado **6,2 %** y Maestría **3,8 %**).

---

## 4.1 Mapeo de áreas tecnológicas de alta demanda (líneas 658–702) — Pregunta 10 (P10)

**Intro ACTUAL (línea 659)**
> […] Tras el proceso de Data Wrangling y categorización temática de las respuestas abiertas sobre el total de empresas (**, con 50 respuestas válidas**), se detectaron los siguientes patrones de demanda:

**Intro NUEVO**
> […] Tras el proceso de Data Wrangling y categorización temática de las respuestas abiertas sobre el total de empresas (**n = 80, con 79 respuestas válidas**), se detectaron los siguientes patrones de demanda:

**Bullets ACTUAL (líneas 660–661)**
> * Tendencias principales: […] Inteligencia Artificial y Machine Learning que alcanza **36 menciones (67,9% del total de empleadores y 72,0% de las respuestas válidas)**, […] seguida de Ciberseguridad y Seguridad de la Información con **15 menciones (28,3%)** y Ciencia de Datos, Analítica y Big Data con **10 menciones (18,9%)**.
> * Requerimientos emergentes: […] la Automatización Industrial, IoT y Sistemas Embebidos con **9 menciones (17,0%)**, la Computación en la Nube (Cloud Computing) e Infraestructura con **7 menciones (13,2%)**, la Gestión de Procesos, Visión de Negocio y Transformación Digital con **7 menciones (13,2%)**, y el diseño de Arquitectura de Software, Microservicios e Integración de APIs con **5 menciones (9,4%)**.

**Bullets NUEVO** · **[REVISAR]** (Cloud pasa por encima de Automatización; la categoría "Gestión de Procesos/Negocio" **no existe** en el dashboard y se elimina)
> * Tendencias principales: […] Inteligencia Artificial y Machine Learning que alcanza **55 menciones (68,8 % del total de empleadores y 69,6 % de las respuestas válidas)**, […] seguida de Ciberseguridad y Seguridad de la Información con **21 menciones (26,2 %; 26,6 % de válidas)** y Ciencia de Datos, Analítica y Big Data con **16 menciones (20,0 %; 20,3 %)**.
> * Requerimientos emergentes: […] la Computación en la Nube (Cloud Computing) e Infraestructura con **10 menciones (12,5 %; 12,7 % de válidas)**, la Automatización de Procesos, IoT y Sistemas Embebidos con **8 menciones (10,0 %; 10,1 %)**, y el diseño de Arquitectura de Software, Sistemas Distribuidos e Integración de APIs con **3 menciones (3,8 %)**.

> **[REVISAR]** La categoría *"Gestión de Procesos, Visión de Negocio y Transformación Digital"* **no tiene equivalente en las categorías de palabras clave del dashboard** (`KEYWORD_GROUPS`), por lo que el sistema no la genera. Se eliminó del texto y de la tabla. Si se quiere conservar, debe calcularse aparte (no es reproducible con la lógica del dashboard).

**Tabla de áreas emergentes (líneas 666–697)**

**Encabezados ACTUAL:** `% sobre total (n=53)` · `% sobre válidas (n=50)`
**Encabezados NUEVO:** `% sobre total (n=80)` · `% sobre válidas (n=79)`

**Tabla completa NUEVA** (orden por menciones; se elimina la fila "Gestión de Procesos…"):

| Área tecnológica / Tendencia emergente | Menciones | % sobre total (n=80) | % sobre válidas (n=79) |
|---|---|---|---|
| Inteligencia Artificial y Machine Learning (Agentes, LLMs, RAG, MLOps) | 55 | 68,8 % | 69,6 % |
| Ciberseguridad, DevSecOps e Informática Forense | 21 | 26,2 % | 26,6 % |
| Ciencia de Datos, Análisis de Datos y Big Data | 16 | 20,0 % | 20,3 % |
| Computación en la Nube (Cloud Computing) e Infraestructura | 10 | 12,5 % | 12,7 % |
| Automatización de Procesos, IoT y Sistemas Embebidos | 8 | 10,0 % | 10,1 % |
| Arquitectura de Software, Sistemas Distribuidos y APIs | 3 | 3,8 % | 3,8 % |

> Cambios de orden vs. el documento: **Cloud (10) ahora supera a Automatización/IoT (8)** — se intercambiaron sus filas. Se **eliminó** la fila "Gestión de Procesos, Negocio y Transformación Digital" (sin categoría en el dashboard).
> **Figura 10** debe recapturarse del dashboard (ver lista de figuras al final).

---

## 4.2.1 Competencias técnicas (Hard Skills) (líneas 711–717) — Pregunta 11 (P11)

**TEXTO ACTUAL (bullets, líneas 713–716)**
> * Herramientas de IA y Agentes Autónomos (**52,8% - 28 menciones**): […]
> * Plataformas Cloud e Infraestructura (**15,1% - 8 menciones**): […]
> * Lenguajes de Programación y Desarrollo Web/Móvil: Dominio sólido de lenguajes como Python, Java, Kotlin y frameworks modernos (**9,4% - 5 menciones**), junto con especialización en tecnologías web y móviles (**7,5% - 4 menciones**).
> * DevOps, Seguridad y Persistencia: […] (DevOps: **7,5% - 4 menciones**), herramientas de ciberseguridad (**5,7% - 3 menciones**), ciencia de datos, automatización/IoT, motores de bases de datos y herramientas de gestión ágil (Jira, Trello) con **3,8% (2 menciones) cada una**.

**TEXTO NUEVO** · **[REVISAR]** (DevOps sube al 3.er lugar; cambian casi todas las cifras)
> * Herramientas de IA y Agentes Autónomos (**46,2 % - 37 menciones**; 46,8 % de válidas): Constituyen la principal exigencia técnica, priorizando plataformas asistidas por IA generativa y agentes de codificación orientados a optimizar la productividad y calidad del software.
> * Plataformas Cloud e Infraestructura (**16,2 % - 13 menciones**): servicios y entornos en la nube (AWS, Azure, Linux y servidores remotos).
> * DevOps e Integración Continua (**12,5 % - 10 menciones**): herramientas de integración continua, flujos CI/CD y control de versiones como Git/GitHub.
> * Lenguajes de Programación y Desarrollo Web/Móvil: dominio sólido de lenguajes como Python y Java (**11,2 % - 9 menciones**), junto con especialización en tecnologías web y móviles (**8,8 % - 7 menciones**).
> * Seguridad y Persistencia: herramientas de ciberseguridad (**10,0 % - 8 menciones**), ciencia de datos (**7,5 % - 6**), motores de bases de datos (**6,2 % - 5**) y automatización/IoT (**2,5 % - 2**).

> **[REVISAR]** Cambios de orden/fondo: **DevOps pasa de 4 a 10 menciones y sube al tercer puesto** (por encima de lenguajes y web/móvil). La "gestión ágil (Jira, Trello)" **no es una categoría del dashboard** (lo más próximo es "Liderazgo / Gestión" = 2 menciones); se retiró esa mención específica.
> El párrafo de titulados (línea 717: Base de Datos 94,6 %, T.I.S. 74,3 %, Redes 72,3 %, 71,6 %) es de **titulados: no se toca**.
> **Figura 11** debe recapturarse del dashboard.

---

## 4.2.2 Competencias transversales (Soft Skills) (líneas 725–736) — Pregunta 12 (P12) + Likert ítems 8 y 9

**TEXTO ACTUAL (párrafo, línea 726)**
> Según la matriz Likert aplicada a las **53 organizaciones**, el **86,8% (46 de 53)** de los empleadores está "De acuerdo" o "Totalmente de acuerdo" en que los titulados demuestran un adecuado desarrollo en competencias de comunicación efectiva, resolución de problemas, pensamiento crítico, aprendizaje continuo y trabajo en equipo, mientras que el **83,0% (44)** avala sus valores de ética profesional y responsabilidad social.

**TEXTO NUEVO**
> Según la matriz Likert aplicada a las **80 organizaciones**, el **86,2 % (69 de 80)** de los empleadores está "Parcialmente de acuerdo" o "Totalmente de acuerdo" en que los titulados demuestran un adecuado desarrollo en competencias de comunicación efectiva, resolución de problemas, pensamiento crítico, aprendizaje continuo y trabajo en equipo, mientras que el **85,0 % (68 de 80)** avala sus valores de ética profesional y responsabilidad social.

> (Ítem 8 = competencias laborales → fav 69/80 = 86,2 %; Ítem 9 = valores éticos → fav 68/80 = 85,0 %. Ver nota 1 sobre "Parcialmente de acuerdo".)

**TEXTO ACTUAL (lista de habilidades, líneas 730–735)**
> 1. Trabajo en equipo (**22,6% - 12 menciones**): […]
> 2. Comunicación asertiva (**18,9% - 10 menciones**): […]
> 3. Resolución de problemas y pensamiento crítico (**13,2% - 7 menciones**): […]
> 4. Aprendizaje continuo (**11,3% - 6 menciones**): […]
> 5. Criterio en el uso de IA y Ciberseguridad (**9,4% y 7,5%**): […]
> 6. Inglés técnico (**5,7% - 3 menciones**): […]

**TEXTO NUEVO** · **[REVISAR]** (IA sube y empata con Aprendizaje continuo)
> 1. Trabajo en equipo (**23,8 % - 19 menciones**; 24,1 % de válidas): Capacidad fundamental de integración, empatía laboral y colaboración en grupos de trabajo.
> 2. Comunicación asertiva (**20,0 % - 16 menciones**): Expresión clara de ideas, oratoria técnica y buena comunicación interpersonal con clientes y áreas funcionales.
> 3. Resolución de problemas y pensamiento crítico (**13,8 % - 11 menciones**): Capacidad de abstracción, análisis lógico y diagnóstico eficiente ante incidencias complejas.
> 4. Criterio en el uso de IA y Aprendizaje continuo (**11,2 % - 9 menciones cada uno**): dirigir agentes de IA con criterio técnico y predisposición proactiva para autoaprender nuevas tecnologías.
> 5. Ciberseguridad (**10,0 % - 8 menciones**) y Habilidades blandas en general (**7,5 % - 6**): rigurosidad en la seguridad de la información y competencias interpersonales.
> 6. Inglés técnico (**5,0 % - 4 menciones**): Comprensión y comunicación fluida en el idioma estándar de la industria y la documentación técnica.

> **[REVISAR]** Orden nuevo (menciones): Trabajo en equipo 19 · Comunicación 16 · Resolución 11 · **IA 9 = Aprendizaje continuo 9** · Ciberseguridad 8 · Habilidades blandas 6 · Inglés 4. El "Criterio en el uso de IA" (9) ahora **supera** a Aprendizaje continuo del orden anterior y **empatan**; Inglés baja a 4 menciones (5,0 %).

---

## 4.2.3 Tabla 13 + Diagrama de Radar (líneas 740–857) — 18 ítems Likert

**Intro ACTUAL (línea 741):** `El modelo evalúa los 18 criterios de la matriz Likert aplicada a los empleadores (), codificados en una escala de 1 a 4 […]`
**Intro NUEVO:** `El modelo evalúa los 18 criterios de la matriz Likert aplicada a los empleadores (n = 80), codificados en una escala de 1 a 4 […]` (la descripción de la escala 1 = Totalmente en desacuerdo, 3 = Parcialmente de acuerdo, 4 = Totalmente de acuerdo, excluyendo "No sabe" **es correcta**).

**Fuente ACTUAL (línea 844):** `Fuente: Elaboración propia con base en la encuesta consolidada a empleadores (), UMSS (2026).`
**Fuente NUEVO:** `Fuente: Elaboración propia con base en la encuesta consolidada a empleadores (n = 80), UMSS (2026).`

**Tabla 13 completa NUEVA** (mismo orden de los 18 ítems; Media y DE con 2 decimales; "Acuerdo favorable" = Parcialmente + Totalmente de acuerdo, sobre n = 80):

| Nº | Media (1-4) | DE | Acuerdo Favorable (%) |
|---|---|---|---|
| 1 | 3,32 | 0,88 | 85,0 % |
| 2 | 3,08 | 0,92 | 85,0 % |
| 3 | 2,33 | 1,13 | 47,5 % |
| 4 | 3,21 | 0,76 | 83,8 % |
| 5 | 3,00 | 1,03 | 81,2 % |
| 6 | 3,05 | 0,96 | 81,2 % |
| 7 | 2,83 | 1,08 | 63,8 % |
| 8 | 3,14 | 0,82 | 86,2 % |
| 9 | 3,29 | 0,88 | 85,0 % |
| 10 | 2,84 | 1,08 | 56,2 % |
| 11 | 2,88 | 0,94 | 67,5 % |
| 12 | 2,43 | 1,12 | 53,8 % |
| 13 | 2,39 | 1,20 | 50,0 % |
| 14 | 2,46 | 1,12 | 56,2 % |
| 15 | 2,45 | 1,19 | 53,8 % |
| 16 | 2,45 | 1,21 | 51,2 % |
| 17 | 2,67 | 1,09 | 63,8 % |
| 18 | 2,06 | 1,14 | 40,0 % |

> (El texto de cada criterio —columna 2— no cambia; se mantiene el de las líneas 753–841.)
> Nota de formato: la Tabla 13 original usa punto decimal (3.41); arriba se usa **coma** por coherencia con el resto del informe y con las reglas. Usen el separador que prefieran, los valores son los mismos.
> **n válidas por ítem (excluyendo "No sabe", usadas para media/DE):** 1:75 · 2:78 · 3:63 · 4:72 · 5:79 · 6:76 · 7:66 · 8:76 · 9:75 · 10:58 · 11:65 · 12:67 · 13:67 · 14:69 · 15:69 · 16:67 · 17:70 · 18:67. (Todos tienen 80 respuestas totales; el resto son "No sabe".)

### Párrafos del radar (líneas 853–854 y 852) · **[REVISAR] a fondo**

**TEXTO ACTUAL (línea 853, "Hemisferio derecho")**
> 1. Fortaleza en el perfil de egreso y calidad formativa (Hemisferio derecho, ejes 1 al 9): Existe una convergencia altamente satisfactoria (con medias cercanas o superiores a  sobre  y bajas desviaciones estándar, entre  y ) en todos los indicadores que evalúan directamente al profesional titulado. Los picos más altos del radar se registran en la confianza institucional hacia la Carrera (Ítem 1: Media = 3,41; DE = 0,84), los valores éticos y de responsabilidad social (Ítem 9: Media = 3,29; DE = 0,90), el conocimiento del perfil de egreso (Ítem 4: Media = 3,28; DE = 0,67) y el desarrollo de competencias laborales y transversales (Ítem 8: Media = 3,22; DE = 0,81), seguidos del desempeño destacado e integral (Ítem 6: Media = 3,17; DE = 0,85) y la consistencia del título profesional (Ítem 2: Media = 3,10; DE = 0,88). Asimismo, la coherencia del perfil con el desempeño (Ítem 5: Media = 2,96) y la incorporación de necesidades en prácticas/pasantías (Ítem 7: Media = 2,90) se mantienen en un rango aceptable.

**TEXTO NUEVO**
> 1. Fortaleza en el perfil de egreso y calidad formativa (Hemisferio derecho, ejes 1 al 9): Existe una convergencia altamente satisfactoria (con medias cercanas o superiores a **3,0 sobre 4** y desviaciones estándar entre **0,76 y 1,03**) en los indicadores que evalúan directamente al profesional titulado. Los picos más altos del radar se registran en la confianza institucional hacia la Carrera (Ítem 1: Media = **3,32**; DE = **0,88**), los valores éticos y de responsabilidad social (Ítem 9: Media = **3,29**; DE = **0,88**), el conocimiento del perfil de egreso (Ítem 4: Media = **3,21**; DE = **0,76**) y el desarrollo de competencias laborales y transversales (Ítem 8: Media = **3,14**; DE = **0,82**), seguidos de la consistencia del título profesional (Ítem 2: Media = **3,08**; DE = **0,92**) y el desempeño destacado e integral (Ítem 6: Media = **3,05**; DE = **0,96**). Asimismo, la coherencia del perfil con el desempeño (Ítem 5: Media = **3,00**) se mantiene en el umbral favorable, mientras que la incorporación de necesidades en prácticas/pasantías (Ítem 7: Media = **2,83**) desciende ligeramente por debajo de 3.

> **[REVISAR]** Cambios: (a) ahora **Ítem 2 (3,08) supera a Ítem 6 (3,05)** → se invirtió su orden en la frase; (b) **Ítem 5 = 3,00** (justo en el umbral) e **Ítem 7 = 2,83** ya **no llega a 3** (antes 2,96 y 2,90); se ajustó la redacción final. Picos altos confirmados: 1, 9, 4, 8, 2, 6.

**TEXTO ACTUAL (línea 854, "Hemisferio izquierdo")**
> 2. Brechas críticas en relacionamiento B2B y consulta al sector productivo (Hemisferio izquierdo, ejes 3 y 10 al 18): […] Las puntuaciones más bajas y con mayor dispersión () se ubican en la consulta periódica durante los procesos de autoevaluación (Ítem 18: Media = 1,98; DE = 1,16), la participación en actividades de vinculación tecnológica (Ítem 12: Media = 2,22; DE = 1,13), la consulta sobre la pertinencia del plan de estudios (Ítem 16: Media = 2,22; DE = 1,25; Ítem 15: Media = 2,26; DE = 1,21), el intercambio conjunto entre empresas, docentes y estudiantes (Ítem 14: Media = 2,23; DE = 1,10), la difusión de convocatorias y pasantías (Ítem 13: Media = 2,26; DE = 1,21) y la consulta regular de las autoridades sobre el perfil requerido (Ítem 3: Media = 2,39; DE = 1,17). Incluso la búsqueda directa de talento en la Carrera (Ítem 17: Media = 2,63) se ve limitada por la falta de canales formales.

**TEXTO NUEVO**
> 2. Brechas críticas en relacionamiento B2B y consulta al sector productivo (Hemisferio izquierdo, ejes 3 y 10 al 18): […] Las puntuaciones más bajas y con mayor dispersión (**DE entre 1,09 y 1,21**) se ubican en la consulta periódica durante los procesos de autoevaluación (Ítem 18: Media = **2,06**; DE = **1,14**), la consulta regular de las autoridades sobre el perfil requerido (Ítem 3: Media = **2,33**; DE = **1,13**), la difusión de convocatorias y pasantías (Ítem 13: Media = **2,39**; DE = **1,20**), el pedido de opinión sobre la pertinencia del plan de estudios (Ítem 12: Media = **2,43**; DE = **1,12**; Ítem 15: Media = **2,45**; DE = **1,19**; Ítem 16: Media = **2,45**; DE = **1,21**) y el intercambio conjunto entre empresas, docentes y estudiantes (Ítem 14: Media = **2,46**; DE = **1,12**). Incluso la búsqueda directa de talento en la Carrera (Ítem 17: Media = **2,67**) se ve limitada por la falta de canales formales.

> **[REVISAR]** Cambios de orden en el "fondo" del radar: el ítem más bajo sigue siendo el **18 (2,06)**, pero el segundo más bajo ahora es el **Ítem 3 (2,33)** (antes estaban más bajos el 12 y 16). El grupo 12/14/15/16 subió a ~2,4–2,5. Verificar la narrativa de "consulta sobre pertinencia" (Ítems 15 y 16 ahora 2,45, no 2,22/2,26).
> El párrafo de conclusión (línea 857) sigue siendo válido cualitativamente (fortaleza en perfil / debilidad en vinculación) — **no requiere cambios numéricos**.
> **Figura 13 (Diagrama de Radar)** debe recapturarse del dashboard.

---

## 5.2 Hallazgos principales — bullet "Empleadores" (línea 911)

**TEXTO ACTUAL**
> * Empleadores. **43 de 53** organizaciones (**81.1 %**) prevén contratar ingenieros de sistemas (**42** ya contrataron en los últimos 5 años); el nivel de formación más demandado es Licenciatura (**38 de 53**).

**TEXTO NUEVO**
> * Empleadores. **68 de 80** organizaciones (**85,0 %**) prevén contratar ingenieros de sistemas (**66** ya contrataron en los últimos 5 años); el nivel de formación más demandado es Licenciatura (**59 de 80**).

---

## 6.1 Conclusiones del análisis de mercado (líneas 922, 931, 940)

**TEXTO ACTUAL (línea 922)**
> El estudio aplicado a 148 titulados y **53 empleadores** de la Carrera de Ingeniería de Sistemas (UMSS) permite concluir lo siguiente:

**TEXTO NUEVO**
> El estudio aplicado a 148 titulados y **80 empleadores** de la Carrera de Ingeniería de Sistemas (UMSS) permite concluir lo siguiente:

**TEXTO ACTUAL (conclusión 3, línea 931, última frase)**
> […] Esta tendencia es coherente con la percepción de los empleadores, cuyas menciones de áreas emergentes priorizan IA/Agentes (**36 menciones**), Ciberseguridad (**15**) y Ciencia de Datos (**10**).

**TEXTO NUEVO**
> […] Esta tendencia es coherente con la percepción de los empleadores, cuyas menciones de áreas emergentes priorizan IA/Agentes (**55 menciones**), Ciberseguridad (**21**) y Ciencia de Datos (**16**).

**TEXTO ACTUAL (conclusión 6, línea 940)**
> 6. Fuerte demanda del sector empleador. El **81.1 %** de las organizaciones (**43 de 53**) prevé contratar ingenieros de sistemas y el **79.2 % (42 de 53)** ya lo hizo en los últimos cinco años, desempeñándose principalmente en cargos Técnico (**69.8 %**), Analista (**49.1 %**) y Especialista (**43.4 %**). El nivel de formación más demandado es Licenciatura […]

**TEXTO NUEVO** · **[REVISAR]** (Analista y Especialista ahora empatan)
> 6. Fuerte demanda del sector empleador. El **85,0 %** de las organizaciones (**68 de 80**) prevé contratar ingenieros de sistemas y el **82,5 % (66 de 80)** ya lo hizo en los últimos cinco años, desempeñándose principalmente en cargos Técnico (**73,8 %**), Analista y Especialista (**40,0 % cada uno**) y De apoyo (**38,8 %**). El nivel de formación más demandado es Licenciatura […]

---

## 6.2.3 Estrategias de vinculación empresarial B2B (líneas 963–968)

**TEXTO ACTUAL (línea 964)**
> Ante la alta demanda del sector (**81.1 %** prevé contratar) y la brecha de concordancia (2.63/4), se propone:

**TEXTO NUEVO**
> Ante la alta demanda del sector (**85,0 %** prevé contratar) y la brecha de concordancia (2.63/4), se propone:

> (El "2.63/4" es la concordancia de **titulados**: no se toca.)

**TEXTO ACTUAL (línea 966)**
> * Formalizar convenios de pasantías y prácticas profesionales con empresas que ya contratan titulados (**42 de 53**).

**TEXTO NUEVO**
> * Formalizar convenios de pasantías y prácticas profesionales con empresas que ya contratan titulados (**66 de 80**).

---

# BUSCAR → REEMPLAZAR (Ctrl+H en Google Docs)

> Usar **solo** cadenas inequívocas. **Nunca** buscar "53" a secas (colisiona con titulados: Tabla 4 "53" y frecuencia esperada "2,53").
> Hacer los reemplazos **largos primero**. Marcar la casilla "Coincidir con mayúsculas y minúsculas" no es necesario.

| # | Buscar | Reemplazar | Nota |
|---|---|---|---|
| 1 | `148 titulados y 53 empleadores` | `148 titulados y 80 empleadores` | §6.1 |
| 2 | `De las 53 organizaciones` | `De las 80 organizaciones` | §4 intro |
| 3 | `43 de 53` | `68 de 80` | §Tabla11, §5.2, §6.1 (prevé contratar) |
| 4 | `42 de 53` | `66 de 80` | §5.2 texto, §6.1, §6.2.3 (ya contrataron) |
| 5 | `38 de 53` | `59 de 80` | §5.2 (Licenciatura) |
| 6 | `(n=53)` | `(n=80)` | encabezado tabla §4.1 |
| 7 | `(n=50)` | `(n=79)` | encabezado tabla §4.1 (válidas) |
| 8 | `con 50 respuestas válidas` | `con 79 respuestas válidas` | §4.1 intro |
| 9 | `81,1% (43 de 53)` | `85,0 % (68 de 80)` | §Tabla11 párrafo |
| 10 | `81.1 %` | `85,0 %` | §5.2, §6.1, §6.2.3 (ojo: formato con punto) |
| 11 | `79,2%` | `82,5 %` | §Tabla11 párrafo (coma) |
| 12 | `79.2 %` | `82,5 %` | §6.1 (punto) |
| 13 | `aplicada a las 53 organizaciones` | `aplicada a las 80 organizaciones` | §4.2.2 |
| 14 | `86,8% (46 de 53)` | `86,2 % (69 de 80)` | §4.2.2 |

> Las cifras de tablas (Tabla 11, Tabla 13, tabla de áreas) y los bullets de §4.1, §4.2.1, §4.2.2 y los párrafos del radar conviene **reemplazarlos a mano** copiando los bloques "TEXTO NUEVO"/tablas de arriba (hay demasiados números individuales para un find/replace seguro).

---

# Figuras a recapturar del dashboard

- **Figura 10 — Áreas tecnológicas más emergentes** (Pregunta 10 / P421). Cambian menciones y orden (Cloud > Automatización; desaparece "Gestión de Procesos").
- **Figura 11 — Herramientas más demandadas** (Pregunta 11 / P422). Cambian menciones y orden (DevOps sube al 3.er lugar).
- **Figura 13 — Diagrama de Radar** (18 ítems Likert). Cambian todas las medias; recapturar el radar completo (y, si aplica, la figura de la Pregunta 12 de habilidades tras la línea 738).

> (Las Figuras 1–9 son de titulados: **no se tocan**.)

---

# Resumen de consultas / lógica SQL usada (para verificación)

Encuesta de empleadores: `survey_id = 14`, 80 submissions. Toda la lógica replica `StatsService.compute()`.

**0. Identificación y conteo**
```sql
SELECT id, name, origin FROM surveys;                 -- 14 = Empleadores (GOOGLE_FORMS)
SELECT COUNT(*) FROM submissions WHERE survey_id = 14; -- 80
```

**1. "n válidas" por pregunta** (equivale a `answered()`: no NA y `normalized_value` no vacío)
```sql
SELECT question_id, COUNT(*) FROM submission_answers
WHERE question_id = :qid
  AND is_not_applicable = FALSE
  AND normalized_value IS NOT NULL AND btrim(normalized_value) <> ''
GROUP BY question_id;
```

**2. Perfil y preguntas cerradas (opción única)** — Q413 sector, Q414 tamaño, Q415 rubro, Q416 contrató, Q417 proyección, Q418 nivel, Q419 medio. % sobre n = 80.
```sql
SELECT sa.normalized_value, COUNT(*) AS cantidad,
       ROUND(COUNT(*) * 100.0 / 80, 1) AS pct
FROM submission_answers sa
WHERE sa.question_id = :qid
  AND sa.is_not_applicable = FALSE
  AND sa.normalized_value IS NOT NULL AND btrim(sa.normalized_value) <> ''
GROUP BY sa.normalized_value
ORDER BY cantidad DESC;   -- las etiquetas visibles salen de question_options.display_text
```

**3. Selección múltiple (Q420 cargos)** — se replica el *splitter* de Google Forms (separador `, ` fuera de paréntesis) en Python sobre `normalized_value`; base = nº de respondientes (80). Verificación cruzada contra `submission_answer_options`:
```sql
SELECT qo.display_text, COUNT(DISTINCT sa.submission_id) AS marcaron,
       ROUND(COUNT(DISTINCT sa.submission_id) * 100.0 / 80, 1) AS pct
FROM submission_answers sa
JOIN submission_answer_options sao ON sao.answer_id = sa.id
JOIN question_options qo ON qo.id = sao.option_id
WHERE sa.question_id = 420
GROUP BY qo.display_text ORDER BY marcaron DESC;
```

**4. Preguntas abiertas (Q421, Q422, Q423)** — categorización con los 17 `KEYWORD_GROUPS` del backend (regex sobre `normalized_value`, ya en minúsculas y sin tildes); cuenta de **respuestas** que mencionan cada tema; n válidas = 79; se reportan % sobre 80 y sobre 79. (Ejecutado en Python con las mismas expresiones regulares que `StatsService.extractKeywords`.) Texto crudo:
```sql
SELECT normalized_value FROM submission_answers
WHERE question_id IN (421,422,423)
  AND is_not_applicable = FALSE
  AND normalized_value IS NOT NULL AND btrim(normalized_value) <> '';
```

**5. Likert (Q424–Q441, escala `likert_scales.id = 6`)** — media y DE (poblacional, ÷N) sobre el mapa `{totalmente de acuerdo=4, parcialmente de acuerdo=3, totalmente desacuerdo=1}`, **excluyendo "No sabe"**; "Acuerdo favorable" = (totalmente + parcialmente de acuerdo) / 80.
```sql
SELECT q.position, sa.normalized_value, COUNT(*) AS freq
FROM submission_answers sa
JOIN questions q ON q.id = sa.question_id
WHERE q.survey_id = 14 AND q.type = 'MATRIX_LIKERT'
  AND sa.is_not_applicable = FALSE
  AND sa.normalized_value IS NOT NULL AND btrim(sa.normalized_value) <> ''
GROUP BY q.position, sa.normalized_value
ORDER BY q.position;
-- media/DE: mapear a numeric_value (no sabe = NULL se excluye), población ÷N
-- favorable = (totalmente de acuerdo + parcialmente de acuerdo) / 80
```

> Todas las consultas se ejecutaron en **modo solo lectura** (`SET SESSION CHARACTERISTICS AS TRANSACTION READ ONLY`). No se modificó ningún dato ni el esquema.
