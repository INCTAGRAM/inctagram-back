export interface StripeEvent<T> {
  id: string;
  object: 'event';
  api_version: string;
  created: number;
  data: {
    object: T;
  };
  livemode: boolean;
  pending_webhooks: number;
  request: {
    id: string;
    idempotency_key: string;
  };
  type: string;
}

export interface StripeCheckoutSessionObject {
  id: string;
  object: 'checkout.session';
  metadata: { paymentId: string };
  mode: 'payment' | 'subscription';
  payment_status: 'paid';
  status: 'complete';
  subscription: string | null;
}

export interface StripeInvoiceObject {
  id: string;
  object: 'invoice';
  status: string;
  subscription: string;
}

export interface PayPalEvent<T> {
  id: string;
  event_version: string;
  create_time: string;
  resource_type: string;
  resource_version: string;
  event_type: string;
  summary: string;
  resource: T;
  links: Array<{ href: string; rel: string; method: string }>;
}

export interface PaypalPaymentResource {
  create_time: string;
  purchase_units: Array<any>;
  links: Array<{ href: string; rel: string; method: string }>;
  id: string;
  payment_source: { paypal: {} };
  intent: string;
  payer: {
    name: { [key: string]: string };
    email_address: string;
    payer_id: string;
    address: { [key: string]: string };
  };
  status: string;
}

export interface PaypalSubscriptionResource {
  quantity: string;
  subscriber: {
    email_address: string;
    payer_id: string;
    name: unknown; // Update with appropriate type for the "name" object
    shipping_address: unknown; // Update with appropriate type for the "shipping_address" object
  };
  create_time: string;
  custom_id: string;
  plan_overridden: boolean;
  shipping_amount: {
    currency_code: string;
    value: string;
  };
  start_time: string;
  update_time: string;
  billing_info: {
    outstanding_balance: unknown; // Update with appropriate type for the "outstanding_balance" object
    cycle_executions: unknown[]; // Update with appropriate type for the "cycle_executions" array
    last_payment: unknown; // Update with appropriate type for the "last_payment" object
    next_billing_time: string;
    failed_payments_count: number;
  };
  links: unknown[]; // Update with appropriate type for the "links" array
  id: string;
  plan_id: string;
  status: string;
  status_update_time: string;
}
