import { useEffect, useRef, useState } from 'react';
import { Check, Zap } from 'lucide-react';

export default function Solution() {
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

  const features = [
    '定時定量餵食',
    '防卡糧設計',
    '靜音夜間運作',
    '食品級安全材質',
  ];

  return (
    <section
      ref={sectionRef}
      className="py-24 md:py-32 bg-wh-light"
    >
      <div className="container-wh">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left - Text Content */}
          <div
            className={`transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
            }`}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-wh-orange/10 rounded-full border border-wh-orange/20 mb-6">
              <Zap className="w-4 h-4 text-wh-orange" />
              <span className="text-sm text-wh-orange tracking-wider">
                解決方案
              </span>
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-wh-black mb-6 leading-tight">
              這不是餵食器
            </h2>
            <p className="text-2xl md:text-3xl font-semibold text-wh-orange mb-8">
              是「穩定生活系統」
            </p>
            <p className="text-lg text-wh-dark-gray leading-relaxed mb-8">
              讓牠每天的生活節奏，被重新校正。
              無論你身在何處，牠的每一餐都準時送達。
            </p>

            {/* Features List */}
            <div className="grid sm:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3"
                >
                  <div className="w-6 h-6 rounded-full bg-wh-orange/10 flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-wh-orange" />
                  </div>
                  <span className="text-wh-dark-gray">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right - Image */}
          <div
            className={`transition-all duration-700 delay-200 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
            }`}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-wh-orange/10 rounded-2xl blur-2xl" />
              <img
                src="/images/lifestyle-2.jpg"
                alt="Pet using Westinghouse feeder"
                className="relative w-full rounded-2xl shadow-xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
