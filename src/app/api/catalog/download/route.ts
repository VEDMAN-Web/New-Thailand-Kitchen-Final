import { readdir } from "fs/promises";
import path from "path";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import { catalogFiles } from "../../../../component/catlog/catlogData";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const COOKIE = "tk_catalog_access";

async function findPdfFile(preferredName: string) {
  const safeName = path.basename(preferredName);
  // Scope FS roots so Turbopack does not NFT-trace the whole project
  const privateCatalogues = path.join(
    /*turbopackIgnore: true*/ process.cwd(),
    "private",
    "catalogues"
  );
  const publicCatlog = path.join(
    /*turbopackIgnore: true*/ process.cwd(),
    "public",
    "catlog"
  );
  const candidates = [
    path.join(privateCatalogues, safeName),
    path.join(publicCatlog, safeName),
    path.join(publicCatlog, "catalogue.pdf"),
    path.join(publicCatlog, "catalog.pdf"),
  ];

  for (const filePath of candidates) {
    try {
      await fs.access(filePath);
      return filePath;
    } catch {
      /* try next */
    }
  }

  for (const dir of [privateCatalogues, publicCatlog]) {
    try {
      const files = await readdir(dir);
      const pdf = files.find((f) => f.toLowerCase().endsWith(".pdf"));
      if (pdf) return path.join(dir, pdf);
    } catch {
      /* try next dir */
    }
  }

  return null;
}

export async function GET(request: NextRequest) {
  const jar = await cookies();
  const unlocked = jar.get(COOKIE)?.value === "1";

  if (!unlocked) {
    return NextResponse.json(
      {
        success: false,
        message: "Please fill the contact form to download the catalogue.",
      },
      { status: 403 }
    );
  }

  const id = request.nextUrl.searchParams.get("id") || "1";
  const item = catalogFiles.find((f) => String(f.id) === id) ?? catalogFiles[0];

  if (!item) {
    return NextResponse.json(
      { success: false, message: "Catalogue not found." },
      { status: 404 }
    );
  }

  const filePath = await findPdfFile(item.pdf);

  if (!filePath) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Catalogue PDF not found. Add catalogue.pdf to client/public/catlog/ folder.",
      },
      { status: 404 }
    );
  }

  const file = await fs.readFile(filePath);
  const filename = item.downloadName || path.basename(filePath);

  return new NextResponse(file, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
