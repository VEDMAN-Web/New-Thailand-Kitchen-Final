const base = process.env.PERF_BASE || "http://127.0.0.1:3000";
const pages = ["/", "/products", "/gallery", "/kitchens/styles", "/privacy", "/robots.txt", "/pl"];

for (const p of pages) {
  const t0 = Date.now();
  try {
    const res = await fetch(base + p, {
      redirect: "manual",
      signal: AbortSignal.timeout(120_000),
    });
    const body = await res.text();
    const ms = Date.now() - t0;
    const title = (body.match(/<title>([^<]*)<\/title>/i) || [])[1] || "";
    console.log(
      `${p} status=${res.status} time=${ms}ms bytes=${body.length} title=${title.slice(0, 70)}`
    );
  } catch (e) {
    console.log(`${p} ERR ${e.message} after ${Date.now() - t0}ms`);
  }
}

console.log("--- warm ---");
for (const p of ["/", "/products", "/gallery", "/privacy"]) {
  const t0 = Date.now();
  try {
    const res = await fetch(base + p, { signal: AbortSignal.timeout(30_000) });
    await res.arrayBuffer();
    console.log(`${p} warm=${Date.now() - t0}ms status=${res.status}`);
  } catch (e) {
    console.log(`${p} warm ERR ${e.message}`);
  }
}
