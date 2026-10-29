const SHEET_ID = "1Lqqv2imhS2L2PELnAgdGKqenpd812v0lMsq9-_zHSbU";
const HOJA = "link";
const CELDA = "B1:B1";

let cache = { url: "", t: 0 };

// Lee el enlace del script desde la hoja (cacheado 60 segundos)
async function obtenerBase() {
  if (cache.url && Date.now() - cache.t < 60000) return cache.url;
  const u = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(HOJA)}&range=${CELDA}&headers=0`;
  const r = await fetch(u, { redirect: "follow" });
  const txt = await r.text();
  const m = txt.match(/https:\/\/script\.google\.com\/[^",\s]+/);
  if (!m) throw new Error("No se encontró el enlace en la celda");
  cache = { url: m[0], t: Date.now() };
  return m[0];
}

module.exports = async (req, res) => {
  const KEY = process.env.RESOLVER_KEY || "";
  const modo = String(req.query.modo || "").toLowerCase();
  const comercio = String(req.query.comercio || "").trim();

  if (!comercio) return res.status(400).send("Falta el comercio");

  let BASE;
  try {
    BASE = await obtenerBase();
  } catch (err) {
    return res.status(500).send("No se pudo leer el enlace de la hoja Licencia");
  }

  if (modo === "tienda") {
    return res.redirect(302, `${BASE}?tienda=${encodeURIComponent(comercio)}`);
  }

  if (modo === "admin" || modo === "rapi") {
    let lic = comercio;
    try {
      const r = await fetch(`${BASE}?resolver=${encodeURIComponent(comercio)}&key=${encodeURIComponent(KEY)}`, { redirect: "follow" });
      const t = (await r.text()).trim();
      if (t && !t.startsWith("<")) lic = t;
    } catch (err) {}
    return res.redirect(302, `${BASE}?${modo}=true&lic=${encodeURIComponent(lic)}`);
  }

  res.status(404).send("No encontrado");
};
