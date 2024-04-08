export type MessageRequest<TBody = any> = {
  name: string
  body?: TBody
  relayed?: true
}
