async function pushToGHL(params) {
    const apiKey = process.env.GHL_API_KEY;
    const locationId = process.env.GHL_LOCATION_ID;
    if (!apiKey || !locationId) {
          console.warn("[GHL] Skipped push - GHL_API_KEY or GHL_LOCATION_ID not set");
          return;
    }
    try {
          const res = await fetch("https://services.leadconnectorhq.com/contacts/upsert", {
                  method: "POST",
                  headers: {
                            Authorization: `Bearer ${apiKey}`,
                            Version: "2021-07-28",
                            "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                            locationId,
                            firstName: params.firstName || undefined,
                            email: params.email || undefined,
                            phone: params.phone || undefined,
                            tags: [params.sourceSite],
                            source: "Website Contact Form",
                  }),
          });
          if (!res.ok) {
                  const text = await res.text();
                  console.warn(`[GHL] Push failed (${res.status}): ${text}`);
          } else {
                  console.log(`[GHL] Contact pushed for source: ${params.sourceSite}`);
          }
    } catch (err) {
          console.warn("[GHL] Push error:", err);
    }
}
module.exports = { pushToGHL };
