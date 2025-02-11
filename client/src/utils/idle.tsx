export const idle = (
  f: () => void | Promise<void>,
  wait?: number
): Promise<void> =>
  new Promise<void>((res) =>
    requestIdleCallback(
      async () => {
        await f();
        res();
      },
      { timeout: wait }
    )
  );
