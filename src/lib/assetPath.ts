export function getPublicAssetPath(
  assetPath: string,
  basePath: string = process.env.NEXT_PUBLIC_BASE_PATH ?? ''
): string {
  const cleanBase = basePath.endsWith('/') ? basePath.slice(0, -1) : basePath;
  const cleanAsset = assetPath.startsWith('/') ? assetPath : `/${assetPath}`;
  return `${cleanBase}${cleanAsset}`;
}
