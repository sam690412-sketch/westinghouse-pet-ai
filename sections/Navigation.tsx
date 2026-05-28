import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '#products', label: '產品' },
    { href: '#lifestyle', label: '生活' },
    { href: '#comparison', label: '比較' },
    { href: '#reviews', label: '評價' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-wh-black/95 backdrop-blur-md py-4'
          : 'bg-transparent py-6'
      }`}
    >
      <div className="container-wh flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-3">
          <span className="text-2xl font-bold tracking-wider text-white">
            WESTINGHOUSE
          </span>
          <span className="hidden sm:block text-xs text-wh-gray tracking-widest">
            PET SYSTEM
          </span>
        </a>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-white/80 hover:text-wh-orange transition-colors tracking-wide"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#products"
            className="btn-primary text-sm py-3 px-6"
          >
            立即購買
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-wh-black/98 backdrop-blur-md border-t border-white/10">
          <div className="container-wh py-6 flex flex-col gap-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-lg text-white/80 hover:text-wh-orange transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <a
              href="#products"
              className="btn-primary text-center mt-4"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              立即購買
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
