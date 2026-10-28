import { IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class CreateStripDto {
  @IsOptional()
  @IsString()
  @MaxLength(24)
  caption?: string;

  @Matches(/^#[0-9a-fA-F]{6}$/, {
    message: 'frameColor must be a hex colour like #ffffff',
  })
  frameColor!: string;
}