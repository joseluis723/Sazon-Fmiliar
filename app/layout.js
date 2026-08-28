import "./globals.css";

export const metadata = {
  title: "Restaurante QR - Pide desde tu mesa",
  description: "Escanea, elige y pide desde tu telefono.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
