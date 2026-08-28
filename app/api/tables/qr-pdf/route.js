const QRCode = require("qrcode");
const PDFDocument = require("pdfkit");
const prisma = require("../../../../lib/prisma");
const { getSessionFromRequest, requireRole } = require("../../../../lib/auth");

export async function GET(request) {
  const session = getSessionFromRequest(request);
  if (!requireRole(session, ["ADMIN", "MESERO"])) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  const tables = await prisma.table.findMany({ where: { active: true }, orderBy: { number: "asc" } });
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  const doc = new PDFDocument({ size: "A4", margin: 40 });
  const chunks = [];
  doc.on("data", (chunk) => chunks.push(chunk));

  const finished = new Promise((resolve) => doc.on("end", resolve));

  const perRow = 2;
  const cellWidth = 260;
  const cellHeight = 320;
  let col = 0;
  let row = 0;

  for (const table of tables) {
    const url = `${baseUrl}/menu?mesa=${table.number}`;
    const qrDataUrl = await QRCode.toDataURL(url, { width: 400, margin: 1 });
    const base64 = qrDataUrl.split(",")[1];
    const imgBuffer = Buffer.from(base64, "base64");

    const x = 40 + col * cellWidth;
    const y = 40 + row * cellHeight;

    doc.roundedRect(x, y, cellWidth - 20, cellHeight - 20, 8).stroke("#1B1815");
    doc
      .fontSize(18)
      .fillColor("#1B1815")
      .text(table.name || `Mesa ${table.number}`, x, y + 14, { width: cellWidth - 40, align: "center" });
    doc.image(imgBuffer, x + (cellWidth - 20 - 180) / 2, y + 45, { width: 180, height: 180 });
    doc
      .fontSize(10)
      .fillColor("#555")
      .text("Escanea para ver el menu y pedir", x, y + 235, { width: cellWidth - 40, align: "center" });

    col++;
    if (col >= perRow) {
      col = 0;
      row++;
      if (row >= 2) {
        row = 0;
        doc.addPage();
      }
    }
  }

  doc.end();
  await finished;
  const pdfBuffer = Buffer.concat(chunks);

  return new Response(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="qrs-mesas.pdf"`,
    },
  });
}
