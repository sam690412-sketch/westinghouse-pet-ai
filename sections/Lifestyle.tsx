import { useEffect, useRef, useState } from 'react';
import { Briefcase, Plane, Moon } from 'lucide-react';

export default function Lifestyle() {
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

  const scenarios = [
    { icon: Briefcase, label: '上班' },
    { icon: Plane, label: '出差' },
    { icon: Moon, label: '夜晚' },
  ];

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[600px] md:min-h-[700px] overflow-hidden"
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="/images/lifestyle-1.jpg"
          alt="Lifestyle"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-wh-black/90 via-wh-black/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-wh-black via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 container-wh h-full flex flex-col justify-end pb-16 md:pb-24 min-h-[600px] md:min-h-[700px]">
        <div className="max-w-xl">
          <div
            className={`transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            {/* Scenarios */}
            <div className="flex gap-4 mb-6">
              {scenarios.map((scenario, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg"
                >
                  <scenario.icon className="w-4 h-4 text-wh-orange" />
                  <span className="text-white text-sm font-medium">{scenario.label}</span>
                </div>
              ))}
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              你在工作<br />
              <span className="text-wh-orange">牠也在安心吃飯</span>
            </h2>
            <p className="text-white/70 text-lg leading-relaxed">
              無論您身在何處，西屋智能寵物系統都能讓您隨時掌握愛寵的飲食狀況。
              工業級品質，家電級體驗，讓科技為您的寵物生活保駕護航。
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
