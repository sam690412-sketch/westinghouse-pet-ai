import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Clock, HeartCrack, Brain } from 'lucide-react';

export default function PainPoint() {
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

  const painPoints = [
    {
      icon: Clock,
      title: '餵食時間不固定',
      description: '腸胃負擔加重，消化系統紊亂',
    },
    {
      icon: HeartCrack,
      title: '一次吃太多',
      description: '暴飲暴食導致肥胖與健康問題',
    },
    {
      icon: Brain,
      title: '長時間等待',
      description: '焦慮行為，影響心理健康',
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="py-24 md:py-32 bg-wh-black relative overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-wh-orange/5 rounded-full blur-3xl" />

      <div className="container-wh relative z-10">
        {/* Section Header */}
        <div
          className={`text-center mb-16 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 rounded-full border border-red-500/20 mb-6">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="text-sm text-red-400 tracking-wider">
              你可能沒有意識到的問題
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            你以為只是<span className="text-red-400">「餓一下」</span>？
          </h2>
          <p className="text-xl text-wh-gray">
            其實不是。
          </p>
        </div>

        {/* Pain Points Grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {painPoints.map((point, index) => (
            <div
              key={index}
              className={`p-8 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 transition-all duration-700 hover:border-red-500/30 hover:bg-red-500/5 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: `${(index + 1) * 150}ms` }}
            >
              <point.icon className="w-10 h-10 text-red-400 mb-6" />
              <h3 className="text-xl font-semibold text-white mb-3">
                {point.title}
              </h3>
              <p className="text-wh-gray leading-relaxed">
                {point.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
