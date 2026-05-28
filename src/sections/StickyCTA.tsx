import { ShoppingCart } from 'lucide-react';

interface StickyCTAProps {
  onClick: () => void;
}

export default function StickyCTA({ onClick }: StickyCTAProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-wh-black/95 backdrop-blur-md border-t border-white/10 p-4 md:hidden">
      <button
        onClick={onClick}
        className="w-full btn-primary py-4 text-lg"
      >
        <ShoppingCart className="w-5 h-5 mr-2" />
        立即購買
      </button>
    </div>
  );
}
