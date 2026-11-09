/* Afnan Bin Abbas — portfolio interactions. No dependencies. */
(() => {
  "use strict";

  const nav = document.getElementById("nav");
  const toggle = document.getElementById("nav-toggle");
  const menu = document.getElementById("nav-menu");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* nav: scroll state -------------------------------------------------- */
  const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 10);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* nav: mobile menu --------------------------------------------------- */
  const setMenu = (open) => {
    nav.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
  };

  toggle.addEventListener("click", () => setMenu(toggle.getAttribute("aria-expanded") !== "true"));
  menu.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setMenu(false)));

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && nav.classList.contains("open")) {
      setMenu(false);
      toggle.focus();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 760) setMenu(false);
  });

  /* reveal on scroll --------------------------------------------------- */
  const revealItems = [...document.querySelectorAll("[data-reveal]")];
  revealItems.forEach((item) => {
    const siblings = [...item.parentElement.children].filter((el) => el.hasAttribute("data-reveal"));
    item.dataset.delay = String(siblings.indexOf(item) * 80);
  });

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  } else {
    const revealer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.style.transitionDelay = `${entry.target.dataset.delay || 0}ms`;
          entry.target.classList.add("is-visible");
          revealer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    revealItems.forEach((item) => revealer.observe(item));
  }

  /* active section in nav ---------------------------------------------- */
  const navLinks = [...menu.querySelectorAll('a[href^="#"]')];
  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          navLinks.forEach((link) => {
            const match = link.getAttribute("href") === `#${entry.target.id}`;
            if (match) link.setAttribute("aria-current", "true");
            else link.removeAttribute("aria-current");
          });
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach((section) => spy.observe(section));
  }

  /* hero pointer glow -------------------------------------------------- */
  const hero = document.querySelector(".hero");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (hero && finePointer && !reduceMotion) {
    let frame = 0;
    hero.addEventListener("pointermove", (event) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        const box = hero.getBoundingClientRect();
        hero.style.setProperty("--mx", `${((event.clientX - box.left) / box.width) * 100}%`);
        hero.style.setProperty("--my", `${((event.clientY - box.top) / box.height) * 100}%`);
        frame = 0;
      });
    });
  }

  /* copy email --------------------------------------------------------- */
  const copyBtn = document.getElementById("copy-email");
  const status = document.getElementById("copy-status");

  const legacyCopy = (text) => {
    const field = document.createElement("textarea");
    field.value = text;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.opacity = "0";
    document.body.appendChild(field);
    field.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch (_) {
      ok = false;
    }
    field.remove();
    return ok;
  };

  if (copyBtn && status) {
    let timer = 0;
    copyBtn.addEventListener("click", async () => {
      const email = copyBtn.dataset.email || "";
      let ok = false;
      try {
        await navigator.clipboard.writeText(email);
        ok = true;
      } catch (_) {
        ok = legacyCopy(email);
      }
      status.textContent = ok ? "Copied to clipboard." : "Copy blocked. Address is above.";
      clearTimeout(timer);
      timer = window.setTimeout(() => {
        status.textContent = "";
      }, 2600);
    });
  }

  /* booking ------------------------------------------------------------ */
  const booking = document.getElementById("booking-form");
  if (booking) {
    const dateInput = document.getElementById("bk-date");
    const serviceInput = document.getElementById("bk-service");
    const nameInput = document.getElementById("bk-name");
    const bookStatus = document.getElementById("book-status");
    const pad = (n) => String(n).padStart(2, "0");
    const isoLocal = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

    const today = new Date();
    const horizon = new Date();
    horizon.setDate(horizon.getDate() + 60);
    dateInput.min = isoLocal(today);
    dateInput.max = isoLocal(horizon);

    document.querySelectorAll(".service-pick").forEach((button) => {
      button.addEventListener("click", () => {
        serviceInput.value = button.dataset.service;
        booking.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
        if (nameInput) nameInput.focus({ preventScroll: true });
      });
    });

    booking.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!booking.reportValidity()) return;

      const data = new FormData(booking);
      const lines = [
        `Name: ${data.get("name")}`,
        `Email: ${data.get("email")}`,
        `Service: ${data.get("service")}`,
        `Preferred date: ${data.get("date")}`,
        `Preferred time: ${data.get("time")} PKT (UTC+5)`,
        "",
        "Scope:",
        data.get("notes") || "(not provided)",
      ];
      const subject = `Session request — ${data.get("service")}`;

      bookStatus.textContent = "Opening your mail app…";
      window.location.href =
        "mailto:afnanbabbas@gmail.com" +
        `?subject=${encodeURIComponent(subject)}` +
        `&body=${encodeURIComponent(lines.join("\n"))}`;

      window.setTimeout(() => {
        bookStatus.textContent = "If nothing opened, email afnanbabbas@gmail.com directly.";
      }, 1800);
    });
  }

  /* footer year -------------------------------------------------------- */
  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
