import { Hero } from "@/components/hero";
import { HomeCTA } from "@/components/home-cta";

export default async function Home() {
  return (
    <main className="flex-grow flex flex-col px-2 sm:px-4 md:px-6 lg:px-8">
      <div className="flex flex-col animate-fade-in">
        <Hero />



        {/* Who Should Join */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full border-y border-border bg-card/30">
          <div className="mb-8">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4 uppercase tracking-wider">
              Who Should <span className="text-accent">Join</span>
            </h2>
          </div>
          <div className="space-y-6">
            <div>
              <p className="text-muted-foreground text-lg mb-4 leading-relaxed">
                Praxis is for students who:
              </p>
              <ul className="space-y-2 text-muted-foreground ml-6">
                <li className="flex items-start">
                  <span className="text-primary mr-2">▸</span>
                  <span>Want to build systems, not just features</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">▸</span>
                  <span>Can accept criticism and review</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">▸</span>
                  <span>Prefer long-term learning over fast validation</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">▸</span>
                  <span>Are ready to be accountable for their work</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 border-t border-border">
              <p className="text-accent text-xl font-bold uppercase tracking-wider">
                It is not for everyone — and that's intentional.
              </p>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <HomeCTA />
      </div>
    </main>
  );
}
