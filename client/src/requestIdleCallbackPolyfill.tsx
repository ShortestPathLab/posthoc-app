if (!("requestIdleCallback" in window)) {
  ///@ts-ignore
  window.requestIdleCallback = (f: () => void) => setTimeout(f);
}
if (!("cancelIdleCallback" in window)) {
  ///@ts-ignore
  window.cancelIdleCallback = (c) => {
    try {
      window.cancelAnimationFrame?.(c);
      window.clearTimeout?.(c);
    } catch (e) {
      console.warn(e);
    }
  };
}
