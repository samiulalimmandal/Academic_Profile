export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime?: string;
  webViewLink?: string;
  parents?: string[];
}

export type DriveCategory = 'all' | 'folders' | 'pdfs' | 'docs' | 'images';

const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD_BASE = 'https://www.googleapis.com/upload/drive/v3';

export const FOLDER_MIME = 'application/vnd.google-apps.folder';

async function handleDriveResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = `Google Drive request failed (HTTP ${res.status})`;
    try {
      const errJson = (await res.json()) as { error?: { message?: string } };
      if (errJson?.error?.message) {
        message = errJson.error.message;
      }
    } catch {
      // Ignore parse errors
    }
    const err = new Error(message) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }
  if (res.status === 204) {
    return undefined as T;
  }
  return (await res.json()) as T;
}

export async function listDriveFiles(params: {
  accessToken: string;
  folderId?: string;
  searchQuery?: string;
  category?: DriveCategory;
  pageToken?: string;
}): Promise<{ files: DriveFile[]; nextPageToken?: string }> {
  const { accessToken, folderId, searchQuery, category = 'all', pageToken } = params;

  const queryParts: string[] = ['trashed = false'];

  if (searchQuery && searchQuery.trim().length > 0) {
    const escaped = searchQuery.trim().replace(/'/g, "\\'");
    queryParts.push(`name contains '${escaped}'`);
  } else if (folderId) {
    queryParts.push(`'${folderId}' in parents`);
  } else if (category === 'all') {
    queryParts.push(`'root' in parents`);
  }

  if (category === 'folders') {
    queryParts.push(`mimeType = '${FOLDER_MIME}'`);
  } else if (category === 'pdfs') {
    queryParts.push(`mimeType = 'application/pdf'`);
  } else if (category === 'docs') {
    queryParts.push(
      `(mimeType = 'application/vnd.google-apps.document' or mimeType = 'application/vnd.google-apps.spreadsheet' or mimeType = 'application/vnd.google-apps.presentation' or mimeType contains 'wordprocessingml' or mimeType contains 'spreadsheetml')`
    );
  } else if (category === 'images') {
    queryParts.push(`mimeType contains 'image/'`);
  }

  const url = new URL(`${DRIVE_API_BASE}/files`);
  url.searchParams.set('q', queryParts.join(' and '));
  url.searchParams.set('pageSize', '40');
  url.searchParams.set(
    'fields',
    'nextPageToken,files(id,name,mimeType,size,modifiedTime,webViewLink,parents)'
  );
  url.searchParams.set('orderBy', 'folder,modifiedTime desc');
  if (pageToken) {
    url.searchParams.set('pageToken', pageToken);
  }

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return handleDriveResponse<{ files: DriveFile[]; nextPageToken?: string }>(res);
}

export async function createDriveFolder(params: {
  accessToken: string;
  name: string;
  parentId?: string;
}): Promise<DriveFile> {
  const { accessToken, name, parentId } = params;
  const body: Record<string, unknown> = {
    name: name.trim(),
    mimeType: FOLDER_MIME,
  };
  if (parentId && parentId !== 'root') {
    body.parents = [parentId];
  }

  const res = await fetch(`${DRIVE_API_BASE}/files?fields=id,name,mimeType,modifiedTime,webViewLink`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  return handleDriveResponse<DriveFile>(res);
}

export async function uploadBlobToDrive(params: {
  accessToken: string;
  blob: Blob;
  name: string;
  mimeType: string;
  parentId?: string;
}): Promise<DriveFile> {
  const { accessToken, blob, name, mimeType, parentId } = params;

  const metadata: Record<string, unknown> = {
    name,
    mimeType,
  };
  if (parentId && parentId !== 'root') {
    metadata.parents = [parentId];
  }

  const form = new FormData();
  form.append(
    'metadata',
    new Blob([JSON.stringify(metadata)], { type: 'application/json' })
  );
  form.append('file', blob);

  const res = await fetch(
    `${DRIVE_UPLOAD_BASE}/files?uploadType=multipart&fields=id,name,mimeType,size,modifiedTime,webViewLink`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: form,
    }
  );

  return handleDriveResponse<DriveFile>(res);
}

export async function renameDriveFile(params: {
  accessToken: string;
  fileId: string;
  newName: string;
}): Promise<DriveFile> {
  const { accessToken, fileId, newName } = params;
  const res = await fetch(
    `${DRIVE_API_BASE}/files/${encodeURIComponent(fileId)}?fields=id,name,mimeType,size,modifiedTime,webViewLink`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: newName.trim() }),
    }
  );

  return handleDriveResponse<DriveFile>(res);
}

export async function deleteDriveFile(params: {
  accessToken: string;
  fileId: string;
}): Promise<void> {
  const { accessToken, fileId } = params;
  const res = await fetch(`${DRIVE_API_BASE}/files/${encodeURIComponent(fileId)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  await handleDriveResponse<void>(res);
}

export async function downloadDriveFile(params: {
  accessToken: string;
  file: DriveFile;
}): Promise<void> {
  const { accessToken, file } = params;

  let downloadUrl = `${DRIVE_API_BASE}/files/${encodeURIComponent(file.id)}?alt=media`;
  let downloadName = file.name;

  if (file.mimeType.startsWith('application/vnd.google-apps.')) {
    downloadUrl = `${DRIVE_API_BASE}/files/${encodeURIComponent(file.id)}/export?mimeType=application/pdf`;
    if (!downloadName.toLowerCase().endsWith('.pdf')) {
      downloadName = `${downloadName}.pdf`;
    }
  }

  const res = await fetch(downloadUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    throw new Error(`Unable to download "${file.name}" (HTTP ${res.status})`);
  }

  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = downloadName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
}
