import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseFilePipeBuilder,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { CreateStripDto } from './dto/create-strip.dto.js';
import { StripsService } from './strips.service.js';

const MAX_BYTES = 10 * 1024 * 1024;

@Controller('strips')
export class StripsController {
  constructor(private readonly strips: StripsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_BYTES } }))
  create(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({ fileType: 'image/png' })
        .addMaxSizeValidator({ maxSize: MAX_BYTES })
        .build({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY }),
    )
    file: Express.Multer.File,
    @Body() dto: CreateStripDto,
  ) {
    return this.strips.create(file, dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.strips.findOne(id);
  }

  @Get(':id/download')
  async download(@Param('id') id: string, @Res() res: Response) {
    const path = await this.strips.getFilePath(id);
    res.download(path, `lumiere-${id}.png`); // sets Content-Disposition: attachment
  }
}