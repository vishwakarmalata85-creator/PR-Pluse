/**
 * NEXORA PULSECARE - AUTOMATIC SCREEN RATIO & RESPONSIVE DEVICE ENGINE
 * Detects device screen ratios, orientations, touch inputs, and updates responsive tokens dynamically.
 */

export class ScreenService {
  constructor() {
    this.currentTier = "DESKTOP"; // 'MOBILE' | 'TABLET' | 'LAPTOP' | 'DESKTOP' | 'ULTRAWIDE'
    this.orientation = "landscape";
    this.aspectRatio = "16:9";
    this.isTouch = false;
    this.init();
  }

  init() {
    if (typeof window === "undefined") return;

    this.isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    this.updateScreenMetrics();

    // Listen to window resize & orientation changes with debounce
    let resizeTimer = null;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => this.updateScreenMetrics(), 60);
    });

    window.addEventListener("orientationchange", () => {
      setTimeout(() => this.updateScreenMetrics(), 100);
    });

    // Mount mobile bottom quick nav
    this.mountMobileBottomNav();
    window.addEventListener("userSessionChanged", () => this.updateMobileBottomNav());
    window.addEventListener("hashchange", () => this.updateMobileBottomNavActiveState());
  }

  updateScreenMetrics() {
    const width = window.innerWidth || document.documentElement.clientWidth;
    const height = window.innerHeight || document.documentElement.clientHeight;
    const ratio = width / height;

    // 1. Determine Tier
    let tier = "DESKTOP";
    if (width < 640) {
      tier = "MOBILE";
    } else if (width < 768) {
      tier = "MOBILE_LG";
    } else if (width < 1024) {
      tier = "TABLET";
    } else if (width < 1440) {
      tier = "LAPTOP";
    } else if (width < 1920) {
      tier = "DESKTOP";
    } else {
      tier = "ULTRAWIDE";
    }

    // 2. Determine Orientation
    const orientation = height > width ? "portrait" : "landscape";

    // 3. Approximate Standard Ratio
    let ratioLabel = "16:9";
    if (ratio < 0.65) ratioLabel = "9:16 (Tall Mobile)";
    else if (ratio < 0.85) ratioLabel = "3:4 (Portrait Tablet)";
    else if (ratio < 1.15) ratioLabel = "1:1 (Square/Foldable)";
    else if (ratio < 1.45) ratioLabel = "4:3 (Landscape Tablet)";
    else if (ratio < 1.95) ratioLabel = "16:9 (Standard Widescreen)";
    else ratioLabel = "21:9 (Ultrawide Monitor)";

    this.currentTier = tier;
    this.orientation = orientation;
    this.aspectRatio = ratioLabel;

    // 4. Update Root HTML Attributes & Classes
    const root = document.documentElement;
    root.setAttribute("data-device-tier", tier);
    root.setAttribute("data-orientation", orientation);
    root.setAttribute("data-aspect-ratio", ratio.toFixed(2));

    // Dynamic viewport heights for mobile address bar protection
    root.style.setProperty("--app-height", `${height}px`);
    root.style.setProperty("--screen-ratio", ratio.toFixed(2));
    root.style.setProperty("--screen-width", `${width}px`);

    root.classList.remove("tier-mobile", "tier-tablet", "tier-desktop", "tier-ultrawide", "ori-portrait", "ori-landscape");
    if (tier === "MOBILE" || tier === "MOBILE_LG") root.classList.add("tier-mobile");
    else if (tier === "TABLET") root.classList.add("tier-tablet");
    else if (tier === "ULTRAWIDE") root.classList.add("tier-ultrawide");
    else root.classList.add("tier-desktop");

    root.classList.add(orientation === "portrait" ? "ori-portrait" : "ori-landscape");
    if (this.isTouch) root.classList.add("device-touch");

    // Dispatch global event for interested components
    window.dispatchEvent(
      new CustomEvent("screenMetricsChange", {
        detail: { width, height, tier, orientation, ratio, ratioLabel, isTouch: this.isTouch },
      })
    );
  }

  mountMobileBottomNav() {
    let bar = document.getElementById("mobile-bottom-nav");
    if (!bar) {
      bar = document.createElement("nav");
      bar.id = "mobile-bottom-nav";
      bar.className = "mobile-bottom-bar";
      bar.setAttribute("aria-label", "Mobile Quick Bar");
      document.body.appendChild(bar);
    }
    this.updateMobileBottomNav();
  }

  updateMobileBottomNav() {
    const bar = document.getElementById("mobile-bottom-nav");
    if (!bar) return;

    const hash = window.location.hash || "#/";

    bar.innerHTML = `
      <div class="mobile-nav-track">
        <a href="#/" class="mobile-nav-item ${hash === "#/" || hash === "" ? "active" : ""}" data-route="#/">
          <span class="m-icon">📄</span>
          <span class="m-label">Rx & Care</span>
        </a>
        <a href="#/doctor" class="mobile-nav-item ${hash === "#/doctor" ? "active" : ""}" data-route="#/doctor">
          <span class="m-icon">🩺</span>
          <span class="m-label">Doctor OPD</span>
        </a>
        <a href="#/pharmacy" class="mobile-nav-item ${hash === "#/pharmacy" ? "active" : ""}" data-route="#/pharmacy">
          <span class="m-icon">💊</span>
          <span class="m-label">Pharmacy</span>
        </a>
        <a href="#/admin" class="mobile-nav-item ${hash === "#/admin" ? "active" : ""}" data-route="#/admin">
          <span class="m-icon">🛡️</span>
          <span class="m-label">Admin</span>
        </a>
        <a href="#login" class="mobile-nav-item ${hash === "#login" ? "active" : ""}" data-route="#login">
          <span class="m-icon">🔐</span>
          <span class="m-label">Portal</span>
        </a>
      </div>
    `;

    // Event binding
    bar.querySelectorAll(".mobile-nav-item").forEach((btn) => {
      btn.addEventListener("click", () => {
        bar.querySelectorAll(".mobile-nav-item").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
      });
    });
  }

  updateMobileBottomNavActiveState() {
    const bar = document.getElementById("mobile-bottom-nav");
    if (!bar) return;
    const hash = window.location.hash || "#/";
    bar.querySelectorAll(".mobile-nav-item").forEach((b) => {
      const target = b.getAttribute("data-route");
      if (target === hash || (hash === "" && target === "#/")) {
        b.classList.add("active");
      } else {
        b.classList.remove("active");
      }
    });
  }
}

export const screenService = new ScreenService();
