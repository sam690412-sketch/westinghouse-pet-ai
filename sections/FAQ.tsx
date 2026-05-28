// @ts-nocheck
import { useEffect, useRef, useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { faqData } from '../data/products';

export default function FAQ() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(0);

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
      className="py-24 md:py-32 bg-wh-black"
    >
      <div className="container-wh">
        {/* Section Header */}
        <div
          className={`text-center mb-16 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-wh-orange/10 rounded-full border border-wh-orange/20 mb-6">
            <HelpCircle className="w-4 h-4 text-wh-orange" />
            <span className="text-sm text-wh-orange tracking-wider">
              FAQ
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            常見問題
          </h2>
          <p className="text-wh-gray max-w-2xl mx-auto">
            解答您的疑慮，讓購買更安心
          </p>
        </div>

        {/* FAQ List */}
        <div
          className={`max-w-3xl mx-auto transition-all duration-700 delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          {faqData.map((item, index) => (
            <div
              key={index}
              className="border-b border-white/10 last:border-b-0"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full py-6 flex items-center justify-between text-left group"
              >
                <span className="text-lg font-medium text-white group-hover:text-wh-orange transition-colors pr-4">
                  {item.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-wh-gray flex-shrink-0 transition-transform ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? 'max-h-48 pb-6' : 'max-h-0'
                }`}
              >
                <p className="text-wh-gray leading-relaxed">
                  {item.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
