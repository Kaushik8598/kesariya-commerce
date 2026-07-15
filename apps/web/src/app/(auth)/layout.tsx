export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <section className="hidden bg-zinc-950 lg:flex lg:flex-col lg:justify-between p-12 text-white">
        <div>
          <h1 className="text-3xl font-bold">Kesariya</h1>

          <p className="mt-2 text-zinc-400">Premium Fashion Store</p>
        </div>

        <div>
          <h2 className="text-5xl font-bold leading-tight">
            Wear Confidence.
            <br />
            Wear Kesariya.
          </h2>

          <p className="mt-6 max-w-md text-zinc-400">
            Discover premium fashion crafted with quality, elegance and modern
            design.
          </p>
        </div>
      </section>

      <section className="flex items-center justify-center bg-background p-6">
        {children}
      </section>
    </main>
  );
}
