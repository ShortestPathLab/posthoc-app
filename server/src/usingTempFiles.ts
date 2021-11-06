import tempy from "tempy";

const { task: temp } = tempy.file;

export async function usingTempFiles<T>(
  task: (a: string, b: string) => Promise<T>
) {
  return temp(async (a) => temp(async (b) => await task(a, b)));
}
