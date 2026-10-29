const BASE = "https://script.google.com/macros/s/AKfycbwqAMP6UZ86irzLBQ-UrKdn8gNbDwhZENCyjgUeDwV6iFujz-r0T6cAwZ5KcfPe7zj1/exec";

module.exports = async (req, res) => {
  const KEY = process.env.RESOLVER_KEY || "";
  const modo = String(req.query.modo || "").toLowerCase();
  const comercio = String(req.query.comercio || "").trim();

  if (!comercio) return res.status(400).send("Falta el comercio");

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
