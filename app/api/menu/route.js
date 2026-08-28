const prisma = require("../../../lib/prisma");

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const mesaParam = searchParams.get("mesa");

  let table = null;
  if (mesaParam) {
    const number = parseInt(mesaParam, 10);
    if (!Number.isNaN(number)) {
      table = await prisma.table.findUnique({ where: { number } });
    }
  }

  if (mesaParam && (!table || !table.active)) {
    return Response.json(
      { error: "La mesa indicada no existe o no esta activa. Pide ayuda al personal." },
      { status: 404 }
    );
  }

  const categories = await prisma.category.findMany({
    where: { active: true },
    orderBy: { order: "asc" },
    include: {
      products: {
        orderBy: { order: "asc" },
      },
    },
  });

  return Response.json({ table, categories });
}
