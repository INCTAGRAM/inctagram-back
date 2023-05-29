import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

function Validator(property: string, validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'ValiateIfOtherNotExists',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(_: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];
          return relatedValue === undefined;
        },
      },
    });
  };
}

export const ValidateIfOtherNotExists = (property: string) =>
  Validator(property, {
    message({ constraints, property }) {
      return `both ${constraints[0]} and ${property} can not be send together`;
    },
  });
