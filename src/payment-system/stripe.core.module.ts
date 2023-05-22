import { DynamicModule, Global, Module, Provider } from '@nestjs/common';
import Stripe from 'stripe';

import {
  StripeOptions,
  StripeAsyncOptions,
  StripeOptionsFactory,
} from './interfaces';
import { createStripeClient } from './utils/create-stripe-client';
import { STRIPE_TOKEN, API_VERSION, STRIPE_OPTIONS_TOKEN } from './constants';

@Global()
@Module({})
export class StripeCoreModule {
  public static forRoot(options: StripeOptions): DynamicModule {
    const { apiKey } = options;

    const provider: Provider = {
      provide: STRIPE_TOKEN,
      useValue: new Stripe(apiKey, { apiVersion: API_VERSION }),
    };

    return {
      exports: [provider],
      module: StripeCoreModule,
      providers: [provider],
    };
  }

  public static forRootAsync(options: StripeAsyncOptions): DynamicModule {
    const stripeProvider: Provider = {
      inject: [STRIPE_OPTIONS_TOKEN],
      provide: STRIPE_TOKEN,
      useFactory: (stripeOptions: StripeOptions) => {
        return createStripeClient(stripeOptions);
      },
    };

    return {
      exports: [stripeProvider],
      imports: options.imports,
      module: StripeCoreModule,
      providers: [...this.createAsyncProviders(options), stripeProvider],
    };
  }

  private static createAsyncProviders(options: StripeAsyncOptions): Provider[] {
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
    options: StripeAsyncOptions,
  ): Provider {
    if (!options.useClass && !options.useFactory && !options.useExisting) {
      throw new Error('No value for provider was found');
    }

    if (options.useFactory) {
      return {
        inject: options.inject || [],
        provide: STRIPE_OPTIONS_TOKEN,
        useFactory: options.useFactory,
      };
    }

    return {
      inject: [(options.useExisting as any) || (options.useClass as any)],
      provide: STRIPE_OPTIONS_TOKEN,
      useFactory: (optionsFactory: StripeOptionsFactory) =>
        optionsFactory.createStripeOptions(),
    };
  }
}
