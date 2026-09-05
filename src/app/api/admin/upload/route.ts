import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { getErrorMessage } from '@/lib/errors';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || !['ADMIN', 'TECHNICAL'].includes(session.role)) {
      return NextResponse.json({ error: 'Không có quyền tải tệp lên' }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const kind = formData.get('kind')?.toString() || 'image';

    if (!file) {
      return NextResponse.json({ error: 'Chưa chọn tệp ảnh nào' }, { status: 400 });
    }

    const imageExtensions = ['.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif'];
    const modelExtensions = ['.glb', '.gltf', '.obj', '.stl'];
    const allowedExtensions = kind === 'model'
      ? modelExtensions
      : [...imageExtensions, ...modelExtensions];
    const ext = path.extname(file.name).toLowerCase();

    if (!allowedExtensions.includes(ext)) {
      return NextResponse.json({
        error: `Định dạng tệp không hợp lệ (${ext}). Chỉ chấp nhận: PNG, JPG, WEBP, SVG, GLB, GLTF, OBJ, STL.`
      }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ensure public/uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadsDir, { recursive: true });

    // Generate clean unique filename
    const cleanBase = path.basename(file.name, ext).replace(/[^a-z0-9]/gi, '_');
    const fileName = `${cleanBase}_${Date.now()}${ext}`;
    const filePath = path.join(uploadsDir, fileName);

    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/${fileName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName
    });

  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error, 'Lỗi lưu tệp ảnh' )}, { status: 500 });
  }
}
