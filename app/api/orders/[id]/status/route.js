const prisma = require("../../../../../lib/prisma");
const { getSessionFromRequest, requireRole } = require("../../../../../lib/auth");
const { emitOrderEvent } = require("../../../../../lib/socket");

const VALID_STATUSES = ["NUEVO", "CONFIRMADO", "EN_PREPARACION", "LISTO", "ENTREGADO", "CANCELADO"];

export async function PATCH(request, { params }) {
  const session = getSessionFromRequest(request);
  if (!requireRole(session, ["ADMIN", "COCINA", "MESERO"])) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  const { status } = await request.json();
  if (!VALID_STATUSES.includes(status)) {
    return Response.json({ error: "Estado invalido" }, { status: 400 });
  }

  const order = await prisma.order.update({
    where: { id: params.id },
    data: {
      status,
      statusHistory: { create: { status, changedBy: session.sub } },
    },
    include: {
      table: true,
      items: { include: { product: true } },
    },
  });

  emitOrderEvent("order:status", order);

  return Response.json({ order });
}
