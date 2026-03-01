interface ImageSectionProps {
  image: string;
  title: string;
  subtitle: string;
}

export default function ImageSection({ image, title, subtitle }: ImageSectionProps) {
  return (
    <section
      className="relative overflow-hidden"
      style={{ height: '100vh', minHeight: '100vh' }}
      data-animate="image-section"
    >
      <img
        src={image}
        alt={title}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ willChange: 'transform' }}
        data-animate="image-bg"
      />
      <div className="section-overlay" />
      <div className="relative z-10 h-full flex items-end p-8 md:p-16">
        <div>
          <h2 className="font-display text-4xl md:text-6xl font-bold text-accent mb-2">
            {title}
          </h2>
          <p className="text-accent/80 text-base md:text-lg tracking-wide">
            {subtitle}
          </p>
        </div>
      </div>
    </section>
  );
}
