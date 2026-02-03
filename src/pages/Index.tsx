import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, FileText, Reply, Package } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { supabase, RotatingMessage, RotatingMessageType } from '@/lib/supabase';

const CENTER_VIDEO_SRC = '/videos/12253750_1920_1080_30fps.mp4';
const CENTER_VIDEO_POSTER = '/images/home/heromain2.jpg';

function CenterMediaGrid() {
  return (
    <div className="md:col-span-4 flex flex-col relative min-h-[520px]">
      <div className="rounded-[2rem] overflow-hidden bg-black w-full h-full min-h-[520px] relative">
        <video
          src={CENTER_VIDEO_SRC}
          poster={CENTER_VIDEO_POSTER}
          className="w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          aria-label="Nyloking & Co. – process"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
      </div>
    </div>
  );
}

export default function Index() {
  const [messages, setMessages] = useState<RotatingMessage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from('rotating_messages')
        .select('*')
        .eq('active', true)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true });
      if (!error && data?.length) {
        setMessages(data);
        setCurrentIndex(0);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (messages.length === 0) return;
    const msg = messages[currentIndex];
    const durationMs = (msg?.duration_seconds ?? 5) * 1000;
    timerRef.current = setTimeout(() => {
      setCurrentIndex((i) => (i + 1) % messages.length);
    }, durationMs);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [messages, currentIndex]);

  const currentMessage = messages[currentIndex];
  const messageType: RotatingMessageType | undefined = currentMessage?.type;

  return (
    <Layout>
      {/* LIFESTYLE HERO SECTION */}
      <section className="relative bg-[#e8e4d8] min-h-screen pt-20 pb-12 overflow-hidden flex flex-col items-center">

        {/* 1. Main Headline Area */}
        <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 mb-8">
          <div className="flex flex-col items-center justify-center text-center">
            <h1 className="text-[12vw] md:text-[10vw] xl:text-[7.5rem] font-light tracking-tight leading-[0.9] flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
              <span>NYLOKING</span>
              <span className="inline-flex items-center justify-center px-6 py-1 md:px-10 md:py-3 rounded-[3rem] border-2 border-black text-[4vw] md:text-[3vw] xl:text-5xl font-normal bg-transparent">
                & CO
              </span>
              <span className="font-bold">PLASTICS</span>
            </h1>
          </div>
        </div>

        {/* 2. Bento Grid Layout */}
        <div className="w-full max-w-[1500px] mx-auto px-4 md:px-8">
          <div className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 min-h-[600px]">

              {/* LEFT COLUMN: Company photos + CTA */}
              <div className="md:col-span-4 bg-[#f0ebe0] rounded-[2rem] p-6 relative overflow-hidden flex flex-col min-h-[560px]">
                <div className="flex flex-col gap-4 flex-1">
                  {/* Company photo – primary */}
                  <div className="relative flex-1 rounded-[1.5rem] overflow-hidden min-h-[240px]">
                    <img
                      src="/images/home/heromain2.jpg"
                      alt="Nyloking & Co. – company"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Optional second company photo */}
                  <div className="relative h-40 rounded-[1.25rem] overflow-hidden">
                    <img
                      src="/images/home/heromain2.jpg"
                      alt="Nyloking & Co. – team or facility"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                {/* CTA card */}
                <Link
                  to="/contact"
                  className="mt-4 flex items-center justify-between gap-3 rounded-[1.25rem] bg-black text-white px-5 py-4 group hover:bg-black/90 transition-colors"
                >
                  <span className="text-sm font-semibold uppercase tracking-wider">Get a quote</span>
                  <ArrowRight className="w-4 h-4 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>

              {/* CENTER: 3-column media grid – images and videos; use real .mp4/.webm URLs in src for video slots */}
              <CenterMediaGrid />

              {/* RIGHT COLUMN: Spotlight product, Awards, Instagram */}
              <div className="md:col-span-4 flex flex-col gap-5 h-full min-h-[560px]">
                {/* 1. Spotlight / “New” product */}
                <div className="rounded-[2rem] overflow-hidden bg-black relative group min-h-[220px] flex-1">
                  <img
                    src="/images/home/heromain2.jpg"
                    alt="Spotlight product"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 right-3 bg-[#e0dcd0] text-black text-[10px] px-2.5 py-1 rounded-full font-bold uppercase">
                    New
                  </span>
                  <div className="absolute bottom-3 left-3 right-3">
                    <Link to="/products" className="text-white text-xs font-semibold uppercase tracking-wider hover:underline">
                      View product
                    </Link>
                  </div>
                </div>

                {/* 2. Awards / certifications */}
                <div className="rounded-[2rem] bg-[#f0ebe0] p-6">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-3">Awards & certifications</p>
                  <div className="flex flex-wrap gap-3 items-center">
                    {/* Placeholder badges – replace with real cert logos or text */}
                    <span className="inline-flex items-center rounded-full bg-white px-3 py-1.5 text-[10px] font-medium border border-black/10">ISO</span>
                    <span className="inline-flex items-center rounded-full bg-white px-3 py-1.5 text-[10px] font-medium border border-black/10">Quality</span>
                    <span className="inline-flex items-center rounded-full bg-white px-3 py-1.5 text-[10px] font-medium border border-black/10">Trusted</span>
                  </div>
                </div>

                {/* 3. From our Instagram / social feed */}
                <div className="rounded-[2rem] overflow-hidden">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-3 px-1">From our Instagram</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3].map((i) => (
                      <a
                        key={i}
                        href="https://instagram.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="aspect-square rounded-xl overflow-hidden bg-zinc-200 group"
                      >
                        <img
                          src="/images/home/heromain2.jpg"
                          alt={`Instagram ${i}`}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              </div>

            </div>

            {/* Rotating messages – quotes, offers, notices (admin-editable) */}
            {currentMessage && (
              <div
                key={currentMessage.id}
                className={`mt-6 text-center px-4 py-4 rounded-2xl transition-colors duration-300 ${
                  messageType === 'offer'
                    ? 'bg-amber-100 text-amber-900 border border-amber-200'
                    : messageType === 'notice'
                      ? 'bg-blue-50 text-blue-900 border border-blue-200'
                      : 'bg-[#f0ebe0]/80 text-muted-foreground'
                }`}
              >
                <p
                  className={
                    messageType === 'offer' || messageType === 'notice'
                      ? 'text-sm font-semibold not-italic animate-in fade-in duration-500'
                      : 'text-sm italic animate-in fade-in duration-500'
                  }
                >
                  {currentMessage.message}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* How it works – 3 steps, bold and clear */}
        <div className="w-full max-w-[1500px] mx-auto px-4 md:px-8 mt-8 mb-12">
          <div className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-lg">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-center mb-2">
              How it works
            </h2>
            <p className="text-center text-muted-foreground text-sm max-w-xl mx-auto mb-10">
              From request to delivery — simple, transparent, and built around your needs.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
              {/* Step 1 */}
              <div className="relative flex flex-col items-center text-center md:border-r md:border-black/10 md:pr-6 md:last:border-0">
                <span className="w-10 h-10 rounded-full bg-[#e8e4d8] border-2 border-black flex items-center justify-center text-sm font-bold mb-4">
                  1
                </span>
                <div className="w-16 h-16 rounded-2xl bg-black text-white flex items-center justify-center mb-4">
                  <FileText className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold uppercase tracking-wider mb-2">Request a quote</h3>
                <p className="text-sm text-muted-foreground">
                  Tell us your product, quantity, and specs. Use our contact form or add items from the catalog to your quote cart.
                </p>
              </div>
              {/* Step 2 */}
              <div className="relative flex flex-col items-center text-center md:border-r md:border-black/10 md:pr-6 md:last:border-0">
                <span className="w-10 h-10 rounded-full bg-[#e8e4d8] border-2 border-black flex items-center justify-center text-sm font-bold mb-4">
                  2
                </span>
                <div className="w-16 h-16 rounded-2xl bg-black text-white flex items-center justify-center mb-4">
                  <Reply className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold uppercase tracking-wider mb-2">We respond</h3>
                <p className="text-sm text-muted-foreground">
                  Our team reviews your request and sends a detailed quote — typically within 24 hours. We’re happy to discuss options.
                </p>
              </div>
              {/* Step 3 */}
              <div className="relative flex flex-col items-center text-center">
                <span className="w-10 h-10 rounded-full bg-[#e8e4d8] border-2 border-black flex items-center justify-center text-sm font-bold mb-4">
                  3
                </span>
                <div className="w-16 h-16 rounded-2xl bg-black text-white flex items-center justify-center mb-4">
                  <Package className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold uppercase tracking-wider mb-2">You order</h3>
                <p className="text-sm text-muted-foreground">
                  Confirm your order and we handle production and delivery. Quality materials, on time, every time.
                </p>
              </div>
            </div>
            <div className="mt-8 text-center">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-black text-white px-6 py-3 text-sm font-semibold uppercase tracking-wider hover:bg-black/90 transition-colors"
              >
                Get started
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Trust strip – edit numbers/copy as needed */}
        <div className="w-full max-w-[1500px] mx-auto px-4 md:px-8 mt-8 mb-16">
          <div className="rounded-[2rem] bg-[#f0ebe0] border border-black/5 px-6 py-5 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-black/80">Quality materials</span>
            <span className="text-black/30 hidden sm:inline">·</span>
            <span className="text-sm font-semibold uppercase tracking-wider text-black/80">Reliable supply</span>
            <span className="text-black/30 hidden sm:inline">·</span>
            <span className="text-sm font-semibold uppercase tracking-wider text-black/80">Trusted by industry</span>
          </div>
        </div>
      </section>
    </Layout>
  );
}
