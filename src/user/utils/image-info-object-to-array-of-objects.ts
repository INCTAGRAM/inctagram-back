import type { ImageInfoDto } from '../dto/image-info.dto';
import type { ImageInfo } from '../types';

export const imageInfoObjectToArrayOfObjects = (value: ImageInfoDto) => {
  console.log(value);
  const result = (
    Object.entries(value)
      .map((v: [string, any]) => [v[0], v[1].length])
      .sort((a, b) => b[1].length - a[1].length)[0] ?? []
  ).map((_, idx) =>
    Object.fromEntries(
      Object.keys(value).reduce((acc: [string, any][], key) => {
        value[key as keyof ImageInfoDto][idx] &&
          acc.push([key, value[key as keyof ImageInfoDto][idx]]);

        return acc;
      }, []),
    ),
  );

  return result as ImageInfo[];
};
