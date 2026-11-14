// ============================================================
//  DATOS DEL DASHBOARD  (editar aquí para usar los datos reales)
//  Los puntos del gráfico son una muestra representativa del
//  análisis en Python; los KPIs/ANOVA son los resultados reportados.
// ============================================================
window.DATA = {
  kpis: {
    registros: 188,
    correlacion: 0.50,
    ysNorm: 546,
    ysRec: 476,
    utsNorm: 788,
    utsRec: 653,
    pValue: 0.0013,
    cNorm: 0.37,
    cRec: 0.51
  },
  procesos: {
    "Recocido":             { color: "#fb7185", pts: [[0.1,400],[0.2,450],[0.4,650],[0.5,710],[0.8,800]] },
    "Normalizado":          { color: "#34d399", pts: [[0.1,480],[0.2,560],[0.35,690],[0.4,820],[0.55,860]] },
    "Laminado en caliente": { color: "#38bdf8", pts: [[0.15,410],[0.25,510],[0.45,610],[0.6,760],[0.9,890]] }
  }
};
