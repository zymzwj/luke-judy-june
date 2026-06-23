import { useEffect } from "react";

export default function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.08 }
    );

    const mutation = new MutationObserver(() => {
      document.querySelectorAll(".reveal:not(.visible)").forEach((el) => observer.observe(el));
    });

    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    mutation.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutation.disconnect();
    };
  }, []);
}
