const prisma = require("../../../lib/prisma");
const { getSessionFromRequest, requireRole } = require("../../../lib/auth");
const { emitOrderEvent } = require("../../../lib/socket");

const orderInclude = {
  table: true,
  items: { include: { product: true } },
};

// POST /api/orders - el cliente confirma su pedido desde /menu?mesa=X (sin necesidad de cuenta)
export async function POST(request) {
  const body = await request.json();
  const { tableNumber, items, notes } = body;

  if (!tableNumber || !Array.isArray(items) || items.length === 0) {
    return Response.json({ error: "Faltan datos del pedido" }, { status: 400 });
  }

  const table = await prisma.table.findUnique({ where: { number: parseInt(tableNumber, 10) } });
  if (!table || !table.active) {
    return Response.json({ error: "La mesa no existe o no esta activa" }, { status: 404 });
  }

  const productIds = items.map((it) => it.productId);
  const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
  const productMap = new Map(products.map((p) => [p.id, p]));

  for (const it of items) {
    const product = productMap.get(it.productId);
    if (!product || !product.available) {
      return Response.json(
        { error: `El producto "${product?.name || it.productId}" ya no esta disponible. Actualiza tu carrito.` },
        { status: 409 }
      );
    }
  }

  // Proteccion basica contra pedidos duplicados: mismo total y misma mesa en los ultimos 15 segundos
  const subtotal = items.reduce((sum, it) => sum + productMap.get(it.productId).price * it.quantity, 0);
  const fifteenSecondsAgo = new Date(Date.now() - 15000);
  const recentDuplicate = await prisma.order.findFirst({
    where: { tableId: table.id, subtotal, createdAt: { gte: fifteenSecondsAgo } },
    orderBy: { createdAt: "desc" },
  });
  if (recentDuplicate) {
    return Response.json({ order: await prisma.order.findUnique({ where: { id: recentDuplicate.id }, include: orderInclude }) });
  }

  const order = await prisma.order.create({
    data: {
      tableId: table.id,
      notes: notes || null,
      subtotal,
      total: subtotal,
      status: "NUEVO",
      items: {
        create: items.map((it) => ({
          productId: it.productId,
          quantity: it.quantity,
          unitPrice: productMap.get(it.productId).price,
          notes: it.notes || null,
        })),
      },
      statusHistory: { create: { status: "NUEVO" } },
    },
    include: orderInclude,
  });

  emitOrderEvent("order:new", order);

  return Response.json({ order }, { status: 201 });
}

// GET /api/orders - panel administrativo / cocina, con filtros
export async function GET(request) {
  const session = getSessionFromRequest(request);
  if (!requireRole(session, ["ADMIN", "COCINA", "MESERO"])) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const tableId = searchParams.get("tableId");
  const number = searchParams.get("number");
  const date = searchParams.get("date"); // YYYY-MM-DD

  const where = {};
  if (status) where.status = status;
  if (tableId) where.tableId = tableId;
  if (number) where.number = parseInt(number, 10);
  if (date) {
    const start = new Date(`${date}T00:00:00`);
    const end = new Date(`${date}T23:59:59.999`);
    where.createdAt = { gte: start, lte: end };
  }

  const orders = await prisma.order.findMany({
    where,
    include: orderInclude,
    orderBy: { createdAt: "desc" },
  });

  return Response.json({ orders });
}
