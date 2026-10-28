import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'node:crypto';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { Strip } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateStripDto } from './dto/create-strip.dto.js';

const STRIPS_DIR = join(process.cwd(), 'uploads', 'strips');

@Injectable()
export class StripsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async create(file: Express.Multer.File, dto: CreateStripDto) {
    const id = randomBytes(6).toString('base64url');
    const filePath = join(STRIPS_DIR, `${id}.png`);

    await mkdir(STRIPS_DIR, { recursive: true });
    await writeFile(filePath, file.buffer);

    try {
      const strip = await this.prisma.strip.create({
        data: {
          id,
          caption: dto.caption?.trim() || null,
          frameColor: dto.frameColor.toLowerCase(),
          sizeBytes: file.size,
        },
      });
      return this.toResponse(strip);
    } catch (err) {
      await unlink(filePath).catch(() => {});
      throw err;
    }
  }

  async findOne(id: string) {
    const strip = await this.prisma.strip.findUnique({ where: { id } });
    if (!strip) throw new NotFoundException('Strip not found');
    return this.toResponse(strip);
  }

  /** Only returns a path for IDs that exist in the DB — never trusts the raw param */
  async getFilePath(id: string) {
    const strip = await this.prisma.strip.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!strip) throw new NotFoundException('Strip not found');
    return join(STRIPS_DIR, `${strip.id}.png`);
  }

  private toResponse(strip: Strip) {
    const base = this.config.getOrThrow<string>('PUBLIC_URL');
    return {
      id: strip.id,
      caption: strip.caption,
      frameColor: strip.frameColor,
      imageUrl: `${base}/uploads/strips/${strip.id}.png`,
      downloadUrl: `${base}/strips/${strip.id}/download`,
      createdAt: strip.createdAt,
    };
  }
}