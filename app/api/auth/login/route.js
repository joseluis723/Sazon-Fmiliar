const bcrypt = require("bcryptjs");
const prisma = require("../../../../lib/prisma");
const { signSession, COOKIE_NAME } = require("../../../../lib/auth");

export async function POST(request) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return Response.json({ error: "Email y contrasena son obligatorios" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.active) {
    return Response.json({ error: "Credenciales invalidas" }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return Response.json({ error: "Credenciales invalidas" }, { status: 401 });
  }

  const token = signSession(user);

  const res = Response.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
  res.headers.set(
    "Set-Cookie",
    `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 12}`
  );
  return res;
}
