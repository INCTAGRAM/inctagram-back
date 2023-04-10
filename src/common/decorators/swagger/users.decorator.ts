import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { MIN_AVATAR_HEIGHT, MIN_AVATAR_WIDTH } from 'src/common/constants';
import { FieldError } from 'src/types';

export function UploadUserAvatarApiDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: 'Upload user avatar with preview',
    }),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      description: 'File to upload',
      required: true,
      schema: {
        type: 'object',
        properties: {
          file: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    }),
    ApiBearerAuth(),
    ApiCreatedResponse({
      status: 201,
      description: 'User avatar has been successfuly uploaded',
      schema: {
        type: 'object',
        example: {
          url: 'https://cloud.image.png',
          previewUrl: 'https://cloud.preview.image.png',
        },
      },
    }),
    ApiBadRequestResponse({
      description: `If the InputModel has incorrect values \n
    1. Image dimensions are less than ${MIN_AVATAR_WIDTH}px x ${MIN_AVATAR_HEIGHT}px \n
    2. Wrong format (png, jpeg, jpg are allowed) \n
    3. Image size > 2Mb
    `,
      type: FieldError,
    }),
    ApiNotFoundResponse({
      description: 'User with such id was not found',
      type: FieldError,
    }),
    ApiInternalServerErrorResponse({
      description: 'Could not upload a file',
      type: FieldError,
    }),
  );
}
