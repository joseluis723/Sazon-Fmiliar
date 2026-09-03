const prisma = require("../../../../../lib/prisma");
const { getSessionFromRequest, requireRole } = require("../../../../../lib/auth");
const { emitOrderEvent } = require("../../../../../lib/socket");

const VALID_METHODS = ["EFECTIVO", "EN_ESTABLECIMIENTO", "ONLINE"];

export async function PATCH(request, { params }) {
  const session = getSessionFromRequest(request);
  if (!requireRole(session, ["ADMIN", "MESERO"])) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const method = VALID_METHODS.includes(body.method) ? body.method : "EFECTIVO";

  const order = await prisma.order.findUnique({ where: { id: params.id } });
  if (!order) {
    return Response.json({ error: "Pedido no encontrado" }, { status: 404 });
  }

  const payment = await prisma.payment.upsert({
    where: { orderId: order.id },
    update: { status: "PAGADO", method, amount: order.total },
    create: { orderId: order.id, status: "PAGADO", method, amount: order.total },
  });

  const fullOrder = await prisma.order.findUnique({
    where: { id: order.id },
    include: { table: true, items: { include: { product: true } }, payment: true },
  });

  emitOrderEvent("order:payment", fullOrder);

  return Response.json({ order: fullOrder, payment });
}
