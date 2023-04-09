import {
  Controller,
  NotFoundException,
  Param,
  Post,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { CommandBus } from '@nestjs/cqrs';

import {
  API,
  FILE_FIELD,
  MIN_AVATAR_HEIGHT,
  MIN_AVATAR_WIDTH,
} from 'src/common/constants';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { UserRepository } from '../repositories/user.repository';
import { MinimizeImagePipe } from 'src/common/pipes/minimize-image.pipe';
import { ActiveUser } from 'src/common/decorators/active-user.decorator';
import { ImageValidationPipe } from 'src/common/pipes/image-validation.pipe';
import { UploadAvatarCommand } from '../use-cases/upload-avatar.use-case';

@ApiTags('Users')
@UseGuards(JwtAuthGuard)
@Controller(API.USERS)
export class UsersController {
  public constructor(
    private readonly usersRepository: UserRepository,
    private readonly commandBus: CommandBus,
  ) {}

  @Post(':id/images/avatar')
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

    if (!user) throw new NotFoundException();

    const { url, previewUrl } = await this.commandBus.execute(
      new UploadAvatarCommand(userId, file),
    );

    return { url, previewUrl };
  }
}
