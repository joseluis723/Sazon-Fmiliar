const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");
const { setIO } = require("./lib/socket");

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(httpServer, {
    path: "/api/socket",
  });

  io.on("connection", (socket) => {
    // El cliente se une a la sala de su mesa para recibir actualizaciones de SU pedido
    socket.on("join:mesa", (tableId) => {
      if (tableId) socket.join(`mesa:${tableId}`);
    });

    // El personal (cocina/admin/mesero) se une a la sala "staff" para ver todos los pedidos nuevos
    socket.on("join:staff", () => {
      socket.join("staff");
    });
  });

  setIO(io);

  httpServer.listen(port, () => {
    console.log(`> Servidor listo en http://${hostname}:${port}`);
  });
});
