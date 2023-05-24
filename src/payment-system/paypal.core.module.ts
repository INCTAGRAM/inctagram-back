import { DynamicModule, Global, Module, Provider } from '@nestjs/common';

import type {
  PaypalOptions,
  PaypalAsyncOptions,
  PaypalOptionsFactory,
} from './interfaces';
import { PAYPAL_TOKEN, PAYPAL_OPTIONS_TOKEN } from './constants';
import { createPaypalClient } from './utils/create-paypal-client';

@Global()
@Module({})
export class PaypalCoreModule {
  public static forRoot(options: PaypalOptions): DynamicModule {
    const { clientId, clientSecret } = options;

    const provider: Provider = {
      provide: PAYPAL_TOKEN,
      useValue: createPaypalClient({
        clientId,
        clientSecret,
      }),
    };

    return {
      exports: [provider],
      module: PaypalCoreModule,
      providers: [provider],
    };
  }

  public static forRootAsync(options: PaypalAsyncOptions): DynamicModule {
    const paypalProvider: Provider = {
      inject: [PAYPAL_OPTIONS_TOKEN],
      provide: PAYPAL_TOKEN,
      useFactory: (paypalOptions: PaypalOptions) => {
        return createPaypalClient(paypalOptions);
      },
    };

    return {
      exports: [paypalProvider],
      imports: options.imports,
      module: PaypalCoreModule,
      providers: [...this.createAsyncProviders(options), paypalProvider],
    };
  }

  private static createAsyncProviders(options: PaypalAsyncOptions): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }

    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: <any>options.useClass,
        useClass: <any>options.useClass,
      },
    ];
  }

  private static createAsyncOptionsProvider(
    options: PaypalAsyncOptions,
  ): Provider {
    if (!options.useClass && !options.useFactory && !options.useExisting) {
      throw new Error('No value for provider was found');
    }

    if (options.useFactory) {
      return {
        inject: options.inject || [],
        provide: PAYPAL_OPTIONS_TOKEN,
        useFactory: options.useFactory,
      };
    }

    return {
      inject: [(options.useExisting as any) || (options.useClass as any)],
      provide: PAYPAL_OPTIONS_TOKEN,
      useFactory: (optionsFactory: PaypalOptionsFactory) =>
        optionsFactory.createStripeOptions(),
    };
  }
}
