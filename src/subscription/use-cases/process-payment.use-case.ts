import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';

import { WEBHOOK_EVENT_HANDLERS } from '../constants';
import { Handler } from '../webhook-event-handlers/abstract.handler';

export class ProcessPaymentCommand {
  public constructor(public readonly event: any) {}
}

@CommandHandler(ProcessPaymentCommand)
export class ProcessPaymentCommandHanlder
  implements ICommandHandler<ProcessPaymentCommand>
{
  public constructor(
    @Inject(WEBHOOK_EVENT_HANDLERS)
    private readonly eventHandlers: Handler[],
  ) {}

  public async execute(command: ProcessPaymentCommand) {
    const { event } = command;

    if (this.eventHandlers.length) {
      this.eventHandlers.forEach((handler, idx) => {
        handler.next(
          this.eventHandlers[idx + 1] ? this.eventHandlers[idx + 1] : null,
        );
      });

      await this.eventHandlers[0].handle(event);
    }
  }
}
