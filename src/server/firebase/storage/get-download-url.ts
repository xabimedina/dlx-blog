import { storage } from '../config';

/**
 * Obtiene la URL de descarga firmada de un archivo dado su path en Firebase Storage.
 * @param filePath El path completo del archivo (ej: "blog/images/post.png").
 * @returns Una promesa que resuelve con la URL firmada.
 */
export async function getDownloadUrl(filePath: string): Promise<string> {
  const file = storage.file(filePath);

  const options = {
    action: 'read' as const,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 días
  };

  try {
    const [url] = await file.getSignedUrl(options);
    return url;
  } catch (error) {
    console.error(
      `Error al obtener la URL de descarga para ${filePath}:`,
      error
    );
    throw new Error(
      `No se pudo obtener la URL de descarga para el archivo: ${filePath}`,
      { cause: error }
    );
  }
}
