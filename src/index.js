import { connection, query, crud } from './nodes';

export default function (RED) {
  connection(RED);
  query(RED);
  crud(RED);
}
