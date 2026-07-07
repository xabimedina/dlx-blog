# dlx-blog

Blog público de **Despeja la X** (estudio de arquitectura e interiorismo).
Repositorio independiente de `dlx-web`, construido con el mismo lenguaje de
diseño (`@xabimedina/dlx-components`) y la misma infraestructura de Firebase.

## Stack

- **Next.js 16** (App Router) + React 19 + TypeScript
- **Tailwind CSS v4** + tema de `@xabimedina/dlx-components` (tokens jet/smoke/saffron)
- **Firebase Admin SDK** (server-only) para leer Firestore + Storage
- Fuentes locales Montserrat / Kanit

## Origen del contenido

Los artículos viven en la colección **`blog`** de Firestore (el mismo proyecto
de Firebase que `dlx-web`). El alta/edición se gestiona desde **`dlx-admin`**
(sección "Blog"), que guarda el contenido enriquecido como **HTML** y sube las
imágenes a Storage bajo `blog/images/`.

### Modelo del documento (`blog`)

```ts
{
  slug: string;          // único, URL-friendly
  title: string;
  excerpt: string;       // resumen para listado + meta description
  content: string;       // HTML (editor WYSIWYG)
  coverImage: string;    // path de Storage → URL estable del blog al renderizar
  images: string[];      // galería opcional (paths de Storage)
  author: string;
  tags: string[];
  published: boolean;
  publishedAt: Timestamp;
  updatedAt: Timestamp;
  readingTime?: number;  // opcional; se estima si falta
}
```

## Rutas

| Ruta            | Descripción                          |
| --------------- | ------------------------------------ |
| `/`             | Listado de artículos (ISR 1800s)     |
| `/blog`         | Redirige a `/`                       |
| `/blog/[slug]`  | Detalle del artículo (ISR 1800s)     |
| `/api/blog-image/[...path]` | Imágenes estables del blog |
| `/sitemap.xml`  | Sitemap dinámico                     |
| `/robots.txt`   | Robots                               |

## Variables de entorno

Copia el `.env` de `dlx-web` (mismas credenciales de Firebase):

```
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
PRIVATE_KEY=...
CLIENT_EMAIL=...
NPM_TOKEN=...   # para instalar @xabimedina/dlx-components desde GitHub Packages
```

`SITE.url` apunta al dominio de producción `https://blog.despejalax.es`.

## Desarrollo

```bash
npm install      # requiere NPM_TOKEN en el entorno (o en .env)
npm run dev      # http://localhost:3000
npm run build
npm run lint
```
