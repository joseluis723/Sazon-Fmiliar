const { getSessionFromRequest } = require("../../../../lib/auth");

export async function GET(request) {
  const session = getSessionFromRequest(request);
  if (!session) {
    return Response.json({ user: null }, { status: 200 });
  }
  return Response.json({
    user: { id: session.sub, name: session.name, email: session.email, role: session.role },
  });
}
