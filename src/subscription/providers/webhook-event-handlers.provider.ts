import { Provider } from '@nestjs/common';

import { WEBHOOK_EVENT_HANDLERS } from '../constants';
import { InvoicePaymentSucceededEventHandler } from '../webhook-event-handlers/stripe/invoice-payment-succeded.handler';
import { CheckoutSessinCompletedEventHandler } from '../webhook-event-handlers/stripe/checkoukt-session-completed.handler';

export const webhookEventHandlers = [
  CheckoutSessinCompletedEventHandler,
  InvoicePaymentSucceededEventHandler,
];

export const WebhookEventHandlersProvider: Provider = {
  provide: WEBHOOK_EVENT_HANDLERS,
  useFactory(...handlers) {
    return handlers;
  },
  inject: [...webhookEventHandlers],
};
