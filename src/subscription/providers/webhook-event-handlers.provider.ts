import { Provider } from '@nestjs/common';

import { WEBHOOK_EVENT_HANDLERS } from '../constants';

export const webhookEventHandlers = [];

export const WebhookEventHandlersProvider: Provider = {
  provide: WEBHOOK_EVENT_HANDLERS,
  useFactory(...handlers) {
    return handlers;
  },
  inject: [...webhookEventHandlers],
};
