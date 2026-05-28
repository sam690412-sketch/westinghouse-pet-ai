import { useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';

interface HeroProps {
  onScrollToProducts?: () => void;
}

export default function Hero({ onScrollToProducts }: HeroProps) {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      const x = (clientX / innerWidth - 0.5) * 15;
      const y = (clientY / innerHeight - 0.5) * 15;
      
      const bg = hero.querySelector('.hero-bg') as HTMLElement;
      if (bg) {
        bg.style.transform = `translate(${x}px, ${y}px) scale(1.05)`;
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center overflow-hidden bg-wh-black"
    >
      {/* Background with Parallax */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="hero-bg absolute inset-0 bg-cover bg-center transition-transform duration-500 ease-out"
          style={{
            backgroundImage: 'url(/images/hero-bg.jpg)',
            transform: 'scale(1.05)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-wh-black via-wh-black/90 to-wh-black/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-wh-black via-transparent to-transparent" />
      </div>

      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-grid opacity-20" />

      {/* Content */}
      <div className="relative z-10 container-wh w-full py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left - Text Content */}
          <div className="max-w-xl">
            {/* Brand Tag */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm rounded-full border border-white/10 mb-8 animate-fade-in">
              <span className="w-2 h-2 bg-wh-orange rounded-full animate-pulse" />
              <span className="text-sm text-wh-gray tracking-wider">
                Powering People Since 1886
              </span>
            </div>

            {/* Emotional Headline - Pain Point */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 animate-fade-in-up">
              當你不在家時<br />
              <span className="text-wh-orange">牠的每一餐</span><br />
              還能準時嗎？
            </h1>

            {/* Subtitle - Amplify Pain */}
            <p className="text-lg md:text-xl text-wh-gray mb-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              加班｜出差｜晚回家
            </p>
            <p className="text-base text-white/60 mb-10 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              不是你不餵，是你沒辦法固定
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-start gap-4 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <button
                onClick={onScrollToProducts}
                className="btn-primary group text-lg py-4 px-8"
              >
                立即改善牠的生活
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <a
                href="#products"
                className="btn-secondary"
              >
                查看產品
              </a>
            </div>
          </div>

          {/* Right - Product Visual */}
          <div className="hidden lg:flex justify-center items-center animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            <div className="relative">
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-wh-orange/20 rounded-full blur-3xl scale-150" />
              {/* Product Image */}
              <img
                src="/images/feeder-smart.jpg"
                alt="Westinghouse Smart Feeder"
                className="relative w-full max-w-md rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
          <div className="w-1 h-2 bg-wh-orange rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  );
}
