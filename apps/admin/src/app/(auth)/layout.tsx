export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--background)",
        padding: 20,
      }}
    >
      {/* Background grid pattern */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage: `
            linear-gradient(var(--border-muted) 1px, transparent 1px),
            linear-gradient(90deg, var(--border-muted) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
          opacity: 0.4,
          pointerEvents: "none",
        }}
      />
      {/* Radial gradient overlay */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "radial-gradient(ellipse at center, transparent 30%, var(--background) 80%)",
          pointerEvents: "none",
        }}
      />
      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 420 }}>
        {children}
      </div>
    </div>
  );
}
