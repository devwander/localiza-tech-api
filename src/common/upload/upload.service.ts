import { Injectable } from '@nestjs/common';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

@Injectable()
export class UploadService {
  private readonly uploadDir = join(process.cwd(), 'uploads', 'stores');

  async uploadImage(file: UploadedFile): Promise<string> {
    // Criar diretório se não existir
    if (!existsSync(this.uploadDir)) {
      await mkdir(this.uploadDir, { recursive: true });
    }

    // Validar tipo de arquivo
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedMimes.includes(file.mimetype)) {
      throw new Error('Tipo de arquivo não permitido. Use JPEG, PNG, GIF ou WebP.');
    }

    // Validar tamanho (3MB max)
    const maxSize = 3 * 1024 * 1024; // 3MB
    if (file.size > maxSize) {
      throw new Error('Arquivo muito grande. Tamanho máximo: 3MB.');
    }

    // Gerar nome único para o arquivo
    const fileExtension = file.originalname.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    const filePath = join(this.uploadDir, fileName);

    // Salvar arquivo
    await writeFile(filePath, file.buffer);

    // Retornar URL relativa
    return `/uploads/stores/${fileName}`;
  }

  async uploadBase64Image(base64String: string): Promise<string> {
    // Remover prefixo data:image/...;base64,
    const matches = base64String.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!matches) {
      console.error('UploadService: String base64 inválida');
      throw new Error('String base64 inválida');
    }

    const [, extension, data] = matches;
    const buffer = Buffer.from(data, 'base64');

    // Validar tamanho
    const maxSize = 3 * 1024 * 1024; // 3MB
    if (buffer.length > maxSize) {
      console.error('UploadService: Arquivo muito grande');
      throw new Error('Arquivo muito grande. Tamanho máximo: 3MB.');
    }

    // Criar diretório se não existir
    if (!existsSync(this.uploadDir)) {
      await mkdir(this.uploadDir, { recursive: true });
    }

    // Gerar nome único para o arquivo
    const fileName = `${uuidv4()}.${extension}`;
    const filePath = join(this.uploadDir, fileName);

    // Salvar arquivo
    await writeFile(filePath, buffer);

    // Retornar URL relativa
    const url = `/uploads/stores/${fileName}`;
    return url;
  }
}
