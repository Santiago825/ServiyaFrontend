const AVATAR_POR_DEFECTO = 'assets/img/default-avatar.png';

/**
 * Convierte la foto en base64 que manda el backend en una URL usable en <img>.
 * Acepta también una URL "data:" ya armada. Sin foto devuelve `porDefecto`.
 */
export function fotoSrc(
  base64: string | null | undefined,
  porDefecto: string | null = AVATAR_POR_DEFECTO
): string | null {
  if (!base64) {
    return porDefecto;
  }
  return base64.startsWith('data:image') ? base64 : `data:image/jpeg;base64,${base64}`;
}
