(function () {
  const services = [
    ["service-creation-publicitaire.html", "Contenu Vidéo"],
    ["service-marketing-payant.html", "Campagnes Marketing"],
    ["service-agents-ia.html", "Qualification IA"],
    ["service-crm-automatisation.html", "Booking + CRM"],
    ["service-processus-ventes.html", "Processus de Ventes"],
    ["service-conception-web.html", "Conception Web"],
    ["service-seo-complet.html", "SEO Complet"],
    ["service-ai-seo.html", "AI SEO (GEO)"],
    ["service-contenu-organique.html", "Contenu Organique"]
  ];

  function inPagesFolder() {
    return window.location.pathname.split("/").includes("pages");
  }

  function pageHref(file) {
    if (inPagesFolder()) {
      return file === "index.html" ? "../index.html" : file;
    }

    return file === "index.html" ? file : `pages/${file}`;
  }

  function activeSection() {
    const file = window.location.pathname.split("/").pop() || "index.html";

    if (file === "index.html" || file === "") return "home";
    if (file === "systeme.html") return "systeme";
    if (file === "etudes-de-cas.html") return "cases";
    if (file === "contact.html") return "contact";
    if (file === "services.html" || file === "service-template.html" || file.startsWith("service-")) return "services";

    return "";
  }

  function currentServiceFile() {
    const file = window.location.pathname.split("/").pop() || "";
    return file.startsWith("service-") ? file : "";
  }

  function link(file, label, active, extraClass) {
    const classes = [active ? "active" : "", extraClass || ""].filter(Boolean).join(" ");
    return `<a href="${pageHref(file)}"${classes ? ` class="${classes}"` : ""}>${label}</a>`;
  }

  function markup() {
    const active = activeSection();
    const serviceFile = currentServiceFile();
    const serviceLinks = services
      .map(([file, label]) => link(file, label, file === serviceFile))
      .join("");

    return `
      <header>
        <div class="nav-wrap">
          <a href="${pageHref("index.html")}" class="logo">
            <span class="logo-name">The WebiX</span>
            <span class="logo-sep"></span>
            <span class="logo-sub">Systèmes d'acquisition</span>
          </a>
          <nav>
            ${link("index.html", "Accueil", active === "home")}
            ${link("systeme.html", "Système", active === "systeme")}
            <div class="nav-dropdown">
              ${link("services.html", "Services", active === "services")}
              <div class="dropdown-menu">
                ${link("services.html", "→ Tous les services", false, "dropdown-all")}
                <div class="dropdown-divider"></div>
                ${serviceLinks}
              </div>
            </div>
            ${link("etudes-de-cas.html", "Études de cas", active === "cases")}
            ${link("contact.html", "Contact", active === "contact")}
            ${link("contact.html", "Soumission", false, "btn-cta")}
          </nav>
        </div>
      </header>`;
  }

  window.renderWebixHeader = function renderWebixHeader(root) {
    const target = root || document.querySelector("[data-webix-header]");
    if (target) {
      target.outerHTML = markup();
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      window.renderWebixHeader();
    });
  } else {
    window.renderWebixHeader();
  }
})();
