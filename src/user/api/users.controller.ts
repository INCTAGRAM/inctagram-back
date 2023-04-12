import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Post,
  Put,
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

import { MinimizeImagePipe } from 'src/common/pipes/minimize-image.pipe';
import { ActiveUser } from 'src/common/decorators/active-user.decorator';
import { UploadAvatarCommand } from '../use-cases/upload-avatar.use-case';
import { ImageValidationPipe } from 'src/common/pipes/image-validation.pipe';
import {
  CreateProfileApiDecorator,
  GetProfileApiDecorator,
  UpdateProfileApiDecorator,
  UploadUserAvatarApiDecorator,
} from 'src/common/decorators/swagger/users.decorator';
import { JwtAtGuard } from '../../common/guards/jwt-auth.guard';
import { ProfileQueryRepository } from '../repositories/profile.query-repository';
import { CreateUserProfileDto } from '../dto/create.user.profile.dto';
import { CreateProfileCommand } from '../use-cases/create-profile.use-case';
import { ProfileMapper } from '../utils/ProfileMappter';
import { ConfirmationGuard } from 'src/common/guards/confirmation.guard';
import { UpdateProfileCommand } from '../use-cases/update-avatar.use-case';
import { UpdateUserProfileDto } from '../dto/update-user-profile.dto';

@ApiTags('Users')
@UseGuards(JwtAtGuard, ConfirmationGuard)
@Controller(API.USERS)
export class UsersController {
  public constructor(
    private readonly commandBus: CommandBus,
    private readonly profileQueryRepository: ProfileQueryRepository,
  ) {}

  @Post('self/images/avatar')
  @UploadUserAvatarApiDecorator()
  @UseInterceptors(FileInterceptor(FILE_FIELD))
  public async uploadAvatar(
    @ActiveUser('userId') userId: string,
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
    const { url, previewUrl } = await this.commandBus.execute(
      new UploadAvatarCommand(userId, file),
    );

    return { url, previewUrl };
  }

  @Get('self/profile')
  @GetProfileApiDecorator()
  public async getProfile(@ActiveUser('userId') id: string) {
    const profile = await this.profileQueryRepository.findByUserId(id);

    if (!profile) throw new NotFoundException();

    return ProfileMapper.toViewModel(profile);
  }

  @Post('self/profile')
  @CreateProfileApiDecorator()
  async createProfile(
    @Body() createUserProfileDto: CreateUserProfileDto,
    @ActiveUser('userId') id: string,
  ) {
    return this.commandBus.execute(
      new CreateProfileCommand(id, createUserProfileDto),
    );
  }

  @Put('self/profile')
  @UpdateProfileApiDecorator()
  public async updateProfile(
    @Body() updateUserProfileDto: UpdateUserProfileDto,
    @ActiveUser('userId') id: string,
  ) {
    return this.commandBus.execute(
      new UpdateProfileCommand(id, updateUserProfileDto),
    );
  }
}
