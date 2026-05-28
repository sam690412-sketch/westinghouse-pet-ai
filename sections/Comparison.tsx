// @ts-nocheck
import { useEffect, useRef, useState } from 'react';
import { Check, X } from 'lucide-react';
import { comparisonData } from '../data/products';

export default function Comparison() {
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
            Comparison
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-wh-black mb-4">
            為何選擇<span className="text-wh-orange">西屋？</span>
          </h2>
          <p className="text-wh-dark-gray max-w-2xl mx-auto">
            140年品牌傳承，工業級品質標準
          </p>
        </div>

        {/* Comparison Table */}
        <div
          className={`max-w-4xl mx-auto transition-all duration-700 delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-3 bg-wh-black text-white">
              <div className="p-6 text-left font-semibold">比較項目</div>
              <div className="p-6 text-center font-semibold text-wh-gray">一般品牌</div>
              <div className="p-6 text-center font-semibold bg-wh-orange">Westinghouse</div>
            </div>

            {/* Table Body */}
            {comparisonData.items.map((item, index) => (
              <div
                key={index}
                className={`grid grid-cols-3 ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                }`}
              >
                <div className="p-6 text-left font-medium text-wh-dark-gray border-b border-gray-100">
                  {item.feature}
                </div>
                <div className="p-6 text-center text-wh-dark-gray border-b border-gray-100 flex items-center justify-center gap-2">
                  <X className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">{item.other}</span>
                </div>
                <div className="p-6 text-center text-wh-orange font-semibold border-b border-gray-100 bg-wh-orange/5 flex items-center justify-center gap-2">
                  <Check className="w-4 h-4" />
                  <span className="text-sm">{item.westinghouse}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
