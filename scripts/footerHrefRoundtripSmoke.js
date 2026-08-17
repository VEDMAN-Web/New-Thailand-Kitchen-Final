/**
 * Thailand Kitchen footer href roundtrip:
 * admin save → public CMS → live site uses the exact href (page or URL).
 *
 *   node scripts/footerHrefRoundtripSmoke.js
 */
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });

const API = (process.env.PUBLIC_API_URL || "http://127.0.0.1:5000").replace(/\/$/, "");
const FE = (process.env.CLIENT_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const EMAIL = process.env.ADMIN_EMAIL || "admin@thailandkitchens.com";
const PASSWORD = process.env.ADMIN_PASSWORD || "";

const results = [];

function pass(name, detail = "") {
  results.push({ name, ok: true, detail });
  console.log(`  ✓ ${name}${detail ? ` — ${detail}` : ""}`);
}
function fail(name, detail = "") {
  results.push({ name, ok: false, detail });
  console.log(`  ✗ ${name}${detail ? ` — ${detail}` : ""}`);
}

async function sleep(ms) {
  await new Promise((r) => setTimeout(r, ms));
}

async function req(path, opts = {}) {
  const headers = {
    Accept: "application/json",
    ...(opts.body ? { "Content-Type": "application/json" } : {}),
    ...(opts.token ? { Authorization: `Bearer ${opts.token}` } : {}),
    ...(opts.headers || {}),
  };
  let lastErr;
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const res = await fetch(`${API}${path}`, {
        method: opts.method || "GET",
        headers,
        body: opts.body ? JSON.stringify(opts.body) : undefined,
      });
      const body = await res.json().catch(() => ({}));
      return { status: res.status, body };
    } catch (err) {
      lastErr = err;
      await sleep(400 * attempt);
    }
  }
  throw lastErr;
}

function homeLinksFrom(sections) {
  return Array.isArray(sections?.footer?.homeLinks) ? sections.footer.homeLinks : [];
}

function productLinksFrom(sections) {
  return Array.isArray(sections?.footer?.productLinks) ? sections.footer.productLinks : [];
}

function hrefOf(link) {
  const h = link?.href;
  if (typeof h === "string") return h.trim();
  if (h && typeof h === "object") return String(h.en || h.th || h.pl || "").trim();
  return "";
}

async function main() {
  console.log(`\nThailand Kitchen footer href roundtrip`);
  console.log(`API=${API}`);
  console.log(`FE=${FE}\n`);

  if (!PASSWORD) {
    fail("Admin password", "ADMIN_PASSWORD missing in .env");
    process.exit(1);
  }

  const health = await fetch(`${API}/api/health`).then((r) => r.json()).catch(() => null);
  if (health) pass("API health", JSON.stringify(health).slice(0, 80));
  else fail("API health", "unreachable");

  const login = await req("/api/auth/login", {
    method: "POST",
    body: { email: EMAIL, password: PASSWORD },
  });
  const token = login.body?.token || login.body?.data?.token;
  if (login.status === 200 && token) pass("Admin login");
  else {
    fail("Admin login", `HTTP ${login.status}`);
    process.exit(1);
  }

  const getHome = async () => {
    const r = await req("/api/cms/thailand-kitchen/home");
    return r.body?.home?.sections || {};
  };

  const before = await getHome();
  const homes = homeLinksFrom(before);
  const products = productLinksFrom(before);
  if (homes.length) pass("Footer home links", `${homes.length} rows`);
  else fail("Footer home links", "none");
  if (products.length) pass("Footer product links", `${products.length} rows`);
  else fail("Footer product links", "none");

  const original = JSON.parse(JSON.stringify(before));
  const targetIndex = (() => {
    const byLabel = homes.findIndex((l) =>
      /co-partner/i.test(JSON.stringify(l.label || ""))
    );
    if (byLabel >= 0) return byLabel;
    const byHref = homes.findIndex((l) => /#brands/i.test(hrefOf(l)));
    return byHref >= 0 ? byHref : 0;
  })();
  const originalHref = hrefOf(homes[targetIndex] || {});
  pass("Target footer link", `index ${targetIndex} was "${originalHref}"`);

  const putHome = async (sections) =>
    req("/api/cms/thailand-kitchen/home", {
      method: "PUT",
      token,
      body: { sections },
    });

  async function assertPublicHref(want, label) {
    const sections = await getHome();
    const got = hrefOf(homeLinksFrom(sections)[targetIndex] || {});
    if (got === want) pass(label, got);
    else fail(label, `got "${got}", want "${want}"`);
  }

  const pageHref = "/contact";
  {
    const next = JSON.parse(JSON.stringify(before));
    if (!next.footer) next.footer = {};
    next.footer.homeLinks = homeLinksFrom(next).map((l, i) =>
      i === targetIndex ? { ...l, href: pageHref } : l
    );
    const put = await putHome(next);
    if (put.status >= 200 && put.status < 300) pass("PUT href=/contact");
    else fail("PUT href=/contact", `HTTP ${put.status}`);
    await assertPublicHref(pageHref, "Public CMS has /contact");
    {
      const sections = await getHome();
      const others = homeLinksFrom(sections)
        .map((l, i) => ({ i, href: hrefOf(l) }))
        .filter((row) => row.i !== targetIndex);
      const originalOthers = homeLinksFrom(original)
        .map((l, i) => ({ i, href: hrefOf(l) }))
        .filter((row) => row.i !== targetIndex);
      const same = JSON.stringify(others) === JSON.stringify(originalOthers);
      if (same) pass("Other footer hrefs unchanged");
      else fail("Other footer hrefs unchanged", JSON.stringify({ others, originalOthers }));
    }
  }

  const extHref = "https://example.com/tk-footer-smoke";
  {
    const current = await getHome();
    current.footer.homeLinks = homeLinksFrom(current).map((l, i) =>
      i === targetIndex ? { ...l, href: extHref } : l
    );
    const put = await putHome(current);
    if (put.status >= 200 && put.status < 300) pass("PUT external href");
    else fail("PUT external href", `HTTP ${put.status}`);
    await assertPublicHref(extHref, "Public CMS has external URL");
  }

  {
    const restore = JSON.parse(JSON.stringify(original));
    const put = await putHome(restore);
    if (put.status >= 200 && put.status < 300) pass("Restored original footer hrefs");
    else fail("Restored original footer hrefs", `HTTP ${put.status}`);
    await assertPublicHref(originalHref, "Public CMS restored");
  }

  const restored = await getHome();
  const allFooterHrefs = [
    ...homeLinksFrom(restored).map(hrefOf),
    ...productLinksFrom(restored).map(hrefOf),
  ];
  if (allFooterHrefs.every((h) => h && h !== "[object Object]")) {
    pass("All footer hrefs are real strings", allFooterHrefs.join(", "));
  } else fail("All footer hrefs are real strings", JSON.stringify(allFooterHrefs));

  for (const path of ["/", "/contact", "/catalogue", "/products", "/privacy", "/terms"]) {
    try {
      const res = await fetch(`${FE}${path}`, {
        headers: { "User-Agent": "TkFooterSmoke/1.0", "Cache-Control": "no-cache" },
      });
      if (res.status === 200) pass(`FE ${path}`, "200");
      else fail(`FE ${path}`, `HTTP ${res.status}`);
    } catch (err) {
      fail(`FE ${path}`, err.message || String(err));
    }
  }

  const failed = results.filter((r) => !r.ok);
  console.log(`\n——— ${results.length - failed.length}/${results.length} passed ———`);
  if (failed.length) {
    console.log("Failures:");
    for (const f of failed) console.log(`  - ${f.name}: ${f.detail}`);
    process.exit(1);
  }
  console.log("Footer hrefs roundtrip green — ready to deploy.\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
