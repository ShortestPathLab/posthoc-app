import { build } from "esbuild";
import tempy from "tempy";
import { readFile } from "fs/promises";

const { task } = tempy.file;

export async function bundle(inFile: string, globalName: string = "bundle") {
  return await task(async (outfile) => {
    await build({
      entryPoints: [inFile],
      bundle: true,
      outfile,
      minify: true,
      globalName,
    });
    return await readFile(outfile, "utf-8");
  });
}
