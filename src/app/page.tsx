import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* HERO SECTION */}
      <section className="text-center py-28 px-6">
        <h1 className="text-5xl md:text-6xl font-bold">
          Car Rental Marketplace
        </h1>

        <p className="mt-6 text-gray-400 max-w-2xl mx-auto text-lg">
          Rent cars easily or list your own vehicles.
          A simple, secure and modern car rental system.
        </p>

        {/* MAIN BUTTONS */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 mt-10">
          <Link
            href="/cars"
            className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition"
          >
            🚗 Find Cars
          </Link>

          <Link
            href="/auth/login"
            className="border border-gray-500 px-6 py-3 rounded-lg hover:bg-gray-800 transition"
          >
            Login
          </Link>

          <Link
            href="/auth/register"
            className="bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition"
          >
            Register
          </Link>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="px-6 py-16 bg-zinc-950">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6 text-center">
          <div className="p-6 border border-zinc-800 rounded-xl">
            <h3 className="text-xl font-bold mb-2">
              🚗 Easy Car Rental
            </h3>
            <p className="text-gray-400">
              Browse and rent cars quickly without complexity.
            </p>
          </div>

          <div className="p-6 border border-zinc-800 rounded-xl">
            <h3 className="text-xl font-bold mb-2">
              🔐 Secure System
            </h3>
            <p className="text-gray-400">
              Authentication, KYC and secure document handling.
            </p>
          </div>

          <div className="p-6 border border-zinc-800 rounded-xl">
            <h3 className="text-xl font-bold mb-2">
              🏎️ For Owners
            </h3>
            <p className="text-gray-400">
              List your cars, upload images, manage documents.
            </p>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="text-center py-20 px-6">
        <h2 className="text-3xl font-bold">
          Start renting or listing today
        </h2>

        <p className="text-gray-400 mt-3">
          Join the platform and explore cars instantly.
        </p>

        <Link
          href="/cars"
          className="inline-block mt-6 bg-blue-500 px-6 py-3 rounded-lg hover:bg-blue-600 transition"
        >
          Explore Cars
        </Link>
      </section>
    </div>
  );
}