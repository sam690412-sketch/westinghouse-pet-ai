// @ts-nocheck
import { useEffect, useRef, useState } from 'react';
import { ShoppingCart, ArrowRight } from 'lucide-react';
import { products } from '../data/products';

interface ProductsProps {
  onProductClick?: (productId: string) => void;
}

export default function Products({ onProductClick }: ProductsProps) {
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
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const feeders = products.filter((p) => p.category === 'feeder');
  const waters = products.filter((p) => p.category === 'water');

  return (
    <section
      id="products"
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
          <span className="text-wh-orange text-sm tracking-widest uppercase mb-4 block">
            Products
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            選擇適合的<span className="text-wh-orange">生活系統</span>
          </h2>
          <p className="text-wh-gray max-w-2xl mx-auto">
            工業級設計，家電級品質，為您的愛寵打造專業生活體驗
          </p>
        </div>

        {/* Feeders Section */}
        <div className="mb-20">
          <h3 className="text-xl font-semibold text-white mb-8 flex items-center gap-3">
            <span className="w-8 h-px bg-wh-orange" />
            智能餵食系列
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {feeders.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                index={index}
                isVisible={isVisible}
                onClick={() => onProductClick?.(product.id)}
              />
            ))}
          </div>
        </div>

        {/* Water Dispensers Section */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-8 flex items-center gap-3">
            <span className="w-8 h-px bg-wh-orange" />
            循環飲水系列
          </h3>
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {waters.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                index={index + 3}
                isVisible={isVisible}
                onClick={() => onProductClick?.(product.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

interface ProductCardProps {
  product: typeof products[0];
  index: number;
  isVisible: boolean;
  onClick: () => void;
}

function ProductCard({ product, index, isVisible, onClick }: ProductCardProps) {
  return (
    <div
      className={`product-card group cursor-pointer transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
      style={{ transitionDelay: `${(index + 1) * 100}ms` }}
      onClick={onClick}
    >
      {/* Product Image */}
      <div className="relative aspect-square mb-6 overflow-hidden rounded-lg bg-wh-dark-gray/50">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {product.originalPrice && (
          <div className="absolute top-4 left-4 bg-wh-orange text-white text-sm font-semibold px-3 py-1 rounded">
            限時優惠
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="space-y-3">
        <div>
          <h4 className="text-xl font-semibold text-white group-hover:text-wh-orange transition-colors">
            {product.name}
          </h4>
          <p className="text-wh-gray text-sm">{product.nameEn}</p>
        </div>

        {/* Tagline */}
        <p className="text-wh-orange text-sm font-medium">
          {product.tagline}
        </p>

        {/* Price */}
        <div className="flex items-center gap-3 pt-2">
          <span className="text-2xl font-bold text-wh-orange">
            {product.price}
          </span>
          {product.originalPrice && (
            <span className="text-wh-gray line-through">
              {product.originalPrice}
            </span>
          )}
        </div>

        {/* CTA Button */}
        <button
          className="w-full btn-primary group/btn mt-4"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          立即購買
          <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
