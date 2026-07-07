import Link from 'next/link';

export default function NotFound() {
  return (
    <main className='flex min-h-screen flex-col items-center justify-center bg-smoke px-4 text-center'>
      <p className='font-kanit text-7xl font-bold tracking-widest text-saffron'>
        404
      </p>
      <h1 className='mt-4 font-kanit text-2xl font-semibold text-jet'>
        Artículo no encontrado
      </h1>
      <p className='mt-3 max-w-md text-jet/60'>
        El artículo que buscas no existe o ha sido movido.
      </p>
      <Link
        href='/'
        className='mt-8 rounded-full bg-jet px-6 py-3 text-sm text-smoke transition-colors hover:bg-jet/90'
      >
        Volver al blog
      </Link>
    </main>
  );
}
