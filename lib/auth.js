const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-cambiar";
const COOKIE_NAME = "session_token";

function signSession(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, name: user.name, role: user.role },
    JWT_SECRET,
    { expiresIn: "12h" }
  );
}

function verifySession(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

/**
 * Lee y valida la sesion a partir de los headers de cookie de una Request de Next.js (App Router).
 * Devuelve el payload del usuario o null si no hay sesion valida.
 */
function getSessionFromRequest(request) {
  const cookieHeader = request.headers.get("cookie") || "";
  const match = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${COOKIE_NAME}=`));
  if (!match) return null;
  const token = match.split("=")[1];
  return verifySession(token);
}

function requireRole(session, roles) {
  if (!session) return false;
  return roles.includes(session.role);
}

module.exports = {
  COOKIE_NAME,
  signSession,
  verifySession,
  getSessionFromRequest,
  requireRole,
};
