import { Hero } from "@/components/hero";

/**
 * Homepage for 42 Reddit.
 * Displays hero section with value prop and featured projects.
 */
export default async function Home() {
  return (
    <main className="flex-grow flex flex-col">
      <Hero />
    </main>
  );
}
