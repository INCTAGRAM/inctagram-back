import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CommandBus } from '@nestjs/cqrs';
import { FileInterceptor } from '@nestjs/platform-express';

import {
  API,
  FILE_FIELD,
  MIN_AVATAR_HEIGHT,
  MIN_AVATAR_WIDTH,
} from 'src/common/constants';

import { UserRepository } from '../repositories/user.repository';
import { MinimizeImagePipe } from 'src/common/pipes/minimize-image.pipe';
import { ActiveUser } from 'src/common/decorators/active-user.decorator';
import { UploadAvatarCommand } from '../use-cases/upload-avatar.use-case';
import { ImageValidationPipe } from 'src/common/pipes/image-validation.pipe';
import {
  CheckUserProfileDecorator,
  UploadUserAvatarApiDecorator,
} from 'src/common/decorators/swagger/users.decorator';
import { JwtAtGuard } from '../../common/guards/jwt-auth.guard';
import { ProfileQueryRepository } from '../repositories/profile.query-repository';
import { ActiveUserData } from '../types';

@ApiTags('Users')
@UseGuards(JwtAtGuard)
@Controller(API.USERS)
export class UsersController {
  public constructor(
    private readonly usersRepository: UserRepository,
    private readonly commandBus: CommandBus,
    private readonly profileQueryRepository: ProfileQueryRepository,
  ) {}

  @Post(':id/images/avatar')
  @UploadUserAvatarApiDecorator()
  @UseInterceptors(FileInterceptor(FILE_FIELD))
  public async uploadAvatar(
    @ActiveUser('userId') userId: string,
    @Param('id') id: string,
    @UploadedFile(
      ImageValidationPipe({
        fileType: '.(png|jpeg|jpg)',
        minHeight: MIN_AVATAR_HEIGHT,
        minWidth: MIN_AVATAR_WIDTH,
      }),
      MinimizeImagePipe,
    )
    file: Express.Multer.File,
  ) {
    if (!(userId === id)) throw new UnauthorizedException();

    const user = await this.usersRepository.findUserById(id);

    if (!user || !user.emailConfirmation?.isConfirmed)
      throw new NotFoundException();

    const { url, previewUrl } = await this.commandBus.execute(
      new UploadAvatarCommand(userId, file),
    );

    return { url, previewUrl };
  }
  @Get(':id/create-account')
  @CheckUserProfileDecorator()
  async checkUserProfile(@Param('id') id: string) {
    const user = await this.usersRepository.findUserById(id);

    if (!user || !user.emailConfirmation?.isConfirmed)
      throw new NotFoundException('User was not found');

    const profile = await this.profileQueryRepository.findUserProfileById(id);
    if (profile) throw new BadRequestException('Profile already created');

    const username = user.username;
    return { username };
  }
}
