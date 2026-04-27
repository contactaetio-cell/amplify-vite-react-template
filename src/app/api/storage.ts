import { getUrl, uploadData } from 'aws-amplify/storage';

const EXTRACTION_UPLOAD_PREFIX = 'uploads/extraction';

function sanitizeFileName(fileName: string): string {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
}

export async function uploadExtractionFileToS3(user: string, files: File[]): Promise<string[]> {
  const uploads = await Promise.all(
    files.map(async (file) => {
      const safeFileName = sanitizeFileName(file.name || 'upload.bin');
      const path = `${EXTRACTION_UPLOAD_PREFIX}/${user}/${crypto.randomUUID()}-${safeFileName}`;

      await uploadData({
        path,
        data: file,
        options: {
          contentType: file.type || 'application/octet-stream',
        },
      }).result;

      const { url } = await getUrl({ path });
      return url.toString();
    })
  );

  return uploads;
}

export async function resolveStorageUrl(location: string): Promise<string> {
  if (!location.startsWith('s3://')) return location;

  const withoutScheme = location.slice('s3://'.length);
  const firstSlashIndex = withoutScheme.indexOf('/');
  const rawPath = firstSlashIndex >= 0 ? withoutScheme.slice(firstSlashIndex + 1) : withoutScheme;
  const path = decodeURIComponent(rawPath);
  const { url } = await getUrl({ path });
  return url.toString();
}
