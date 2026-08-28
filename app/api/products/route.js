const prisma = require("../../../lib/prisma");
const { getSessionFromRequest, requireRole } = require("../../../lib/auth");

export async function GET(request) {
  const session = getSessionFromRequest(request);
  if (!requireRole(session, ["ADMIN", "COCINA", "MESERO"])) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }
  const products = await prisma.product.findMany({
    orderBy: [{ categoryId: "asc" }, { order: "asc" }],
    include: { category: true },
  });
  return Response.json({ products });
}

export async function POST(request) {
  const session = getSessionFromRequest(request);
  if (!requireRole(session, ["ADMIN"])) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }
  const body = await request.json();
  if (!body.name || !body.categoryId || body.price == null) {
    return Response.json({ error: "Nombre, categoria y precio son obligatorios" }, { status: 400 });
  }
  const maxOrder = await prisma.product.count({ where: { categoryId: body.categoryId } });
  const product = await prisma.product.create({
    data: {
      name: body.name,
      description: body.description || null,
      price: parseFloat(body.price),
      imageUrl: body.imageUrl || null,
      categoryId: body.categoryId,
      available: body.available ?? true,
      featured: body.featured ?? false,
      order: maxOrder,
    },
  });
  return Response.json({ product }, { status: 201 });
}
