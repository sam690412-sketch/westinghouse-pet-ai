// @ts-nocheck
import { useState } from 'react';
import { X, Check, ShoppingCart, Star, ChevronDown, ChevronUp } from 'lucide-react';
import type { Product } from '../data/products';

interface ProductDetailProps {
  product: Product;
  onClose: () => void;
}

export default function ProductDetail({ product, onClose }: ProductDetailProps) {
  const [expandedSpecs, setExpandedSpecs] = useState(true);
  const [buyLink, setBuyLink] = useState(product.buyLink);
  const [showLinkInput, setShowLinkInput] = useState(false);

  // Close on escape key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onKeyDown={handleKeyDown}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-wh-black rounded-2xl overflow-hidden animate-scale-in border border-white/10">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-wh-orange transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="overflow-y-auto max-h-[90vh]">
          {/* Hero Section */}
          <div className="grid md:grid-cols-2 gap-8 p-8">
            {/* Product Image */}
            <div className="aspect-square rounded-xl overflow-hidden bg-wh-dark-gray/50">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Product Info */}
            <div className="flex flex-col justify-center">
              <span className="text-wh-orange text-sm tracking-widest uppercase mb-2">
                {product.category === 'feeder' ? '智能餵食系列' : '循環飲水系列'}
              </span>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{product.name}</h1>
              <p className="text-wh-gray mb-2">{product.nameEn}</p>
              <p className="text-wh-orange font-medium mb-4">{product.tagline}</p>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-6">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-wh-orange text-wh-orange" />
                  ))}
                </div>
                <span className="text-wh-gray text-sm">(4.9/5 · 128+ 評價)</span>
              </div>

              {/* Price */}
              <div className="flex items-center gap-4 mb-6">
                <span className="text-3xl font-bold text-wh-orange">
                  {product.price}
                </span>
                {product.originalPrice && (
                  <span className="text-xl text-wh-gray line-through">
                    {product.originalPrice}
                  </span>
                )}
              </div>

              {/* Features */}
              <div className="space-y-2 mb-8">
                {product.features.slice(0, 4).map((feature, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-white/80">
                    <Check className="w-4 h-4 text-wh-orange flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              {/* Admin Toggle */}
              <button
                onClick={() => setShowLinkInput(!showLinkInput)}
                className="text-xs text-wh-gray hover:text-wh-orange transition-colors mb-4 text-left"
              >
                {showLinkInput ? '隱藏後台設定' : '後台設定'}
              </button>

              {/* Buy Link Input (Admin) */}
              {showLinkInput && (
                <div className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
                  <label className="text-sm text-wh-gray mb-2 block">
                    購買連結設定
                  </label>
                  <input
                    type="url"
                    value={buyLink}
                    onChange={(e) => setBuyLink(e.target.value)}
                    placeholder="輸入轉接購買連結（蝦皮、Pinkoi等）..."
                    className="w-full px-4 py-2 bg-wh-dark-gray border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-wh-orange text-sm"
                  />
                  <p className="text-xs text-wh-gray mt-2">
                    設定後「立即購買」按鈕將導向此連結
                  </p>
                </div>
              )}

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href={buyLink || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary flex-1 text-center"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  立即購買
                </a>
                <button
                  onClick={onClose}
                  className="btn-secondary flex-1"
                >
                  繼續瀏覽
                </button>
              </div>
            </div>
          </div>

          {/* Specs Section */}
          <div className="border-t border-white/10 p-8">
            <button
              onClick={() => setExpandedSpecs(!expandedSpecs)}
              className="w-full flex items-center justify-between py-2 text-left"
            >
              <span className="text-lg font-semibold text-white">產品規格</span>
              {expandedSpecs ? (
                <ChevronUp className="w-5 h-5 text-wh-gray" />
              ) : (
                <ChevronDown className="w-5 h-5 text-wh-gray" />
              )}
            </button>
            {expandedSpecs && (
              <div className="grid sm:grid-cols-2 gap-4 mt-4">
                {Object.entries(product.specs).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex justify-between py-3 border-b border-white/10"
                  >
                    <span className="text-wh-gray">{key}</span>
                    <span className="text-white">{value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
