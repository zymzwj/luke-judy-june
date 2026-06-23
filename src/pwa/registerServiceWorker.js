export function registerServiceWorker() {
  if (!("serviceWorker" in navigator) || !location.protocol.startsWith("http")) return;

  navigator.serviceWorker.addEventListener("controllerchange", () => {
    window.location.reload();
  });

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js")
      .then(reg => console.log("[PWA] SW registered:", reg.scope))
      .catch(err => console.warn("[PWA] SW failed:", err));
  });
}
