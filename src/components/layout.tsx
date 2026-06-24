// import RouteGuard from "./RouteGuard";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* <RouteGuard>{children}</RouteGuard> */}
        {children}
      </body>
    </html>
  );
}