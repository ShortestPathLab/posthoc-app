if (!("requestIdleCallback" in window)) {
  (window as Window).requestIdleCallback = (f) => setTimeout(f);
}
if (!("cancelIdleCallback" in window)) {
  (window as Window).cancelIdleCallback = (c) => {
    try {
      window.cancelAnimationFrame?.(c);
      window.clearTimeout?.(c);
    } catch (e) {
      console.warn(e);
    }
  };
}
