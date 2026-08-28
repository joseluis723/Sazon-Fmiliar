const QRCode = require("qrcode");
const prisma = require("../../../../../lib/prisma");
const { getSessionFromRequest, requireRole } = require("../../../../../lib/auth");

export async function GET(request, { params }) {
  const session = getSessionFromRequest(request);
  if (!requireRole(session, ["ADMIN", "MESERO"])) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  const table = await prisma.table.findUnique({ where: { id: params.id } });
  if (!table) {
    return Response.json({ error: "Mesa no encontrada" }, { status: 404 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const url = `${baseUrl}/menu?mesa=${table.number}`;

  const pngBuffer = await QRCode.toBuffer(url, {
    type: "png",
    width: 600,
    margin: 2,
    color: { dark: "#1B1815", light: "#F6F1E4" },
  });

  return new Response(pngBuffer, {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `attachment; filename="qr-mesa-${table.number}.png"`,
    },
  });
}
