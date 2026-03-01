const TICKER_TEXT = "★ NYLOKING AND CO IS THE BEST IN SUPPLYING PRECISION ENG PRODUCTS ★ THE PRICES FOR EVERYTHING IS REDUCED TO 20% GET THEM SOON ★ WATCH OUR NEW REEL ON INSTAGRAM FOR OUR NEW PRODUCT LAUNCH ";

export default function MarqueeTicker() {
  const repeated = TICKER_TEXT.repeat(4);
  return (
    <div className="marquee-band py-3">
      <div className="marquee-track">
        <span className="text-sm font-bold tracking-widest uppercase px-2">{repeated}</span>
        <span className="text-sm font-bold tracking-widest uppercase px-2">{repeated}</span>
      </div>
    </div>
  );
}
