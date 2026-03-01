import { Link } from 'react-router-dom';
import { FileText, CornerUpLeft, Package } from 'lucide-react';

const steps = [
  {
    num: 1,
    icon: FileText,
    title: 'REQUEST A QUOTE',
    desc: 'Tell us your product, quantity, size and other details required for the product. Use our contact form or add items from the catalog to your quote cart.',
  },
  {
    num: 2,
    icon: CornerUpLeft,
    title: 'WE RESPOND',
    desc: "Our team reviews your request and sends a detailed quote — typically within 24 hours. We're happy to discuss options.",
  },
  {
    num: 3,
    icon: Package,
    title: 'YOU ORDER',
    desc: 'After confirming product availability with us, delivery will be discussed with you. Quality materials, on time, every time.',
  },
];

export default function HowItWorks() {
  return (
    <section className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-24">
      <div className="how-card max-w-5xl w-full" data-animate="how-card">
        <h2 className="font-display text-4xl font-bold text-center text-card-foreground mb-3">
          How it works
        </h2>
        <p className="text-center text-muted-foreground mb-16 text-base">
          From request to delivery — simple, transparent, and built around your needs.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
          {steps.map((step, i) => (
            <div
              key={step.num}
              className={`flex flex-col items-center text-center px-8 py-6 how-step ${
                i < steps.length - 1 ? 'md:border-r border-border' : ''
              }`}
              data-animate="how-step"
            >
              <div className="step-number mb-6">{step.num}</div>
              <div className="step-icon mb-6">
                <step.icon size={28} strokeWidth={1.5} />
              </div>
              <h3 className="text-sm font-bold tracking-widest text-card-foreground mb-3">
                {step.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-12">
          <Link to="/contact" className="btn-pill inline-block">
            GET STARTED →
          </Link>
        </div>
      </div>

      <div className="trust-bar mt-8" data-animate="trust-bar">
        <span className="text-xs font-bold tracking-widest text-foreground">QUALITY MATERIALS</span>
        <span className="text-muted-foreground">·</span>
        <span className="text-xs font-bold tracking-widest text-foreground">RELIABLE SUPPLY</span>
        <span className="text-muted-foreground">·</span>
        <span className="text-xs font-bold tracking-widest text-foreground">TRUSTED BY INDUSTRY</span>
      </div>
    </section>
  );
}
