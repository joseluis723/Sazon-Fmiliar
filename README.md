# Restaurante QR — Sistema de pedidos por codigo QR

Sistema web para que los clientes de un restaurante escaneen el codigo QR de su
mesa, vean el menu, arme su pedido desde el celular y lo envien directo a
cocina, sin pedir la carta fisica ni llamar a un mesero. Incluye panel de
cocina en tiempo real, panel administrativo (menu, mesas, pedidos, dashboard)
y generacion/descarga de codigos QR por mesa.

## Stack tecnico

- **Frontend:** Next.js 14 (App Router) + React 18 + Tailwind CSS
- **Backend:** API Routes de Next.js (Node.js) sobre un servidor HTTP propio (`server.js`)
- **Base de datos:** Prisma ORM. Viene configurado con **SQLite** para que el
  proyecto arranque sin instalar nada mas; para produccion se recomienda
  **PostgreSQL** (ver seccion de despliegue).
- **Tiempo real:** Socket.io (pedidos nuevos y cambios de estado se ven al
  instante en cocina, admin y en la pantalla del cliente, sin recargar).
- **Autenticacion:** JWT en cookie httpOnly (sin librerias externas de sesiones).
- **QR:** libreria `qrcode` (PNG individual) y `pdfkit` (PDF con todos los QR listos para imprimir).

## Estructura de carpetas

```
restaurant-qr/
├── app/
│   ├── menu/              # Pagina del cliente (/menu?mesa=1)
│   ├── pedido/[id]/       # Estado del pedido en tiempo real
│   ├── login/             # Login del personal
│   ├── admin/             # Dashboard, menu, mesas, pedidos (rol ADMIN)
│   ├── cocina/            # Panel de cocina (rol ADMIN o COCINA)
│   └── api/               # Backend: auth, menu, products, categories,
│                           # tables (+ QR), orders (+ status), dashboard
├── components/            # Componentes de UI reutilizables
├── lib/                   # Prisma client, auth (JWT), socket helper
├── prisma/
│   ├── schema.prisma      # Modelo de datos completo
│   └── seed.js            # Datos de ejemplo (mesas, menu, usuarios, pedidos)
└── server.js               # Servidor Node + Socket.io
```

## Modelo de datos

`User` (con `Role`: ADMIN / COCINA / MESERO), `Table` (con token de QR),
`Category`, `Product`, `Customer`, `Order`, `OrderItem`, `OrderStatusHistory`,
`Payment` (con `PaymentMethod` y `PaymentStatus`). Ver `prisma/schema.prisma`
para las relaciones completas.

## Instalacion (desarrollo)

Requisitos: Node.js 18 o superior.

```bash
cd restaurant-qr
npm install
cp .env.example .env
npx prisma migrate dev --name init
npm run prisma:seed
npm run dev
```

Esto levanta el servidor en `http://localhost:3000`.

- **Cliente (QR de ejemplo):** `http://localhost:3000/menu?mesa=1` (mesas 1 a 5 ya existen)
- **Panel del personal:** `http://localhost:3000/login`

### Usuarios de prueba (contrasena para todos: `password123`)

| Rol   | Correo                    |
|-------|---------------------------|
| Admin | admin@restaurante.com     |
| Cocina| cocina@restaurante.com    |
| Mesero| mesero@restaurante.com    |

## Variables de entorno

Ver `.env.example`. Las mas importantes:

- `DATABASE_URL`: cadena de conexion a la base de datos.
- `JWT_SECRET`: clave para firmar las sesiones. **Cambiala en produccion.**
- `NEXT_PUBLIC_BASE_URL`: URL publica del sitio, se usa para generar el
  contenido de los codigos QR (`https://tu-dominio.com/menu?mesa=1`).
- `PORT`: puerto del servidor (por defecto 3000).

## Flujo del sistema

**Cliente:** escanea QR → `/menu?mesa=N` identifica la mesa automaticamente →
elige productos → carrito con notas por producto → pantalla de confirmacion →
`POST /api/orders` → pedido creado y visible al instante en cocina/admin →
el cliente ve el estado de su pedido en tiempo real en `/pedido/[id]`.

**Cocina:** recibe el pedido por Socket.io (aviso visual + sonido) → "Aceptar
pedido" → "En preparacion" → "Pedido listo". Cada cambio se refleja de
inmediato en la pantalla del cliente.

**Administrador:** gestiona categorias/productos (`/admin/menu`), mesas y QR
(`/admin/mesas`), revisa y filtra pedidos (`/admin/pedidos`), y ve ventas del
dia y productos mas vendidos (`/admin`).

## Generacion de codigos QR

Desde `/admin/mesas`:

- **Crear/editar/desactivar mesas.**
- **Descargar QR individual (PNG)** por mesa.
- **Descargar todos los QR en un solo PDF imprimible** (boton en la parte superior).

Cada QR apunta a `NEXT_PUBLIC_BASE_URL/menu?mesa=<numero>`. Si cambias de
dominio en produccion, actualiza esa variable antes de reimprimir los QR.

## Pasar a produccion con PostgreSQL

1. Crea una base de datos PostgreSQL (por ejemplo en Railway, Render, Supabase o un servidor propio).
2. En `prisma/schema.prisma`, cambia:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
3. En `.env`, define `DATABASE_URL="postgresql://usuario:password@host:5432/db"`.
4. Ejecuta `npx prisma migrate deploy` y `npm run prisma:seed` (opcional, solo si quieres datos de ejemplo).
5. Define `JWT_SECRET` con un valor largo y aleatorio, y `NEXT_PUBLIC_BASE_URL` con tu dominio real.
6. Compila y levanta el servidor:
   ```bash
   npm run build
   npm start
   ```
7. Pon el proceso detras de un proxy HTTPS (Nginx, Caddy, o el balanceador del proveedor que uses) y ejecutalo con un gestor de procesos (PM2, systemd, o el propio del proveedor).

Nota: como el proyecto usa un servidor Node personalizado (`server.js`) para
soportar Socket.io, el despliegue debe hacerse en una plataforma que permita
procesos Node de larga duracion (VPS, Railway, Render, Fly.io, etc.), no en
un entorno serverless puro.

## Pagos

La base de datos ya incluye el modelo `Payment` con `method` (efectivo, en el
establecimiento, online) y `status`. Por ahora el sistema registra el pedido
sin cobrar en linea; cuando quieras sumar una pasarela (Stripe, MercadoPago,
etc.), el lugar natural es crear el `Payment` al confirmar el pedido y
actualizar su `status` desde el webhook de la pasarela.

## Extender el sistema

- **Roles:** la logica de permisos esta centralizada en `lib/auth.js`
  (`requireRole`) y se revisa en cada API route.
- **Tiempo real:** cualquier evento nuevo se agrega en `lib/socket.js`
  (`emitOrderEvent`) y se escucha en el cliente con `socket.io-client`.
- **Nuevas categorias/productos:** completamente administrables desde
  `/admin/menu`, no requieren tocar codigo.
