const prisma = require("../../../../lib/prisma");
const { getSessionFromRequest, requireRole } = require("../../../../lib/auth");

export async function PATCH(request, { params }) {
  const session = getSessionFromRequest(request);
  if (!requireRole(session, ["ADMIN"])) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }
  const body = await request.json();
  const data = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.active !== undefined) data.active = body.active;
  if (body.number !== undefined) data.number = parseInt(body.number, 10);
  const table = await prisma.table.update({ where: { id: params.id }, data });
  return Response.json({ table });
}

export async function DELETE(request, { params }) {
  const session = getSessionFromRequest(request);
  if (!requireRole(session, ["ADMIN"])) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }
  const orderCount = await prisma.order.count({ where: { tableId: params.id } });
  if (orderCount > 0) {
    await prisma.table.update({ where: { id: params.id }, data: { active: false } });
    return Response.json({ ok: true, note: "La mesa tiene pedidos asociados; se desactivo en lugar de eliminarse." });
  }
  await prisma.table.delete({ where: { id: params.id } });
  return Response.json({ ok: true });
}
