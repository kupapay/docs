/* Mermaid diagram click-to-zoom lightbox */
(function () {
  "use strict";

  function initZoom() {
    // Create overlay once
    if (document.getElementById("mermaid-overlay")) return;

    var overlay = document.createElement("div");
    overlay.id = "mermaid-overlay";

    var closeBtn = document.createElement("button");
    closeBtn.id = "mermaid-overlay-close";
    closeBtn.innerHTML = "&times;";
    closeBtn.title = "Close (Esc)";

    var content = document.createElement("div");
    content.id = "mermaid-overlay-content";

    overlay.appendChild(closeBtn);
    overlay.appendChild(content);
    document.body.appendChild(overlay);

    function closeOverlay() {
      overlay.classList.remove("active");
      content.innerHTML = "";
    }

    // Close on overlay background click
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) closeOverlay();
    });

    // Close button
    closeBtn.addEventListener("click", closeOverlay);

    // Close on Escape key
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeOverlay();
    });

    // Stop propagation inside content box
    content.addEventListener("click", function (e) {
      e.stopPropagation();
    });

    attachToAllDiagrams(content, overlay);
  }

  function attachToAllDiagrams(content, overlay) {
    // Find every .mermaid element that contains a rendered SVG
    var diagrams = document.querySelectorAll(".mermaid svg");

    diagrams.forEach(function (svg) {
      var wrapper = svg.closest(".mermaid");
      if (!wrapper || wrapper.dataset.zoomInit) return;
      wrapper.dataset.zoomInit = "1";

      wrapper.addEventListener("click", function () {
        // Clone the SVG so we can resize it freely
        var clone = svg.cloneNode(true);
        clone.removeAttribute("width");
        clone.removeAttribute("height");
        clone.style.width = "100%";
        clone.style.height = "auto";

        content.innerHTML = "";
        content.appendChild(clone);
        overlay.classList.add("active");
      });

      // Add a small click-hint below
      if (!wrapper.nextElementSibling || !wrapper.nextElementSibling.classList.contains("mermaid-zoom-hint")) {
        var hint = document.createElement("p");
        hint.className = "mermaid-zoom-hint";
        hint.textContent = "Click diagram to enlarge";
        wrapper.insertAdjacentElement("afterend", hint);
      }
    });
  }

  function waitForMermaid() {
    // Mermaid replaces .mermaid content with an <svg>. Poll until rendered.
    var attempts = 0;
    var maxAttempts = 50; // 5 seconds max

    var timer = setInterval(function () {
      attempts++;
      var svgs = document.querySelectorAll(".mermaid svg");
      if (svgs.length > 0) {
        clearInterval(timer);
        initZoom();
      } else if (attempts >= maxAttempts) {
        clearInterval(timer);
      }
    }, 100);
  }

  // Run on initial load and on MkDocs instant navigation
  if (typeof document$ !== "undefined") {
    // MkDocs Material instant loading
    document$.subscribe(function () {
      waitForMermaid();
    });
  } else {
    document.addEventListener("DOMContentLoaded", waitForMermaid);
  }
})();
