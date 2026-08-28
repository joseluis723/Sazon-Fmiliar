const prisma = require("../../../lib/prisma");
const { getSessionFromRequest, requireRole } = require("../../../lib/auth");

export async function GET(request) {
  const session = getSessionFromRequest(request);
  if (!requireRole(session, ["ADMIN", "COCINA", "MESERO"])) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }
  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { products: true } } },
  });
  return Response.json({ categories });
}

export async function POST(request) {
  const session = getSessionFromRequest(request);
  if (!requireRole(session, ["ADMIN"])) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }
  const body = await request.json();
  if (!body.name) {
    return Response.json({ error: "El nombre es obligatorio" }, { status: 400 });
  }
  const maxOrder = await prisma.category.count();
  const category = await prisma.category.create({
    data: { name: body.name, order: maxOrder },
  });
  return Response.json({ category }, { status: 201 });
}
