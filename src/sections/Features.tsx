import { useEffect, useRef, useState } from 'react';
import { Timer, Shield, VolumeX, Sparkles } from 'lucide-react';

export default function Features() {
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
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const features = [
    {
      icon: Timer,
      title: '精準定時餵食',
      description: '每天固定時間自動出糧，建立穩定的生活節奏',
    },
    {
      icon: Shield,
      title: '防卡糧設計',
      description: '工業級結構設計，經過10萬次測試，穩定不卡糧',
    },
    {
      icon: VolumeX,
      title: '靜音夜間運作',
      description: '<30dB超靜音設計，不打擾您和愛寵的休息',
    },
    {
      icon: Sparkles,
      title: '食品級安全材質',
      description: '304不鏽鋼+食品級ABS，通過多項國際認證',
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="py-24 md:py-32 bg-wh-light"
    >
      <div className="container-wh">
        {/* Section Header */}
        <div
          className={`text-center mb-16 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <span className="text-wh-orange text-sm tracking-widest uppercase mb-4 block">
            Features
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-wh-black mb-4">
            核心功能
          </h2>
          <p className="text-wh-dark-gray max-w-2xl mx-auto">
            工業級品質，每一個細節都為牠著想
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`p-8 bg-white rounded-xl shadow-lg border border-gray-100 transition-all duration-700 hover:shadow-xl hover:border-wh-orange/20 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: `${(index + 1) * 100}ms` }}
            >
              <div className="w-14 h-14 bg-wh-orange/10 rounded-xl flex items-center justify-center mb-6">
                <feature.icon className="w-7 h-7 text-wh-orange" />
              </div>
              <h3 className="text-xl font-semibold text-wh-black mb-3">
                {feature.title}
              </h3>
              <p className="text-wh-dark-gray leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
