// Script de utilidad para sembrar/eliminar un post completo en la colección `blog`.
// Uso:
//   node --env-file=.env scripts/seed-blog.mjs seed
//   node --env-file=.env scripts/seed-blog.mjs unseed
import { readFile } from 'node:fs/promises';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

const app =
  getApps()[0] ??
  initializeApp({
    credential: cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      privateKey: process.env.PRIVATE_KEY?.replace(/\\n/g, '\n'),
      clientEmail: process.env.CLIENT_EMAIL,
    }),
  });

const db = getFirestore(app);
const bucket = getStorage(app).bucket(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET);

const SLUG = 'arquitectura-luz-materiales-espacios-habitables';

const assets = [
  {
    path: 'blog/images/seed-arquitectura-cover.jpg',
    file: new URL('../../dlx-web/public/images/portada.jpg', import.meta.url),
    contentType: 'image/jpeg',
  },
  {
    path: 'blog/images/seed-arquitectura-luz.jpg',
    file: new URL('../../dlx-web/public/images/servicios.jpg', import.meta.url),
    contentType: 'image/jpeg',
  },
  {
    path: 'blog/images/seed-arquitectura-materiales.jpg',
    file: new URL('../../dlx-web/public/images/PL.jpg', import.meta.url),
    contentType: 'image/jpeg',
  },
  {
    path: 'blog/images/seed-arquitectura-detalle.jpg',
    file: new URL('../../dlx-web/public/images/prueba.jpg', import.meta.url),
    contentType: 'image/jpeg',
  },
];

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function withRetry(label, operation, attempts = 5) {
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      const retryable =
        error?.code === 'ERR_STREAM_PREMATURE_CLOSE' ||
        error?.code === 'ECONNRESET' ||
        error?.code === 'ETIMEDOUT' ||
        error?.code === 'ENOTFOUND' ||
        error?.message?.includes('Premature close') ||
        error?.message?.includes('fetch failed') ||
        error?.message?.includes('socket');

      if (!retryable || attempt === attempts) break;

      const delay = Math.min(1000 * 2 ** (attempt - 1), 10000);
      console.warn(
        `${label} falló (${attempt}/${attempts}). Reintentando en ${delay}ms...`
      );
      await sleep(delay);
    }
  }

  throw lastError;
}

async function uploadAssets() {
  for (const asset of assets) {
    await withRetry(`Subida ${asset.path}`, async () => {
      const buffer = await readFile(asset.file);
      await bucket.file(asset.path).save(buffer, {
        metadata: {
          contentType: asset.contentType,
          cacheControl: 'public, max-age=31536000',
        },
      });
      console.log('Imagen seed subida:', asset.path);
    });
  }
}

async function deleteAssets() {
  await Promise.allSettled(
    assets.map(asset =>
      withRetry(`Borrado ${asset.path}`, () => bucket.file(asset.path).delete())
    )
  );
}

const examplePost = {
  slug: SLUG,
  title: 'Arquitectura que se habita: luz, materialidad y calma',
  excerpt:
    'Una guía editorial sobre cómo la luz natural, la elección de materiales y la proporción transforman una vivienda en un lugar sereno, funcional y profundamente habitable.',
  content: `
    <p>Diseñar una vivienda no consiste únicamente en resolver una distribución. Una casa bien pensada ordena la vida cotidiana, acompaña los cambios de ritmo y construye una atmósfera reconocible desde el primer paso.</p>
    <p>En Despeja la X trabajamos cada proyecto como una conversación entre <strong>luz</strong>, <strong>materia</strong> y <strong>uso real</strong>. Esa conversación empieza antes de escoger un revestimiento: empieza observando cómo entra el sol, dónde se detiene la mirada y qué gestos cotidianos necesitan espacio.</p>

    <h2>La luz como primera decisión de proyecto</h2>
    <p>La luz natural no se añade al final. Define jerarquías, orienta recorridos y cambia la percepción de los materiales durante el día. Una misma estancia puede sentirse amplia, íntima o fría según la dirección de la luz y la profundidad de las sombras.</p>
    <img src="blog/images/seed-arquitectura-luz.jpg" alt="Interior luminoso con lectura arquitectónica de la luz natural" />
    <blockquote>Una casa no se ilumina: se calibra para que la luz revele lo importante sin imponer ruido.</blockquote>

    <h3>Preguntas útiles antes de proyectar</h3>
    <ul>
      <li>¿Qué estancia necesita más luz directa y cuál necesita luz estable?</li>
      <li>¿Dónde conviene protegerse del deslumbramiento?</li>
      <li>¿Qué vistas merece la pena enmarcar y cuáles conviene filtrar?</li>
      <li>¿Cómo cambia el espacio entre la mañana y la tarde?</li>
    </ul>

    <h2>Materiales que envejecen bien</h2>
    <p>La materialidad no debería depender solo de la tendencia. Elegimos materiales por su tacto, mantenimiento, resistencia y capacidad para integrarse con la vida diaria. La madera, la piedra, el microcemento o las cerámicas artesanales funcionan cuando tienen una razón constructiva y sensorial.</p>
    <img src="blog/images/seed-arquitectura-materiales.jpg" alt="Detalle de materiales y textura en un proyecto de interiorismo" />
    <p>El objetivo es conseguir una base serena: pocos materiales, bien relacionados, capaces de sostener cambios de mobiliario, iluminación y uso sin perder coherencia.</p>

    <h3>Un criterio sencillo</h3>
    <ol>
      <li>Primero se define la atmósfera que debe tener la vivienda.</li>
      <li>Después se eligen materiales compatibles con esa atmósfera y con el uso real.</li>
      <li>Por último se ajustan encuentros, juntas, espesores y detalles.</li>
    </ol>

    <h2>Distribuir no es llenar: es dejar respirar</h2>
    <p>Una buena distribución no se mide solo en metros cuadrados. Se mide en continuidad visual, recorridos claros, almacenaje integrado y zonas que permiten distintas velocidades: cocinar, trabajar, descansar, recibir o retirarse.</p>
    <p>En proyectos de reforma, este punto suele ser decisivo. A veces la intervención más potente no es añadir elementos, sino retirar obstáculos para que el espacio recupere proporción.</p>

    <h2>La cocina y el salón como centro flexible</h2>
    <p>Las zonas comunes ya no responden a una única función. Una cocina puede ser lugar de reunión, una mesa puede funcionar como apoyo de trabajo y un salón puede necesitar rincones de silencio. Por eso diseñamos sistemas flexibles, no escenarios rígidos.</p>
    <img src="blog/images/seed-arquitectura-detalle.jpg" alt="Detalle de un espacio doméstico flexible y cálido" />

    <h3>Claves para un espacio común equilibrado</h3>
    <ul>
      <li>Iluminación por capas: general, puntual y ambiental.</li>
      <li>Almacenaje discreto para reducir ruido visual.</li>
      <li>Materiales continuos que conectan sin monotonía.</li>
      <li>Una pieza protagonista, no cinco compitiendo.</li>
    </ul>

    <h2>Arquitectura cercana, decisiones precisas</h2>
    <p>La arquitectura doméstica es profundamente concreta. Importan la altura de un zócalo, la posición de un enchufe, la textura de una encimera y la forma en que una puerta desaparece al abrirse. Es ahí donde un proyecto deja de ser una imagen y empieza a ser una casa.</p>
    <p>Si estás pensando en reformar, puedes ver algunos criterios aplicados en nuestros <a href="https://www.despejalax.es/proyectos">proyectos de arquitectura e interiorismo</a> o calcular una primera orientación con la <a href="https://calculadora.despejalax.es">calculadora de presupuesto</a>.</p>
  `,
  coverImage: 'blog/images/seed-arquitectura-cover.jpg',
  images: [
    'blog/images/seed-arquitectura-luz.jpg',
    'blog/images/seed-arquitectura-materiales.jpg',
    'blog/images/seed-arquitectura-detalle.jpg',
  ],
  author: 'Despeja la X',
  tags: ['Arquitectura', 'Interiorismo', 'Reforma', 'Luz natural'],
  published: true,
  readingTime: 6,
  publishedAt: Timestamp.now(),
  updatedAt: Timestamp.now(),
};

const mode = process.argv[2] ?? 'seed';

const existing = await withRetry('Consulta de post existente', () =>
  db.collection('blog').where('slug', '==', SLUG).limit(1).get()
);

if (mode === 'unseed') {
  if (existing.empty) {
    console.log('No hay post de ejemplo que eliminar.');
  } else {
    await withRetry('Borrado de post seed', () => existing.docs[0].ref.delete());
    await deleteAssets();
    console.log('Post de ejemplo e imágenes eliminados.');
  }
} else {
  await uploadAssets();

  if (!existing.empty) {
    await withRetry('Actualización de post seed', () =>
      existing.docs[0].ref.update(examplePost)
    );
    console.log('Post de ejemplo actualizado:', SLUG);
  } else {
    const ref = await withRetry('Creación de post seed', () =>
      db.collection('blog').add(examplePost)
    );
    await withRetry('Persistencia de id del post seed', () =>
      ref.update({ id: ref.id })
    );
    console.log('Post de ejemplo creado:', SLUG, '->', ref.id);
  }
}

process.exit(0);
