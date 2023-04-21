import type {
  Avatar,
  Image,
  ImageCropInfo,
  ImageMetadata,
  Post,
  Profile,
  User,
} from '@prisma/client';
import { CropInfo } from '../dto/image-info.dto';

export interface UserWithEmailConfirmation extends User {
  emailConfirmation: {
    confirmationCode: string;
    expirationDate: string;
    isConfirmed: boolean;
  } | null;
}

export interface UserWithPasswordRecovery extends User {
  passwordRecovery: {
    recoveryCode: string | null;
    expirationDate: string | null;
  } | null;
}

export interface ActiveUserData {
  userId: string;
  username: string;
  deviceId: string;
}

export type AvatarPayload = Pick<
  Avatar,
  'height' | 'width' | 'url' | 'previewUrl' | 'size'
>;

export type ProfileDbModel = {
  profile: Pick<
    Profile,
    'aboutMe' | 'birthday' | 'city' | 'name' | 'surname'
  > | null;
  username: string;
  avatar: Pick<Avatar, 'url' | 'previewUrl'> | null;
};

export type ProfileViewModel = Omit<
  Profile,
  'updatedAt' | 'id' | 'createdAt' | 'userId' | 'birthday'
> & { birthday: string | null } & {
  avatar: Pick<Avatar, 'url' | 'previewUrl'>;
} & Pick<User, 'username'>;

export type ImageCreationData = Pick<Image, 'previewUrl' | 'url'> & {
  metadata: Pick<
    ImageMetadata,
    'filters' | 'height' | 'size' | 'width' | 'ratio' | 'zoom'
  >;
} & {
  cropInfo: Pick<ImageCropInfo, 'height' | 'width' | 'x' | 'y'>;
};

export interface ImageInfo {
  zoom: number;
  ratio: Ratio;
  filters: string[];
  cropInfo: CropInfo;
}

export type CreatePostResult = Post & {
  images: (Image & {
    metadata:
      | (ImageMetadata & {
          cropInfo: ImageCropInfo | null;
        })
      | null;
  })[];
};

export enum Ratio {
  ORIGINAL = 'ORIGINAL',
  PORTRAIT = 'PORTRAIT',
  LANDSCAPE = 'LANDSCAPE',
  SQUARE = 'SQUARE',
}
