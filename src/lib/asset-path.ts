const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function assetPath(src: string): string {
  return `${basePath}${src}`;
}
