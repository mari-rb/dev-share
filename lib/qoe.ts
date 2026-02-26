export function dispatchQoeStep(flow: string, step: string) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("qoe:step", {
        detail: {
          flow,
          step,
          timestamp: performance.now(),
        },
      })
    )
  }
}
