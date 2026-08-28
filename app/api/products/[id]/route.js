const prisma = require("../../../../lib/prisma");
const { getSessionFromRequest, requireRole } = require("../../../../lib/auth");

export async function PATCH(request, { params }) {
  const session = getSessionFromRequest(request);
  if (!requireRole(session, ["ADMIN"])) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }
  const body = await request.json();
  const data = {};
  for (const key of ["name", "description", "imageUrl", "categoryId", "available", "featured", "order"]) {
    if (body[key] !== undefined) data[key] = body[key];
  }
  if (body.price !== undefined) data.price = parseFloat(body.price);

  const product = await prisma.product.update({ where: { id: params.id }, data });
  return Response.json({ product });
}

export async function DELETE(request, { params }) {
  const session = getSessionFromRequest(request);
  if (!requireRole(session, ["ADMIN"])) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }
  const usedInOrders = await prisma.orderItem.count({ where: { productId: params.id } });
  if (usedInOrders > 0) {
    await prisma.product.update({ where: { id: params.id }, data: { available: false } });
    return Response.json({
      ok: true,
      note: "El producto ya tiene pedidos asociados, se desactivo en lugar de eliminarse.",
    });
  }
  await prisma.product.delete({ where: { id: params.id } });
  return Response.json({ ok: true });
}
