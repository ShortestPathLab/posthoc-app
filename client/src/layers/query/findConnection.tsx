import { find } from "lodash-es";
import { Connection } from "slices/connections";

export async function findConnection(
  connections: Connection[],
  algorithm: string,
  format: string
) {
  for (const connection of connections) {
    const algorithms = await connection.transport().call("features/algorithms");
    const formats = await connection.transport().call("features/formats");
    if (find(algorithms, { id: algorithm }) && find(formats, { id: format })) {
      return connection;
    }
  }
}
