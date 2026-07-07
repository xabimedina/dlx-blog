import Image from 'next/image';

/** Galería de imágenes opcional que se muestra al final del artículo. */
export function PostGallery({ images, title }: { images: string[]; title: string }) {
  if (!images?.length) return null;

  return (
    <section className='mx-auto mt-16 max-w-4xl px-4'>
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
        {images.map((src, i) => (
          <div
            key={src}
            className='relative overflow-hidden rounded-xl bg-jet/5 aspect-[4/3]'
          >
            <Image
              src={src}
              alt={`${title} — imagen ${i + 1}`}
              fill
              sizes='(max-width: 768px) 100vw, 50vw'
              className='object-cover'
            />
          </div>
        ))}
      </div>
    </section>
  );
}
