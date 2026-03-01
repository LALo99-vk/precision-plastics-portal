import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plane, Heart, Cpu, Car, Fuel, Zap, UtensilsCrossed, FlaskConical, Sun, Pill, Wrench, Building2, ShieldCheck, Award, BadgeCheck, MapPin, Phone, Mail } from 'lucide-react';
import CinematicNavbar from '@/components/CinematicNavbar';
import Footer from '@/components/layout/Footer';
import aboutHero from '@/assets/about-hero.jpg';
import aboutCraft from '@/assets/about-craftsmanship.jpg';

const INDUSTRIES = [
  { name: 'Aerospace', icon: Plane },
  { name: 'Medical', icon: Heart },
  { name: 'Semiconductor', icon: Cpu },
  { name: 'Automotive', icon: Car },
  { name: 'Oil & Gas', icon: Fuel },
  { name: 'Electronics', icon: Zap },
  { name: 'Food & Beverage', icon: UtensilsCrossed },
  { name: 'Chemical', icon: FlaskConical },
  { name: 'Renewable Energy', icon: Sun },
  { name: 'Biopharma', icon: Pill },
  { name: 'Mechanical', icon: Wrench },
  { name: 'Building', icon: Building2 },
];

const CERTIFICATIONS = [
  { title: 'ISO 9001:2015', desc: 'Quality Management System' },
  { title: 'ISO 14001', desc: 'Environmental Management' },
  { title: 'REACH Compliant', desc: 'EU Chemical Safety' },
  { title: 'RoHS Certified', desc: 'Hazardous Substances Directive' },
];

export default function About() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="bg-background min-h-screen">
      <CinematicNavbar />

      {/* HERO */}
      <section className="relative h-[70vh] min-h-[500px] overflow-hidden">
        <img
          src={aboutHero}
          alt="Nyloking & Co. engineering plastics"
          fetchpriority="high"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="relative z-10 h-full flex flex-col items-center justify-end pb-16 px-6 text-center">
          <p className="text-xs font-semibold tracking-[0.4em] text-foreground/60 uppercase mb-4">
            EST. 1992 — BENGALURU, INDIA
          </p>
          <h1 className="font-display text-5xl md:text-7xl font-bold text-foreground mb-4">
            Our Story
          </h1>
          <p className="max-w-2xl text-muted-foreground text-base md:text-lg leading-relaxed">
            Leading the industry in high-performance engineering plastics and composite materials since 1992
          </p>
        </div>
      </section>

      {/* STORY */}
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-xs font-semibold tracking-[0.3em] text-muted-foreground uppercase mb-4">
              THE BEGINNING
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-8 leading-tight">
              Three decades of engineering excellence
            </h2>
            <div className="space-y-5 text-muted-foreground leading-relaxed">
              <p>
                Established in the year 1992, we, <strong className="text-foreground">'Nyloking & Co.,'</strong>, are recognized retailers and wholesalers of all kinds of Engineering Plastic products. Founded with a vision to revolutionize the engineering plastics industry, Nyloking & Co., has been at the forefront of innovation for decades.
              </p>
              <p>
                We specialize in providing high-performance thermoplastics and composite materials that meet the most stringent requirements across diverse industries. Our commitment to excellence, combined with deep technical expertise, has made us a trusted partner for engineers, designers, and manufacturers worldwide.
              </p>
              <p>
                From aerospace components to medical devices, from semiconductor equipment to automotive applications, we deliver materials that push the boundaries of what's possible.
              </p>
            </div>
          </div>
          <div className="relative">
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <img src={aboutCraft} alt="Precision engineered plastic components" className="w-full h-auto" />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-card rounded-xl shadow-xl p-6 border border-border">
              <p className="font-display text-4xl font-bold text-foreground">30+</p>
              <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase mt-1">Years of Trust</p>
            </div>
          </div>
        </div>
      </section>

      {/* QUALITY COMMITMENT */}
      <section className="py-20 px-6 bg-card">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-semibold tracking-[0.3em] text-muted-foreground uppercase mb-4">
            OUR PROMISE
          </p>
          <blockquote className="font-display text-2xl md:text-3xl font-bold text-foreground leading-snug italic">
            "At Nyloking & Co., we understand that every application is unique. That's why we check our range of Engineering plastics and its products on various quality parameters in order to ensure flawless delivery."
          </blockquote>
          <div className="mt-8 flex items-center justify-center gap-6 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            <span>Engineering</span>
            <span className="text-border">·</span>
            <span>Chemical</span>
            <span className="text-border">·</span>
            <span>Electrical</span>
            <span className="text-border">·</span>
            <span>Electronics</span>
            <span className="text-border">·</span>
            <span>Aeronautical</span>
          </div>
        </div>
      </section>

      {/* MISSION & VISION */}
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold tracking-[0.3em] text-muted-foreground uppercase mb-4">
              PURPOSE
            </p>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground">
              What drives us forward
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-card rounded-3xl p-10 md:p-14 shadow-lg border border-border">
              <div className="step-icon mb-8">
                <ShieldCheck size={28} className="text-accent" />
              </div>
              <h3 className="font-display text-2xl font-bold text-foreground mb-4">Our Mission</h3>
              <p className="text-muted-foreground leading-relaxed">
                To provide world-class engineering plastics and composite materials that enable our customers to innovate, excel, and achieve their most ambitious engineering goals. We are committed to quality, reliability, and exceptional customer service in everything we do.
              </p>
            </div>
            <div className="bg-foreground rounded-3xl p-10 md:p-14 shadow-lg">
              <div className="w-16 h-16 bg-accent/20 rounded-2xl flex items-center justify-center mb-8">
                <Award size={28} className="text-accent" />
              </div>
              <h3 className="font-display text-2xl font-bold text-accent mb-4">Our Vision</h3>
              <p className="text-accent/80 leading-relaxed">
                To be the global leader in engineering plastics solutions, recognized for innovation, technical excellence, and unwavering commitment to customer success. We envision a future where advanced materials enable breakthrough technologies across all industries.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* INDUSTRIES */}
      <section className="py-24 md:py-32 px-6 bg-card overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold tracking-[0.3em] text-muted-foreground uppercase mb-4">
              INDUSTRIES WE SERVE
            </p>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
              Powering innovation everywhere
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Our materials power innovation across diverse sectors, from aerospace to medical, semiconductor to automotive, and beyond.
            </p>
          </div>

          <div className="space-y-4">
            {[
              [INDUSTRIES[0], INDUSTRIES[1], INDUSTRIES[2], INDUSTRIES[3]],
              [INDUSTRIES[4], INDUSTRIES[5], INDUSTRIES[6], INDUSTRIES[7]],
              [INDUSTRIES[8], INDUSTRIES[9], INDUSTRIES[10], INDUSTRIES[11]],
            ].map((row, ri) => (
              <div key={ri} className="flex flex-wrap justify-center gap-3">
                {row.map(({ name, icon: Icon }) => (
                  <div
                    key={name}
                    className="inline-flex items-center gap-3 bg-background border border-border rounded-full px-6 py-3 hover:bg-foreground hover:text-accent group transition-all duration-300"
                  >
                    <Icon size={18} className="text-foreground group-hover:text-accent transition-colors duration-300" />
                    <span className="text-sm font-semibold tracking-wider uppercase text-foreground group-hover:text-accent transition-colors duration-300">
                      {name}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CERTIFICATIONS */}
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold tracking-[0.3em] text-muted-foreground uppercase mb-4">
              CERTIFICATIONS & COMPLIANCE
            </p>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground">
              Built on standards you can trust
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            {CERTIFICATIONS.map(({ title, desc }) => (
              <div
                key={title}
                className="bg-card rounded-2xl p-8 text-center shadow-md border border-border"
              >
                <BadgeCheck size={32} className="mx-auto mb-4 text-foreground" />
                <h4 className="font-semibold text-foreground text-lg mb-1">{title}</h4>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMPANY INFO */}
      <section className="py-24 md:py-32 px-6 bg-foreground text-accent">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold tracking-[0.3em] text-accent/50 uppercase mb-4">
              COMPANY INFORMATION
            </p>
            <h2 className="font-display text-3xl md:text-5xl font-bold">
              Get in touch
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-accent/10 rounded-3xl p-10 backdrop-blur-sm">
              <h3 className="text-lg font-bold tracking-wider uppercase mb-6 text-accent/70">
                Business Details
              </h3>
              <div className="space-y-4 text-accent/90">
                <p>
                  <span className="text-accent/50 text-sm uppercase tracking-wider block mb-1">Director Proprietor</span>
                  NYLOKING & CO (Partner)
                </p>
                <p>
                  <span className="text-accent/50 text-sm uppercase tracking-wider block mb-1">GSTIN</span>
                  29AABFN2443F1ZH
                </p>
                <div className="pt-2">
                  <span className="text-accent/50 text-sm uppercase tracking-wider flex items-center gap-2 mb-2">
                    <MapPin size={14} /> Address
                  </span>
                  <p>No. 161/1, S.P. Road</p>
                  <p>Bengaluru-560002</p>
                  <p>Karnataka, India</p>
                </div>
              </div>
            </div>

            <div className="bg-accent/10 rounded-3xl p-10 backdrop-blur-sm">
              <h3 className="text-lg font-bold tracking-wider uppercase mb-6 text-accent/70">
                Contact Information
              </h3>
              <div className="space-y-6 text-accent/90">
                <a href="tel:9448354795" className="flex items-center gap-4 hover:text-accent transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                    <Phone size={20} />
                  </div>
                  <div>
                    <p className="text-accent/50 text-xs uppercase tracking-wider mb-0.5">Phone</p>
                    <p className="font-semibold">9448354795</p>
                  </div>
                </a>
                <a href="tel:22234795" className="flex items-center gap-4 hover:text-accent transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                    <Phone size={20} />
                  </div>
                  <div>
                    <p className="text-accent/50 text-xs uppercase tracking-wider mb-0.5">Tel</p>
                    <p className="font-semibold">222234795 / 22224200</p>
                  </div>
                </a>
                <a href="mailto:nylokingandco@gmail.com" className="flex items-center gap-4 hover:text-accent transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                    <Mail size={20} />
                  </div>
                  <div>
                    <p className="text-accent/50 text-xs uppercase tracking-wider mb-0.5">Email</p>
                    <p className="font-semibold">nylokingandco@gmail.com</p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER CTA */}
      <section className="py-24 px-6 text-center">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-8">
          Ready to partner with us?
        </h2>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link to="/contact" className="btn-cta inline-block text-center">GET A QUOTE</Link>
          <Link to="/products" className="btn-cta inline-block text-center">EXPLORE PRODUCTS</Link>
        </div>
        <p className="text-sm text-muted-foreground tracking-widest uppercase">
          NYLOKING & CO., — House of Engineering Plastics
        </p>
      </section>

      <Footer />
    </main>
  );
}
