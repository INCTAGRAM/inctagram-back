import { Metadata } from 'sharp';
import type { PrismaService } from 'src/prisma/prisma.service';

export type ImageMetadataType = {
  [key in keyof Pick<Metadata, 'size' | 'width' | 'height'>]-?: Exclude<
    Metadata[key],
    undefined
  > | null;
};

export type PrismaTransactionType = Omit<
  PrismaService,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use'
>;
