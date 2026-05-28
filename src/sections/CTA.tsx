import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Zap, Truck, Shield, RotateCcw } from 'lucide-react';

export default function CTA() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const benefits = [
    { icon: Truck, label: '全台免運' },
    { icon: Shield, label: '一年保固' },
    { icon: RotateCcw, label: '7天鑑賞期' },
  ];

  return (
    <section
      ref={sectionRef}
      className="py-24 md:py-32 bg-wh-black relative overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 bg-grid opacity-20" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-wh-orange/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-wh-orange/5 rounded-full blur-3xl" />

      <div className="container-wh relative z-10">
        <div
          className={`max-w-3xl mx-auto text-center transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-wh-orange/10 rounded-full border border-wh-orange/20 mb-8">
            <Zap className="w-4 h-4 text-wh-orange" />
            <span className="text-sm text-wh-orange tracking-wider">
              限時優惠進行中
            </span>
          </div>

          {/* Heading */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            現在開始<br />
            <span className="text-gradient">讓牠的生活變得更穩定</span>
          </h2>

          {/* Description */}
          <p className="text-lg text-wh-gray mb-10 max-w-xl mx-auto">
            140年美國品牌，工業級品質保證。
            為您的愛寵帶來專業級的生活體驗。
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <a
              href="#products"
              className="btn-primary group text-lg py-4 px-8"
            >
              立即購買 Westinghouse PET
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-2 text-wh-gray">
                <benefit.icon className="w-4 h-4 text-wh-orange" />
                <span className="text-sm">{benefit.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
