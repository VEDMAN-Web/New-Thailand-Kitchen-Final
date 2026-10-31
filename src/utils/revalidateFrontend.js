/**
 * Triggers on-demand cache revalidation in the public Next.js frontend.
 * Called immediately after successful database mutations.
 *
 * Required environment variables (backend):
 *   REVALIDATION_SECRET          — shared secret, must match the frontend's REVALIDATION_SECRET
 *   PUBLIC_FRONTEND_REVALIDATE_URL — full URL to the frontend revalidation endpoint, e.g.
 *                                    https://staging.thailandkitchens.com/api/revalidate
 *                                    Falls back to CLIENT_URL/api/revalidate if not set.
 *
 * @param {Object} options
 * @param {string[]} [options.tags]   - Cache tags to expire (e.g. ['cms-home', 'cms-products'])
 * @param {string[]} [options.paths]  - Public paths to invalidate (e.g. ['/', '/products'])
 * @param {string}  [options.siteId]  - Site ID (defaults to 'thailand-kitchen')
 */
async function triggerFrontendRevalidation({ tags = [], paths = [], siteId = "thailand-kitchen" } = {}) {
  // Only trigger for Thailand Kitchen site
  if (siteId && siteId !== "thailand-kitchen") {
    return;
  }

  const secret = process.env.REVALIDATION_SECRET?.trim();
  if (!secret) {
    // Log a clear warning so the misconfiguration is visible in backend logs.
    // This is the most common reason on-demand revalidation silently fails.
    console.warn(
      "[revalidate] REVALIDATION_SECRET is not set on the backend. " +
        "On-demand cache revalidation is disabled. " +
        "Set REVALIDATION_SECRET in the backend environment and ensure it matches " +
        "the REVALIDATION_SECRET set on the public frontend (Vercel)."
    );
    return;
  }

  // Derive the target revalidation URL.
  // Prefer the dedicated PUBLIC_FRONTEND_REVALIDATE_URL env var (full URL).
  // Fall back to CLIENT_URL + /api/revalidate.
  const baseUrl = (
    process.env.PUBLIC_FRONTEND_REVALIDATE_URL?.trim() ||
    process.env.CLIENT_URL?.trim() ||
    "http://127.0.0.1:3000"
  ).replace(/\/+$/, "");

  // If PUBLIC_FRONTEND_REVALIDATE_URL already ends with /api/revalidate, use
  // it as-is; otherwise append the path.
  const targetUrl = baseUrl.endsWith("/api/revalidate")
    ? baseUrl
    : `${baseUrl}/api/revalidate`;

  console.log("[revalidate] Sending revalidation webhook:", {
    url: targetUrl,
    tags,
    paths,
  });

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-revalidate-secret": secret,
      },
      body: JSON.stringify({ tags, paths }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (res.ok) {
      let body = {};
      try { body = await res.json(); } catch { /* ignore */ }
      console.log("[revalidate] Webhook accepted:", {
        status: res.status,
        revalidatedTags: body.revalidatedTags,
        revalidatedPaths: body.revalidatedPaths,
      });
    } else {
      const text = await res.text().catch(() => "");
      // Non-2xx from the frontend revalidation endpoint — log clearly so it
      // is visible in backend logs without printing the secret.
      console.warn(
        `[revalidate] Webhook rejected by frontend. ` +
          `status=${res.status} url=${targetUrl} body=${text.slice(0, 200)}`
      );
    }
  } catch (err) {
    if (err.name === "AbortError") {
      console.warn(
        `[revalidate] Webhook timed out after 8 s. ` +
          `Frontend may be slow to respond. url=${targetUrl}`
      );
    } else {
      console.warn(
        `[revalidate] Could not reach frontend revalidation endpoint. ` +
          `url=${targetUrl} error=${err.message}`
      );
    }
  }
}

module.exports = { triggerFrontendRevalidation };
