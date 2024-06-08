import { connection, query, crud } from './nodes';

export default function (RED) {
  console.log(RED);
  connection(RED);
  query(RED);
  crud(RED);
}
