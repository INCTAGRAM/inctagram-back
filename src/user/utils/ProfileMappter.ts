import type { ProfileDbModel, ProfileViewModel } from '../types';
import { format, parseISO } from 'date-fns';

export class ProfileMapper {
  public static toViewModel(model: ProfileDbModel | null): ProfileViewModel {
    return {
      username: model?.username ?? '',
      name: model?.profile?.name ?? '',
      surname: model?.profile?.surname ?? '',
      aboutMe: model?.profile?.aboutMe ?? null,
      city: model?.profile?.city ?? '',
      birthday: model?.profile?.birthday
        ? format(
            parseISO(model.profile.birthday.toISOString()),
            'yyyy-MM-dd',
          ) ?? null
        : null,
      avatar: {
        url: model?.avatar?.url ?? null,
        previewUrl: model?.avatar?.previewUrl ?? null,
      },
    };
  }
}
