"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthGuard({ roles, children }) {
  const router = useRouter();
  const [user, setUser] = useState(undefined); // undefined = cargando

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (!data.user || (roles && !roles.includes(data.user.role))) {
          router.replace("/login");
        } else {
          setUser(data.user);
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (user === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-ink/50">Verificando sesion...</p>
      </div>
    );
  }

  return children(user);
}
