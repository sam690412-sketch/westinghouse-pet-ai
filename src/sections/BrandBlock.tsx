import { useEffect, useRef, useState } from 'react';

export default function BrandBlock() {
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

  return (
    <section
      ref={sectionRef}
      className="py-24 md:py-32 bg-wh-light"
    >
      <div className="container-wh">
        <div className="grid md:grid-cols-2 gap-12 md:gap-24 items-center">
          {/* Left - Logo & Year */}
          <div
            className={`transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
            }`}
          >
            <div className="flex flex-col items-start">
              <span className="text-6xl md:text-8xl font-bold text-wh-black tracking-tighter">
                1886
              </span>
              <div className="h-1 w-24 bg-wh-orange mt-4 mb-6" />
              <span className="text-3xl md:text-4xl font-bold text-wh-black tracking-wider">
                WESTINGHOUSE
              </span>
              <span className="text-lg text-wh-dark-gray mt-2 tracking-widest">
                POWERING PEOPLE
              </span>
            </div>
          </div>

          {/* Right - Text Content */}
          <div
            className={`transition-all duration-700 delay-200 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
            }`}
          >
            <h2 className="heading-2 text-wh-black mb-6">
              百年品牌<br />
              <span className="text-wh-orange">專業傳承</span>
            </h2>
            <p className="text-wh-dark-gray text-lg leading-relaxed mb-6">
              西屋電氣，始於1886年，由發明家喬治·西屋創立。一個多世紀以來，我們始終堅持創新與品質，從電力系統到家電產品，西屋品牌代表著美國工業的卓越標準。
            </p>
            <p className="text-wh-dark-gray leading-relaxed">
              今天，我們將這份專業延伸至寵物領域，打造真正的美式家電級寵物生活。工業級設計、家電級品質，為您的愛寵提供專業級的生活體驗。
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
