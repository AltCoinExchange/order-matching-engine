export interface ICommProvider {
  Start();
  send(topic, msg);
  subscribeHandler(data);
  onMessage(topic, oid);
}
