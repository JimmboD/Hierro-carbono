# Hierro-carbono · Dashboard de aceros al carbono

**Proyecto 2 · Ingeniería de Materiales** — Análisis y visualización de propiedades mecánicas de aceros al carbono, a partir de la base de datos *Steel – Property and Composition (Carbon Steel)*.

Es un sitio web **100 % estático** (HTML, CSS y JavaScript), listo para publicarse en GitHub Pages. Tiene modo oscuro, animaciones y gráficos interactivos.

## Objetivo

Investigar cómo se relacionan la composición química (%C), las condiciones de procesamiento y las propiedades mecánicas (UTS, YS, dureza y elongación) de distintos aceros al carbono. Los resultados se presentan de forma que otros estudiantes o ingenieros puedan explorarlos.

## Qué contiene el dashboard

| Sección | Descripción |
|---|---|
| **Resumen (KPIs)** | Registros válidos, correlación %C–UTS, YS promedio por tratamiento y valor p del ANOVA, con contadores animados. |
| **UTS vs % de carbono** | Gráfico de dispersión interactivo. Se filtra por proceso (recocido, normalizado, laminado en caliente) y tiene una línea de tendencia lineal con su ecuación. |
| **Impacto del tratamiento térmico** | Barras de UTS y YS promedio para recocido y normalizado (ANOVA). |
| **Carbono promedio por tratamiento** | Dona que compara el %C medio de recocido y normalizado. |
| **¿Por qué normalizado > recocido?** | Explicación microestructural (perlita fina vs gruesa, Hall-Petch). |
| **Propuesta propia: estimador de UTS** | Un deslizador de %C y un selector de proceso estiman el UTS (regresión lineal por proceso). Muestran la proporción aproximada de ferrita y perlita. |
| **Diagrama de fases Fe–Fe₃C** | Diagrama esquemático con un marcador que sigue el %C elegido e indica A₃/Acm, A₁ y el carácter hipo o hipereutectoide. |
| **Interpretación ingenieril** | Conclusiones por pestañas: limpieza de datos, efecto del carbono y recocido vs normalizado, con limitaciones. |

## Hallazgos principales

- **Limpieza de datos:** se excluyó el grado **SAE 12L14** por un error de transcripción en la base original (15 % C, imposible en un acero al carbono). Quedaron **188 registros válidos**.
- **Efecto del carbono:** hay una correlación positiva moderada entre %C y resistencia (r ≈ 0.50). Más carbono significa más cementita (Fe₃C), que bloquea el movimiento de dislocaciones.
- **Recocido vs normalizado (ANOVA):** los normalizados son significativamente más resistentes (**p = 0.0013**).

  | | Recocido | Normalizado |
  |---|---|---|
  | UTS promedio | 653 MPa | 788 MPa |
  | YS promedio | 476 MPa | 546 MPa |
  | %C promedio | 0.51 % | 0.37 % |

  Aunque el recocido tiene más carbono, el enfriamiento al aire del normalizado produce **perlita fina** (menor distancia interlaminar) y mayor resistencia.

## Limitaciones

- Los grupos de tratamiento no están balanceados y hay variables no controladas (aleación, geometría, lote, espesor).
- Los puntos de los gráficos son una **muestra representativa** del análisis en Python, no el conjunto completo de 188 registros.
- El estimador de UTS es una regresión lineal simple sobre esa muestra. Sirve para ilustrar tendencias y **no sustituye ensayos reales**.
- El diagrama de fases es esquemático: omite la región δ y usa líneas rectas como aproximación.

## Estructura del proyecto

```
Hierro-carbono/
├── index.html        # Estructura de la página
├── css/
│   └── styles.css    # Tema oscuro, tarjetas, animaciones, slider, switch
├── js/
│   ├── data.js       # Datos (KPIs y puntos por proceso). Editar aquí
│   └── app.js        # Gráficos, estimador, diagrama de fases y animaciones
├── .gitignore        # Ignora *.xlsx
└── README.md
```

## Tecnologías

- HTML5, CSS3 (variables, `backdrop-filter`, animaciones) y JavaScript.
- [Chart.js 4](https://www.chartjs.org/) por CDN para los gráficos.
- Canvas 2D para el fondo de partículas y el diagrama de fases.
- Fuente Inter (Google Fonts).

La página necesita conexión a internet para cargar Chart.js y la fuente.

## Cómo ejecutarlo

Abre `index.html` en el navegador. O sírvelo localmente:

```bash
python -m http.server 8000
# luego visita http://localhost:8000
```

## Publicar en GitHub Pages

1. Sube el repositorio a GitHub.
2. Entra en **Settings → Pages**.
3. En *Source* elige la rama `main` y la carpeta `/ (root)`.
4. Guarda. El sitio quedará en `https://<usuario>.github.io/Hierro-carbono/`.

## Cómo actualizar los datos

Edita [`js/data.js`](js/data.js):

- `kpis`: valores de las tarjetas, medias y el valor p.
- `procesos`: lista de puntos `[%C, UTS]` por cada proceso, con su color.

Los gráficos, la línea de tendencia y el estimador se recalculan solos a partir de esos datos.

## Metodología resumida

1. **Preparación:** exploración de variables, clasificación del procesamiento, revisión de calidad y eliminación de valores imposibles.
2. **Análisis:** correlación %C vs propiedades y comparación entre tratamientos con ANOVA.
3. **Interpretación:** relación entre microestructura (ferrita, perlita, cementita) y resistencia.
4. **Producto:** dashboard interactivo con una propuesta propia (estimador y diagrama de fases).

> **Nota:** `*.xlsx` está en `.gitignore`, así que el archivo de datos original no se sube al repositorio.
