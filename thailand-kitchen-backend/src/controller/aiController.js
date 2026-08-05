const asyncHandler = require("../utils/asyncHandler");
const axios = require("axios");

/** Kitchen stock images available in admin + client public folders */
const STOCK_IMAGES = [
  "/blog/blogImage (1).jpg",
  "/blog/blogImage (2).jpg",
  "/blog/blogImage (3).jpg",
  "/products/Kitchen1.png",
  "/products/Kitchen2.png",
  "/products/Kitchen3.png",
  "/products/Kitchen4.png",
  "/products/Kitchen5.png",
  "/products/Kitchen6.png",
];

function extractJson(text) {
  const raw = String(text || "").trim();
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(raw.slice(start, end + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

function titleCase(topic) {
  return String(topic || "")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function hashTopic(topic) {
  const s = String(topic || "");
  let h = 0;
  for (let i = 0; i < s.length; i += 1) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return h;
}

/** Pick a unique-ish set of stock images for cover + sections + gallery */
function pickStockImages(topic, sectionCount) {
  const start = hashTopic(topic) % STOCK_IMAGES.length;
  const pick = (offset) =>
    STOCK_IMAGES[(start + offset) % STOCK_IMAGES.length];

  const cover = pick(0);
  const sections = Array.from({ length: Math.max(sectionCount, 1) }, (_, i) =>
    pick(i + 1)
  );
  const gallery1 = pick(sectionCount + 1);
  const gallery2 = pick(sectionCount + 2);

  return { cover, sections, gallery1, gallery2 };
}

/** Local draft writer when OpenAI is unavailable (quota / network) */
function buildFallbackArticle(topic, brand = "Thailand Kitchen") {
  const varsovia = brand === "Varsovia Design";
  const clean =
    titleCase(topic) ||
    (varsovia
      ? "Timeless Premium Kitchen Design"
      : "Modern Kitchen Design in Thailand");
  const lower = clean.toLowerCase();
  return {
    title: clean,
    category: "Kitchen Design Trends",
    readTime: "6",
    author: brand,
    excerpt: varsovia
      ? `${clean} brings comfort, storage, and refined style together. In this article we explore practical layouts, enduring materials, and finishing details that make everyday living feel effortless.`
      : `${clean} brings comfort, storage, and style together for Thai homes. In this article we explore practical layout ideas, materials that last in humid climates, and finishing details that make everyday cooking feel effortless.`,
    bodySections: [
      {
        title: `What “${clean}” really means at home`,
        content: `A kitchen shaped around your lifestyle starts with honest routines—weekday breakfasts, weekend cooking, and hosting friends. Plan zones for prep, cooking, cleaning, and storage so ${lower} never feels cramped. Leave clear landing space beside the hob and sink, and keep everyday tools within one step of where you use them.`,
        image: "",
      },
      {
        title: "Layout, flow, and smart storage",
        content: `Use a simple work triangle between fridge, hob, and sink, then add deep drawers, tall pantry units, and soft-close hardware. For ${lower}, island seating or a compact breakfast bar can turn the kitchen into the heart of the home without sacrificing circulation.`,
        image: "",
      },
      {
        title: varsovia
          ? "Materials and finishes that endure"
          : "Materials and finishes for Thailand",
        content: varsovia
          ? "Choose quality timber, refined laminates, quartz or porcelain worktops, and durable metal details. Layer warm lighting, keep the colour palette calm, and let one hero surface—stone, wood, or brass—carry the personality of the room."
          : "Choose sealed timber, quality laminates, quartz or porcelain worktops, and metal details that handle heat and humidity. Layer warm lighting, keep the colour palette calm, and let one hero surface—stone, wood, or brass—carry the personality of the room.",
        image: "",
      },
    ],
    highlightTitle: "Designer tip",
    highlightText: `When you design around ${lower}, prioritise how your family moves, cooks, and gathers—beauty follows a layout that already works.`,
    quote:
      "The most beautiful kitchen is the one that quietly fits the way you live every day.",
    quoteAuthor: `${brand} Design Studio`,
  };
}

function toArticleResponse(
  parsed,
  source,
  topic,
  { brand = "Thailand Kitchen", attachStockImages = true } = {}
) {
  const rawSections = Array.isArray(parsed.bodySections)
    ? parsed.bodySections
        .map((s) => ({
          title: String(s?.title || "").trim(),
          content: String(s?.content || "").trim(),
          image: String(s?.image || "").trim(),
        }))
        .filter((s) => s.title || s.content)
    : [];

  const bodySections = rawSections.length
    ? rawSections
    : [
        {
          title: "Overview",
          content: String(parsed.excerpt || ""),
          image: "",
        },
      ];

  const stock = attachStockImages
    ? pickStockImages(topic || parsed.title || "kitchen", bodySections.length)
    : { cover: "", sections: [], gallery1: "", gallery2: "" };

  const withImages = bodySections.map((s, i) => ({
    ...s,
    image: s.image || stock.sections[i] || stock.cover,
  }));

  return {
    success: true,
    source,
    article: {
      title: String(parsed.title || "").trim(),
      category: String(parsed.category || "Kitchen Design Trends").trim(),
      readTime: String(parsed.readTime || "5").replace(/[^\d]/g, "") || "5",
      author: String(parsed.author || brand).trim(),
      excerpt: String(parsed.excerpt || "").trim(),
      bodySections: withImages,
      highlightTitle: String(parsed.highlightTitle || "").trim(),
      highlightText: String(parsed.highlightText || "").trim(),
      quote: String(parsed.quote || "").trim(),
      quoteAuthor: String(parsed.quoteAuthor || "").trim(),
      publishDate: new Date().toISOString().slice(0, 10),
      image: String(parsed.image || "").trim() || stock.cover,
      gallery1: String(parsed.gallery1 || "").trim() || stock.gallery1,
      gallery2: String(parsed.gallery2 || "").trim() || stock.gallery2,
      published: true,
    },
  };
}

function isQuotaOrBillingError(message) {
  const m = String(message || "").toLowerCase();
  return (
    m.includes("quota") ||
    m.includes("billing") ||
    m.includes("insufficient_quota") ||
    m.includes("rate limit") ||
    m.includes("exceeded")
  );
}

const generateBlog = asyncHandler(async (req, res) => {
  const topic = String(req.body.topic || "").trim();
  const isVarsovia = req.params.siteId === "varsovia-kitchen";
  const brand = isVarsovia ? "Varsovia Design" : "Thailand Kitchen";
  const responseOptions = {
    brand,
    attachStockImages: !isVarsovia,
  };
  const promptTopic =
    topic ||
    (isVarsovia
      ? "timeless premium modular kitchen and interior design trends"
      : "modern modular kitchen design trends in Thailand for luxury island homes");

  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    console.warn("[generate-ai] OPENAI_API_KEY missing — using local draft");
    return res.json(
      toArticleResponse(
        buildFallbackArticle(promptTopic, brand),
        "fallback",
        promptTopic,
        responseOptions
      )
    );
  }

  const system = `You are a professional kitchen and interior design blog writer for ${brand}.
Return ONLY valid JSON (no markdown) with this exact shape:
{
  "title": "string",
  "category": "string",
  "readTime": "number as string like 5",
  "author": "string",
  "excerpt": "string 2-3 sentences",
  "bodySections": [
    { "title": "string", "content": "string 2-4 sentences", "image": "" }
  ],
  "highlightTitle": "string",
  "highlightText": "string 1-2 sentences",
  "quote": "string",
  "quoteAuthor": "string"
}
Write in polished English. Keep bodySections length 2 or 3. Leave image fields empty.`;

  const user = `Create a complete blog article about: ${promptTopic}`;

  try {
    const upstream = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini",
        temperature: 0.7,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        timeout: 60000,
      }
    );

    const content = upstream?.data?.choices?.[0]?.message?.content || "";
    const parsed = extractJson(content);
    if (!parsed || !parsed.title) {
      console.warn("[generate-ai] invalid OpenAI JSON — using local draft");
      return res.json(
        toArticleResponse(
          buildFallbackArticle(promptTopic, brand),
          "fallback",
          promptTopic,
          responseOptions
        )
      );
    }

    return res.json(
      toArticleResponse(parsed, "openai", promptTopic, responseOptions)
    );
  } catch (err) {
    const msg =
      err?.response?.data?.error?.message ||
      err?.message ||
      "OpenAI request failed";

    console.warn(
      "[generate-ai]",
      isQuotaOrBillingError(msg) ? "OpenAI quota/billing" : msg,
      "— using local draft"
    );
    return res.json(
      toArticleResponse(
        buildFallbackArticle(promptTopic, brand),
        "fallback",
        promptTopic,
        responseOptions
      )
    );
  }
});

const {
  UPLOAD_ROOT,
  publicUrlFor,
  hasCloudinary,
} = require("../config/upload");
const fs = require("fs");
const path = require("path");

async function uploadBufferToStorage(req, buffer, ext = "png") {
  const dir = path.join(UPLOAD_ROOT, "images");
  fs.mkdirSync(dir, { recursive: true });
  const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;
  const abs = path.join(dir, filename);
  fs.writeFileSync(abs, buffer);

  let url = publicUrlFor(req, abs);
  let storage = "local";
  let publicId = "";

  if (hasCloudinary()) {
    try {
      const cloudinary = require("cloudinary").v2;
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });
      const result = await cloudinary.uploader.upload(abs, {
        folder: "thailand-kitchens/images",
        resource_type: "image",
      });
      url = result.secure_url;
      publicId = result.public_id;
      storage = "cloudinary";
      fs.unlink(abs, () => {});
    } catch (err) {
      console.error("[generate-ai-image] Cloudinary upload failed:", err.message);
    }
  }

  return { url, storage, publicId };
}

function buildImagePrompt({ topic, title, brand }) {
  const subject = String(title || topic || "modern modular kitchen").trim();
  return [
    `Generate a single photorealistic widescreen blog cover photograph for ${brand}.`,
    `Topic: ${subject}.`,
    "Premium modular kitchen and interior design photography,",
    "natural light, elegant materials, 16:9 composition,",
    "no text, no watermark, no logos, no floor-plan diagrams, no illustrations.",
  ].join(" ");
}

function extractGeminiImageBuffer(payload) {
  const parts =
    payload?.candidates?.[0]?.content?.parts ||
    payload?.candidates?.[0]?.content?.Parts ||
    [];

  for (const part of parts) {
    const inline = part.inlineData || part.inline_data;
    if (inline?.data) {
      const mime = String(inline.mimeType || inline.mime_type || "image/png");
      const ext = mime.includes("jpeg") || mime.includes("jpg") ? "jpg" : "png";
      return {
        buffer: Buffer.from(inline.data, "base64"),
        ext,
        mime,
      };
    }
  }

  const blockReason =
    payload?.promptFeedback?.blockReason ||
    payload?.candidates?.[0]?.finishReason ||
    "";
  throw new Error(
    blockReason
      ? `Gemini did not return an image (${blockReason})`
      : "Gemini did not return an image"
  );
}

async function extractOpenAiImageBuffer(payload) {
  const item = payload?.data?.[0];
  if (!item) throw new Error("OpenAI returned no image data");

  if (item.b64_json) {
    return Buffer.from(item.b64_json, "base64");
  }

  if (item.url) {
    const download = await axios.get(item.url, {
      responseType: "arraybuffer",
      timeout: 60000,
    });
    return Buffer.from(download.data);
  }

  throw new Error("OpenAI returned no image data");
}

function buildOpenAiImageBodies(prompt) {
  const preferred =
    process.env.OPENAI_IMAGE_MODEL?.trim() || "gpt-image-1";
  const candidates = [
    preferred,
    "gpt-image-1",
    "dall-e-3",
    "dall-e-2",
  ].filter((model, index, arr) => model && arr.indexOf(model) === index);

  return candidates.map((model) => {
    if (String(model).startsWith("gpt-image")) {
      return {
        model,
        prompt,
        n: 1,
        size: "1536x1024",
      };
    }
    if (model === "dall-e-2") {
      return {
        model,
        prompt,
        n: 1,
        size: "1024x1024",
        response_format: "b64_json",
      };
    }
    return {
      model,
      prompt,
      n: 1,
      size: "1792x1024",
      response_format: "b64_json",
      quality: "standard",
    };
  });
}

async function generateImageWithOpenAI(req, prompt) {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const bodies = buildOpenAiImageBodies(prompt);
  let lastError = "OpenAI image generation failed";

  for (const body of bodies) {
    try {
      let requestBody = { ...body };
      let upstream = await axios.post(
        "https://api.openai.com/v1/images/generations",
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          timeout: 120000,
          validateStatus: () => true,
        }
      );

      const firstMsg = String(upstream?.data?.error?.message || "");
      if (
        upstream.status >= 400 &&
        /unknown parameter:\s*'?response_format'?/i.test(firstMsg) &&
        requestBody.response_format
      ) {
        const { response_format: _drop, ...withoutFormat } = requestBody;
        requestBody = withoutFormat;
        upstream = await axios.post(
          "https://api.openai.com/v1/images/generations",
          requestBody,
          {
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            timeout: 120000,
            validateStatus: () => true,
          }
        );
      }

      if (upstream.status >= 400) {
        lastError =
          upstream?.data?.error?.message ||
          `OpenAI request failed (${upstream.status}) for model ${body.model}`;
        // Try next model when this one is unavailable on the account.
        if (/does not exist|model_not_found|not available|invalid model/i.test(lastError)) {
          continue;
        }
        throw new Error(lastError);
      }

      const buffer = await extractOpenAiImageBuffer(upstream.data);
      const saved = await uploadBufferToStorage(req, buffer, "png");
      return {
        source: "openai",
        image: saved.url,
        storage: saved.storage,
        model: body.model,
      };
    } catch (err) {
      lastError = err?.message || lastError;
      if (/does not exist|model_not_found|not available|invalid model/i.test(lastError)) {
        continue;
      }
      throw err;
    }
  }

  throw new Error(lastError);
}

async function generateImageWithGemini(req, prompt) {
  const apiKey =
    process.env.GEMINI_API_KEY?.trim() ||
    process.env.GOOGLE_API_KEY?.trim() ||
    process.env.GOOGLE_AI_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const model =
    process.env.GEMINI_IMAGE_MODEL?.trim() || "gemini-2.5-flash-image";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    model
  )}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const requestBody = {
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      responseModalities: ["TEXT", "IMAGE"],
      imageConfig: {
        aspectRatio: "16:9",
      },
    },
  };

  let upstream = await axios.post(url, requestBody, {
    headers: { "Content-Type": "application/json" },
    timeout: 120000,
    validateStatus: () => true,
  });

  if (
    upstream.status >= 400 &&
    /imageConfig|aspectRatio|Unknown name/i.test(
      String(upstream?.data?.error?.message || "")
    )
  ) {
    const { imageConfig: _drop, ...generationConfig } = requestBody.generationConfig;
    upstream = await axios.post(
      url,
      { ...requestBody, generationConfig },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 120000,
        validateStatus: () => true,
      }
    );
  }

  if (upstream.status >= 400) {
    throw new Error(
      upstream?.data?.error?.message ||
        upstream?.data?.message ||
        `Gemini request failed (${upstream.status})`
    );
  }

  const extracted = extractGeminiImageBuffer(upstream.data);
  const saved = await uploadBufferToStorage(req, extracted.buffer, extracted.ext);
  return {
    source: "gemini",
    image: saved.url,
    storage: saved.storage,
    model,
  };
}

const generateBlogImage = asyncHandler(async (req, res) => {
  const topic = String(req.body.topic || "").trim();
  const title = String(req.body.title || "").trim();
  const isVarsovia = req.params.siteId === "varsovia-kitchen";
  const brand = isVarsovia ? "Varsovia Design" : "Thailand Kitchen";
  const promptTopic =
    topic ||
    title ||
    (isVarsovia
      ? "timeless premium modular kitchen interior"
      : "modern modular kitchen design in Thailand");

  if (!process.env.OPENAI_API_KEY?.trim()) {
    return res.status(503).json({
      success: false,
      message:
        "OPENAI_API_KEY is not configured. Add it to server/.env and restart the server.",
    });
  }

  const prompt = buildImagePrompt({ topic, title, brand });

  try {
    const result = await generateImageWithOpenAI(req, prompt);
    return res.json({
      success: true,
      source: result.source,
      image: result.image,
      storage: result.storage,
      model: result.model,
      prompt: promptTopic,
    });
  } catch (err) {
    const msg = err?.message || "OpenAI image generation failed";
    console.warn("[generate-ai-image]", msg);
    return res.status(502).json({
      success: false,
      message: msg,
    });
  }
});

module.exports = { generateBlog, generateBlogImage };
