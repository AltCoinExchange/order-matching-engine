export interface ICommProvider {
  Start();
  send(topic, msg);
  onMessage(topic, oid);
}
