const prisma = require("../../../lib/prisma");
const { getSessionFromRequest, requireRole } = require("../../../lib/auth");

export async function GET(request) {
  const session = getSessionFromRequest(request);
  if (!requireRole(session, ["ADMIN", "COCINA", "MESERO"])) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }
  const tables = await prisma.table.findMany({ orderBy: { number: "asc" } });
  return Response.json({ tables });
}

export async function POST(request) {
  const session = getSessionFromRequest(request);
  if (!requireRole(session, ["ADMIN"])) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }
  const body = await request.json();
  if (!body.number) {
    return Response.json({ error: "El numero de mesa es obligatorio" }, { status: 400 });
  }
  const existing = await prisma.table.findUnique({ where: { number: parseInt(body.number, 10) } });
  if (existing) {
    return Response.json({ error: "Ya existe una mesa con ese numero" }, { status: 409 });
  }
  const table = await prisma.table.create({
    data: { number: parseInt(body.number, 10), name: body.name || null },
  });
  return Response.json({ table }, { status: 201 });
}
