-- V3.0 approved Taiwan price seed. Apply only after backup and schema review.
BEGIN;
CREATE TABLE IF NOT EXISTS product_prices (
  sku text PRIMARY KEY,
  name_zh_tw text NOT NULL,
  msrp_twd integer NOT NULL CHECK (msrp_twd > 0),
  retail_twd integer NOT NULL CHECK (retail_twd > 0),
  promo_twd integer NOT NULL CHECK (promo_twd > 0),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (msrp_twd >= retail_twd AND retail_twd >= promo_twd)
);
INSERT INTO product_prices (sku,name_zh_tw,msrp_twd,retail_twd,promo_twd) VALUES
('M81','智能鮮濕糧餵食器',6480,5480,4880),
('M12','智能可視餵食器',4880,4180,3680),
('M31','小Q智能餵食器',3180,2580,2180),
('D61','不鏽鋼無線飲水機',3580,2880,2480),
('D11-BA','雙無線飲水機',2580,2080,1780)
ON CONFLICT (sku) DO NOTHING;
-- Accessories: MSRP 360, retail 290, three-box bundle 780; SKU, package contents and
-- compatibility have not been provided, so no fabricated accessory SKU is seeded.
COMMIT;
