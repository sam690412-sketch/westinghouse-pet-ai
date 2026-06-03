export function ProductDetailImagesSection({
  image,
}: {
  image: string;
}) {
  if (!image) return null;

  return (
    <section className="mx-auto w-full max-w-[960px] px-4 py-12 sm:px-6 lg:px-8">
      <h2 className="mb-8 text-center text-2xl font-bold tracking-tight text-foreground">
        產品詳情
      </h2>
      <div className="flex justify-center">
        <img
          src={image}
          alt="產品詳情圖"
          className="w-full object-contain pb-10"
          loading="lazy"
        />
      </div>
    </section>
  );
}
