import { Provider } from '@nestjs/common';

import { WEBHOOK_EVENT_HANDLERS } from '../constants';
import { CheckoutSessinCompletedEventHandler } from '../webhook-event-handlers/stripe/checkoukt-session-completed.handler';

export const webhookEventHandlers = [CheckoutSessinCompletedEventHandler];

export const WebhookEventHandlersProvider: Provider = {
  provide: WEBHOOK_EVENT_HANDLERS,
  useFactory(...handlers) {
    return handlers;
  },
  inject: [...webhookEventHandlers],
};
