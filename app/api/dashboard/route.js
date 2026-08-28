const prisma = require("../../../lib/prisma");
const { getSessionFromRequest, requireRole } = require("../../../lib/auth");

export async function GET(request) {
  const session = getSessionFromRequest(request);
  if (!requireRole(session, ["ADMIN"])) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const todaysOrders = await prisma.order.findMany({
    where: { createdAt: { gte: startOfDay }, status: { not: "CANCELADO" } },
    include: { items: { include: { product: true } } },
  });

  const ventasHoy = todaysOrders.reduce((sum, o) => sum + o.total, 0);
  const cantidadPedidos = todaysOrders.length;
  const pendientes = todaysOrders.filter((o) =>
    ["NUEVO", "CONFIRMADO", "EN_PREPARACION"].includes(o.status)
  ).length;
  const completados = todaysOrders.filter((o) => o.status === "ENTREGADO").length;

  const productCounts = new Map();
  for (const order of todaysOrders) {
    for (const item of order.items) {
      const key = item.product.name;
      productCounts.set(key, (productCounts.get(key) || 0) + item.quantity);
    }
  }
  const productosMasVendidos = [...productCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, cantidad]) => ({ name, cantidad }));

  const mesasOcupadas = await prisma.order.groupBy({
    by: ["tableId"],
    where: { status: { in: ["NUEVO", "CONFIRMADO", "EN_PREPARACION", "LISTO"] } },
  });

  return Response.json({
    ventasHoy,
    cantidadPedidos,
    pendientes,
    completados,
    productosMasVendidos,
    mesasOcupadas: mesasOcupadas.length,
  });
}
