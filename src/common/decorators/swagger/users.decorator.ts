import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { MIN_AVATAR_HEIGHT, MIN_AVATAR_WIDTH } from 'src/common/constants';
import { FieldError } from 'src/types';
import { ConfirmationCodeDto } from '../../../auth/dto/confirmation-code.dto';
import { CreateUserProfileDto } from '../../../user/dto/create.user.profile.dto';

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

export function CheckUserProfileDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: 'Check if user profile exists',
    }),
    ApiResponse({
      status: 200,
      description: 'Success',
      schema: {
        type: 'object',
        example: {
          username: 'James_Bond',
        },
      },
    }),
    ApiBadRequestResponse({
      description: 'If user profile already exists',
      type: FieldError,
    }),
    ApiNotFoundResponse({
      description: 'User with such id was not found',
      type: FieldError,
    }),
    ApiUnauthorizedResponse({
      description: 'JWT accessToken is missing, expired or incorrect',
    }),
    ApiBearerAuth(),
  );
}

export function CreateUserProfileDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: 'Create user profile',
    }),
    ApiBody({
      schema: {
        type: 'object',
        required: ['name', 'surname', 'city'],
        properties: {
          name: {
            type: 'string',
            minimum: 1,
            maximum: 40,
            example: 'James',
          },
          surname: {
            type: 'string',
            minimum: 1,
            maximum: 40,
            example: 'Bond',
          },
          birthday: {
            type: 'Date',
            example: '007 - 007 - 007',
          },
          city: {
            type: 'string',
            minimum: 1,
            maximum: 60,
            example: 'London',
          },
          aboutMe: {
            type: 'string',
            minimum: 1,
            maximum: 200,
            example: 'Bond, James Bond...',
          },
        },
      },
    }),
    ApiCreatedResponse({
      status: 201,
      description: 'User account has been created',
    }),
    ApiBadRequestResponse({
      description: 'If the InputModel has incorrect values',
      type: FieldError,
    }),
    ApiNotFoundResponse({
      description: 'User with such id was not found',
      type: FieldError,
    }),
    ApiUnauthorizedResponse({
      description: 'JWT accessToken is missing, expired or incorrect',
    }),
    ApiForbiddenResponse({
      description:
        'If user tries to create a account that does not belongs to him',
    }),
    ApiBearerAuth(),
  );
}
