import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import NylokingLogo from '@/components/layout/NylokingLogo';
import MarqueeTicker from '@/components/MarqueeTicker';
import CinematicNavbar from '@/components/CinematicNavbar';
import ImageSection from '@/components/ImageSection';
import HowItWorks from '@/components/HowItWorks';

import automotiveImg from '@/assets/automotive-plastics.jpg';
import engineeringImg from '@/assets/engineering-manufacturing.jpg';
import industrialImg from '@/assets/industrial-applications.jpg';
import showcaseImg from '@/assets/plastics-showcase.jpg';
import laminatedImg from '@/assets/laminated-sheets.jpg';
import rodsImg from '@/assets/heat-resistance-rods.jpg';

gsap.registerPlugin(ScrollTrigger);

export default function Index() {
  const heroRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const [navVisible, setNavVisible] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(logoRef.current, {
        opacity: 0,
        y: 40,
        duration: 1.2,
        ease: 'power3.out',
      });

      ScrollTrigger.create({
        trigger: heroRef.current,
        start: 'top top',
        end: 'bottom top',
        onLeave: () => setNavVisible(true),
        onEnterBack: () => setNavVisible(false),
      });

      gsap.fromTo(
        logoRef.current,
        { scale: 1, y: 0, opacity: 1 },
        {
          scale: 0.15,
          y: -200,
          opacity: 0,
          ease: 'none',
          force3D: true,
          scrollTrigger: {
            trigger: heroRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        }
      );

      document.querySelectorAll('[data-animate="image-section"]').forEach((section) => {
        const bg = section.querySelector('[data-animate="image-bg"]');
        if (bg) {
          gsap.fromTo(
            bg,
            { scale: 1.015 },
            {
              scale: 1,
              ease: 'none',
              force3D: true,
              scrollTrigger: {
                trigger: section,
                start: 'top bottom',
                end: 'top top',
                scrub: true,
              },
            }
          );
        }
        const textEl = section.querySelector('.relative.z-10 > div');
        if (textEl) {
          gsap.from(textEl, {
            y: 40,
            opacity: 0,
            duration: 0.6,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 65%',
              toggleActions: 'play none none reverse',
            },
          });
        }
      });

      const howCard = document.querySelector('[data-animate="how-card"]');
      if (howCard) {
        gsap.from(howCard, {
          y: 80,
          opacity: 0,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: howCard,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        });
      }

      const steps = document.querySelectorAll('[data-animate="how-step"]');
      gsap.from(steps, {
        y: 40,
        opacity: 0,
        duration: 0.6,
        stagger: 0.15,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: howCard,
          start: 'top 60%',
          toggleActions: 'play none none reverse',
        },
      });

      const trustBar = document.querySelector('[data-animate="trust-bar"]');
      if (trustBar) {
        gsap.from(trustBar, {
          y: 30,
          opacity: 0,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: trustBar,
            start: 'top 90%',
            toggleActions: 'play none none reverse',
          },
        });
      }

      const cta = document.querySelector('[data-animate="cta"]');
      if (cta) {
        gsap.from(cta, {
          y: 50,
          opacity: 0,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: cta,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        });
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <main className="bg-background">
      <CinematicNavbar visible={navVisible} scrollTriggered />

      {/* HERO */}
      <section ref={heroRef} className="h-screen flex flex-col items-center justify-center relative overflow-hidden">
        <div ref={logoRef} className="flex flex-col items-center w-full px-2">
          <NylokingLogo className="w-[95vw] max-w-none h-auto mb-4" />
          <p className="text-sm md:text-base font-sans font-semibold tracking-[0.3em] text-foreground uppercase">
            HOUSE OF ENGINEERING PLASTICS
          </p>
        </div>
      </section>

      {/* MARQUEE TOP */}
      <MarqueeTicker />

      {/* IMAGE SECTIONS */}
      <ImageSection
        image={automotiveImg}
        title="AUTOMOTIVE GRADE"
        subtitle="Precision plastics engineered for performance"
      />
      <ImageSection
        image={engineeringImg}
        title="ENGINEERED TO PRECISION"
        subtitle="Custom manufacturing for every specification"
      />
      <ImageSection
        image={industrialImg}
        title="BUILT FOR INDUSTRY"
        subtitle="From factory floors to critical applications"
      />
      <ImageSection
        image={showcaseImg}
        title="THE POLYMER ARSENAL"
        subtitle="Nylon-6 · Teflon · Delrin · Acrylic · PVC · Polypropylene · Polyurethane · SRBF · SRBP"
      />
      <ImageSection
        image={laminatedImg}
        title="THE SHEET VAULT"
        subtitle="Delrin POM · HDPE · PP · Teflon PTFE · UHMW PE · Polypropylene · Plast Nova"
      />
      <ImageSection
        image={rodsImg}
        title="THE ROD FORGE"
        subtitle="Delrin · HDPE · Nylon · POM · Polyethylene — Heat Resistance Engineered Rods"
      />

      <MarqueeTicker />

      {/* HOW IT WORKS */}
      <HowItWorks />

      {/* CTA */}
      <section className="bg-background py-32 px-6">
        <div className="max-w-3xl mx-auto text-center" data-animate="cta">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-10">
            READY TO BUILD SOMETHING?
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link to="/contact" className="btn-cta inline-block text-center">GET A QUOTE</Link>
            <Link to="/products" className="btn-cta inline-block text-center">EXPLORE PRODUCTS</Link>
          </div>
          <p className="text-sm text-muted-foreground tracking-widest uppercase">
            NYLOKING & CO., — House of Engineering Plastics
          </p>
        </div>
      </section>
    </main>
  );
}
