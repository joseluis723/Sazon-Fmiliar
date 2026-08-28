const prisma = require("../../../../lib/prisma");
const { getSessionFromRequest, requireRole } = require("../../../../lib/auth");

export async function PATCH(request, { params }) {
  const session = getSessionFromRequest(request);
  if (!requireRole(session, ["ADMIN"])) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }
  const body = await request.json();
  const category = await prisma.category.update({
    where: { id: params.id },
    data: {
      name: body.name,
      order: body.order,
      active: body.active,
    },
  });
  return Response.json({ category });
}

export async function DELETE(request, { params }) {
  const session = getSessionFromRequest(request);
  if (!requireRole(session, ["ADMIN"])) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }
  const productCount = await prisma.product.count({ where: { categoryId: params.id } });
  if (productCount > 0) {
    return Response.json(
      { error: "No se puede eliminar: la categoria tiene productos. Desactivala en su lugar." },
      { status: 400 }
    );
  }
  await prisma.category.delete({ where: { id: params.id } });
  return Response.json({ ok: true });
}
