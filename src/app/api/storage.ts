import { getUrl, uploadData } from 'aws-amplify/storage';

const EXTRACTION_UPLOAD_PREFIX = 'uploads/extraction';

function sanitizeFileName(fileName: string): string {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
}

export interface UploadedS3Object {
  path: string;
  url: string;
}

export async function uploadExtractionFileToS3(file: File): Promise<UploadedS3Object> {
  const safeFileName = sanitizeFileName(file.name || 'upload.bin');
  const path = `${EXTRACTION_UPLOAD_PREFIX}/${crypto.randomUUID()}-${safeFileName}`;

  await uploadData({
    path,
    data: file,
    options: {
      contentType: file.type || 'application/octet-stream',
    },
  }).result;

  const { url } = await getUrl({ path });

  return {
    path,
    url: url.toString(),
  };
}
