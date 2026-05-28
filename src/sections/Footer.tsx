import { Facebook, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    products: [
      { label: '智能飲水機', href: '/products/water-dispensers' },
      { label: '智能餵食器', href: '/products/feeders' },
      { label: '配件耗材', href: '/products/accessories' },
    ],
    support: [
      { label: '使用說明', href: '/solutions' },
      { label: '常見問題', href: '/faq' },
      { label: '保固政策', href: '/trust/warranty-commitment' },
      { label: '聯繫客服', href: '/contact' },
    ],
    company: [
      { label: '關於西屋', href: '/brand/story' },
      { label: '品牌故事', href: '/brand/story' },
      { label: '官方授權', href: '/trust/official-license' },
    ],
  };

  return (
    <footer className="bg-wh-black border-t border-white/10">
      {/* Main Footer */}
      <div className="container-wh py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <a href="#" className="inline-block mb-6">
              <span className="text-2xl font-bold tracking-wider text-white">
                WESTINGHOUSE
              </span>
              <span className="block text-xs text-wh-gray tracking-widest mt-1">
                PET SYSTEM
              </span>
            </a>
            <p className="text-wh-gray text-sm leading-relaxed mb-6 max-w-sm">
              140年美國品牌，工業級品質標準。我們將創新科技與專業工藝融入寵物用品設計，
              為您的愛寵打造真正的美式家電級生活體驗。
            </p>
            {/* Social Links */}
            <div className="flex gap-4">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-wh-gray hover:bg-wh-orange hover:text-white transition-all"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-wh-gray hover:bg-wh-orange hover:text-white transition-all"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-wh-gray hover:bg-wh-orange hover:text-white transition-all"
                aria-label="Youtube"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Products */}
          <div>
            <h4 className="text-white font-semibold mb-4">產品</h4>
            <ul className="space-y-3">
              {footerLinks.products.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-wh-gray hover:text-wh-orange transition-colors text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-semibold mb-4">支援</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-wh-gray hover:text-wh-orange transition-colors text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-semibold mb-4">公司</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-wh-gray hover:text-wh-orange transition-colors text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex flex-wrap gap-6 text-sm text-wh-gray">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-wh-orange" />
              <span>support@westinghouse.tw</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-wh-orange" />
              <span>0800-000-000</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-wh-orange" />
              <span>台灣台北市</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container-wh py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-wh-gray">
            <p>
              © {currentYear} Westinghouse Electric Corporation. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a href="/faq" className="hover:text-wh-orange transition-colors">
                使用條款
              </a>
              <a href="/faq" className="hover:text-wh-orange transition-colors">
                隱私政策
              </a>
              <span className="text-wh-gray cursor-default">
                Cookie設定
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
