const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Borrando datos previos...");
  await prisma.orderStatusHistory.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.table.deleteMany();
  await prisma.user.deleteMany();

  console.log("Creando usuarios de prueba...");
  const passwordHash = await bcrypt.hash("password123", 10);
  const [admin, cocina, mesero] = await Promise.all([
    prisma.user.create({
      data: { name: "Ana Administradora", email: "admin@restaurante.com", passwordHash, role: "ADMIN" },
    }),
    prisma.user.create({
      data: { name: "Carlos Cocina", email: "cocina@restaurante.com", passwordHash, role: "COCINA" },
    }),
    prisma.user.create({
      data: { name: "Mario Mesero", email: "mesero@restaurante.com", passwordHash, role: "MESERO" },
    }),
  ]);

  console.log("Creando mesas...");
  const tables = await Promise.all(
    [1, 2, 3, 4, 5].map((number) =>
      prisma.table.create({ data: { number, name: `Mesa ${number}` } })
    )
  );

  console.log("Creando categorias y productos...");
  const categoriesData = [
    {
      name: "Entradas",
      products: [
        { name: "Tequenos de queso", description: "6 unidades con salsa de guayaba", price: 22 },
        { name: "Alitas BBQ", description: "8 alitas banadas en salsa BBQ", price: 32 },
      ],
    },
    {
      name: "Hamburguesas",
      products: [
        { name: "Hamburguesa Clasica", description: "Carne 150g, queso cheddar, lechuga, tomate", price: 38, featured: true },
        { name: "Hamburguesa BBQ Bacon", description: "Carne 150g, bacon, aros de cebolla, salsa BBQ", price: 45 },
        { name: "Hamburguesa Vegetariana", description: "Medallon de garbanzo y vegetales grillados", price: 35 },
      ],
    },
    {
      name: "Pizzas",
      products: [
        { name: "Pizza Margarita", description: "Salsa de tomate, mozzarella, albahaca", price: 48 },
        { name: "Pizza Pepperoni", description: "Salsa de tomate, mozzarella, pepperoni", price: 52, featured: true },
        { name: "Pizza Cuatro Quesos", description: "Mozzarella, parmesano, gorgonzola, provolone", price: 55 },
      ],
    },
    {
      name: "Pollo",
      products: [
        { name: "Pollo a la Broaster", description: "1/4 de pollo con papas fritas", price: 40 },
        { name: "Alitas Picantes", description: "8 alitas con salsa picante", price: 34 },
      ],
    },
    {
      name: "Carnes",
      products: [
        { name: "Lomo Saltado", description: "Lomo fino salteado con papas y arroz", price: 58 },
        { name: "Churrasco a la Parrilla", description: "300g con guarnicion a eleccion", price: 65, available: false },
      ],
    },
    {
      name: "Ensaladas",
      products: [
        { name: "Ensalada Cesar", description: "Lechuga, pollo grillado, crutones, aderezo cesar", price: 30 },
      ],
    },
    {
      name: "Bebidas",
      products: [
        { name: "Coca-Cola 500ml", description: null, price: 8 },
        { name: "Limonada Natural", description: "Jarra de 1 litro", price: 15 },
        { name: "Agua Mineral", description: null, price: 6 },
      ],
    },
    {
      name: "Postres",
      products: [
        { name: "Tres Leches", description: "Porcion individual", price: 16 },
        { name: "Volcan de Chocolate", description: "Con helado de vainilla", price: 18, featured: true },
      ],
    },
    {
      name: "Promociones",
      products: [
        { name: "Combo Familiar", description: "2 hamburguesas + papas + 2 bebidas", price: 75, featured: true },
      ],
    },
  ];

  const allProducts = [];
  for (let i = 0; i < categoriesData.length; i++) {
    const cat = categoriesData[i];
    const category = await prisma.category.create({ data: { name: cat.name, order: i } });
    for (let j = 0; j < cat.products.length; j++) {
      const p = cat.products[j];
      const product = await prisma.product.create({
        data: {
          name: p.name,
          description: p.description ?? null,
          price: p.price,
          available: p.available ?? true,
          featured: p.featured ?? false,
          order: j,
          categoryId: category.id,
        },
      });
      allProducts.push(product);
    }
  }

  console.log("Creando pedidos de prueba...");
  const burguer = allProducts.find((p) => p.name === "Hamburguesa Clasica");
  const papas = allProducts.find((p) => p.name === "Pollo a la Broaster");
  const coca = allProducts.find((p) => p.name === "Coca-Cola 500ml");
  const pizza = allProducts.find((p) => p.name === "Pizza Pepperoni");

  async function createOrder(tableIndex, status, items, notes) {
    const subtotal = items.reduce((sum, it) => sum + it.unitPrice * it.quantity, 0);
    const order = await prisma.order.create({
      data: {
        tableId: tables[tableIndex].id,
        status,
        notes: notes ?? null,
        subtotal,
        total: subtotal,
        items: { create: items },
        statusHistory: { create: { status } },
      },
    });
    return order;
  }

  await createOrder(0, "NUEVO", [
    { productId: burguer.id, quantity: 2, unitPrice: burguer.price, notes: "Sin cebolla" },
    { productId: coca.id, quantity: 2, unitPrice: coca.price },
  ], "Sin cebolla en las hamburguesas");

  await createOrder(1, "EN_PREPARACION", [
    { productId: pizza.id, quantity: 1, unitPrice: pizza.price },
  ]);

  await createOrder(2, "LISTO", [
    { productId: papas.id, quantity: 1, unitPrice: papas.price },
    { productId: coca.id, quantity: 1, unitPrice: coca.price },
  ]);

  await createOrder(3, "ENTREGADO", [
    { productId: burguer.id, quantity: 1, unitPrice: burguer.price },
  ]);

  console.log("Listo. Usuarios de prueba (password: password123):");
  console.log(` - admin@restaurante.com (ADMIN)`);
  console.log(` - cocina@restaurante.com (COCINA)`);
  console.log(` - mesero@restaurante.com (MESERO)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
