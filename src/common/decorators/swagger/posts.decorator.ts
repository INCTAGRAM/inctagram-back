import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNoContentResponse,
  ApiOperation,
  ApiProperty,
} from '@nestjs/swagger';
import { Ratio } from '@prisma/client';
import { CreatePostResponse } from 'src/user/types/swagger';

const deletePost = DeletePostApiDecorator;
const createPost = CreatePostApiDecorator;
const updatePost = UpdatePostApiDecorator;

export function DeletePostApiDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: 'Delete user post',
    }),
    ApiNoContentResponse({
      description: 'Post has been successfully deleted',
    }),
    ApiInternalServerErrorResponse({
      description: 'An error occurs when attempting to delete the post.',
    }),
    ApiBearerAuth(),
  );
}

class CropInfo {
  @ApiProperty({ required: true })
  public x: number;

  @ApiProperty({ required: true })
  public y: number;

  @ApiProperty({ required: true })
  public width: number;

  @ApiProperty({ required: true })
  public height: number;
}

class CreatePostRequestBody {
  @ApiProperty({
    type: 'array',
    items: { type: 'string', format: 'binary' },
    required: true,
  })
  public files: string[];

  @ApiProperty({
    type: 'array',
    required: false,
    items: { type: 'number', minimum: 0, maximum: 1 },
  })
  public zoom: number[];

  @ApiProperty({ type: 'array', required: false, items: { type: 'string' } })
  public filters: string[];

  @ApiProperty({
    type: () => [CropInfo],
    required: false,
  })
  public cropInfo: CropInfo[];

  @ApiProperty({
    required: false,
    type: 'array',
    items: {
      type: 'Ratio',
      default: Ratio.SQUARE,
    },
  })
  public ratio: Ratio[];
}

export function CreatePostApiDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: 'Create user post',
    }),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      description: 'File to upload',
      type: CreatePostRequestBody,
    }),
    ApiCreatedResponse({
      description: 'Post has been successfully created',
      type: CreatePostResponse,
    }),
    ApiInternalServerErrorResponse({
      description: 'An error occurs when attempting to create the post.',
    }),
    ApiBearerAuth(),
  );
}

export function UpdatePostApiDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: 'Update user post',
    }),
    ApiNoContentResponse({
      description: 'Post has been successfully updated',
    }),
    ApiInternalServerErrorResponse({
      description: 'An error occurs when attempting to update the post.',
    }),
    ApiBearerAuth(),
  );
}
