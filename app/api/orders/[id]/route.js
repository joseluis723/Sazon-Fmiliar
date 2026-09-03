const prisma = require("../../../../lib/prisma");

export async function GET(request, { params }) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
      include: {
      table: true,
      items: { include: { product: true } },
      statusHistory: { orderBy: { createdAt: "asc" } },
     
    },
  });
  if (!order) {
    return Response.json({ error: "Pedido no encontrado" }, { status: 404 });
  }
  return Response.json({ order });
}
