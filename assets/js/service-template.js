(function () {
  const registry = window.WEBIX_SERVICES;
  if (!registry || !registry.services) {
    document.body.innerHTML = "<p>Les données des services sont introuvables.</p>";
    return;
  }

  const services = registry.services;
  const order = registry.order;
  const currentKey = window.SERVICE_PAGE_KEY || new URLSearchParams(window.location.search).get("service") || slugFromPath();
  const service = services[currentKey] || services[order[0]];

  document.documentElement.lang = "fr";
  document.title = `${service.title} — The WebiX`;
  setMeta("description", service.summary);
  document.body.classList.add("service-page", `service-${currentKey}`);

  document.body.innerHTML = [
    '<div data-webix-header></div>',
    breadcrumb(service),
    hero(service),
    marquee(service),
    deliverables(service),
    overview(service),
    metrics(service),
    comparison(service),
    timeline(service),
    serviceNav(currentKey),
    cta(service),
    footer(currentKey)
  ].join("");

  if (window.renderWebixHeader) {
    window.renderWebixHeader();
  }

  initServiceOverviewInteractions();
})();

function slugFromPath() {
  return window.location.pathname
    .split("/")
    .pop()
    .replace(/^service-/, "")
    .replace(/\.html$/, "");
}

function setMeta(name, content) {
  let tag = document.querySelector(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.name = name;
    document.head.appendChild(tag);
  }
  tag.content = content;
}

function h(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function lines(items) {
  return items.map((item) => typeof item === "string" ? h(item) : `<em>${h(item.em)}</em>`).join("<br>");
}

function linesWithSingleBreak(items) {
  if (!Array.isArray(items) || items.length <= 2) {
    return lines(items);
  }

  const first = typeof items[0] === "string" ? h(items[0]) : `<em>${h(items[0].em)}</em>`;
  const rest = items
    .slice(1)
    .map((item) => typeof item === "string" ? h(item) : `<em>${h(item.em)}</em>`)
    .join("");

  return `${first}<br>${rest}`;
}

function inline(items) {
  return items.map((item) => typeof item === "string" ? h(item) : `<em>${h(item.em)}</em>`).join("");
}

function serviceList() {
  const registry = window.WEBIX_SERVICES;
  return registry.order.map((key) => [key, registry.services[key]]);
}

function isInPagesFolder() {
  return window.location.pathname.split("/").includes("pages");
}

function pageHref(file) {
  if (isInPagesFolder()) {
    return file === "index.html" ? "../index.html" : file;
  }

  return file === "index.html" ? file : `pages/${file}`;
}

function imageHref(file) {
  return `${isInPagesFolder() ? "../" : ""}assets/images/${file}`;
}

function stepOverlayCopy(serviceTitle, title, desc, index) {
  const variants = [
    {
      kicker: "Ce que cette etape change",
      body: `Dans ${serviceTitle}, ${title.toLowerCase()} sert a clarifier les priorites, eliminer les zones grises et donner a votre equipe une direction concrete. Au lieu d'avancer a l'intuition, on cree un cadre simple qui rend les decisions plus rapides, plus coherentes et beaucoup plus faciles a reproduire.`,
      body2: `Cette etape permet aussi de traduire la strategie en execution reelle. On relie les objectifs, les actions a poser et les criteres de succes pour que chaque intervention ait une utilite visible dans le systeme global.`,
      points: [
        `On structure ${title.toLowerCase()} autour d'objectifs mesurables.`,
        `On retire la friction qui ralentit vos suivis et vos conversions.`,
        `On cree une base plus stable pour les optimisations suivantes.`
      ]
    },
    {
      kicker: "Pourquoi c'est important",
      body: `${title} n'est pas seulement une tache dans le processus. C'est souvent l'etape qui determine la qualite de tout ce qui suit. Quand elle est bien pensee, votre operation devient plus nette, plus lisible et plus rentable a faire evoluer.`,
      body2: `On utilise cette phase pour transformer ${desc.toLowerCase()} en avantage concret. Cela veut dire moins d'approximation, une meilleure experience pour vos prospects et une execution qui reste solide meme quand le volume augmente.`,
      points: [
        `Une meilleure lecture des priorites a chaque etape.`,
        `Des actions plus fluides pour l'equipe et pour le client.`,
        `Une fondation plus forte pour scaler sans perdre en qualite.`
      ]
    },
    {
      kicker: "Impact operationnel",
      body: `Quand ${title.toLowerCase()} est bien implantee, elle reduit les pertes de temps et augmente la constance des resultats. C'est la difference entre un systeme qui depend de l'effort individuel et un systeme qui tient meme quand il faut aller vite.`,
      body2: `Dans le contexte de ${serviceTitle}, cette etape aide a mieux repartir l'energie, a rendre les attentes plus claires et a faire en sorte que chaque action ait une suite logique. On gagne en precision, mais aussi en confiance dans ce qui est en train d'etre construit.`,
      points: [
        `Plus de clarte dans la facon de travailler au quotidien.`,
        `Moins de variation entre l'intention et l'execution.`,
        `Une progression plus facile a mesurer, ajuster et faire grandir.`
      ]
    }
  ];

  return variants[index % variants.length];
}

function initServiceOverviewInteractions() {
  const section = document.querySelector(".section-service-overview");
  if (!section) {
    return;
  }

  const overlay = section.querySelector(".service-visual-overlay");
  const overlayTitle = section.querySelector(".service-visual-overlay-title");
  const overlayKicker = section.querySelector(".service-visual-overlay-kicker");
  const overlayText = section.querySelector(".service-visual-overlay-text");
  const overlayText2 = section.querySelector(".service-visual-overlay-text-secondary");
  const overlayList = section.querySelector(".service-visual-overlay-points");
  const overlayCta = section.querySelector(".service-visual-overlay-cta");
  const rows = Array.from(section.querySelectorAll(".service-step-row"));

  if (!overlay || !overlayTitle || !overlayKicker || !overlayText || !overlayText2 || !overlayList || !overlayCta || !rows.length) {
    return;
  }

  let activeRow = null;

  const closeOverlay = () => {
    overlay.classList.remove("is-visible");
    rows.forEach((row) => row.classList.remove("is-active"));
    activeRow = null;
  };

  const openOverlay = (row) => {
    const nextTitle = row.getAttribute("data-step-title") || "";
    const nextKicker = row.getAttribute("data-step-kicker") || "";
    const nextText = row.getAttribute("data-step-detail") || "";
    const nextText2 = row.getAttribute("data-step-detail-secondary") || "";
    const nextPoints = JSON.parse(row.getAttribute("data-step-points") || "[]");

    rows.forEach((item) => item.classList.toggle("is-active", item === row));

    if (activeRow && activeRow !== row) {
      overlay.classList.remove("is-visible");
      window.setTimeout(() => {
        overlayKicker.textContent = nextKicker;
        overlayTitle.textContent = nextTitle;
        overlayText.textContent = nextText;
        overlayText2.textContent = nextText2;
        overlayList.innerHTML = nextPoints.map((point) => `<li>${h(point)}</li>`).join("");
        overlayCta.href = pageHref("contact.html");
        overlay.classList.add("is-visible");
      }, 110);
    } else {
      overlayKicker.textContent = nextKicker;
      overlayTitle.textContent = nextTitle;
      overlayText.textContent = nextText;
      overlayText2.textContent = nextText2;
      overlayList.innerHTML = nextPoints.map((point) => `<li>${h(point)}</li>`).join("");
      overlayCta.href = pageHref("contact.html");
      overlay.classList.add("is-visible");
    }

    activeRow = row;
  };

  rows.forEach((row) => {
    row.addEventListener("mouseenter", () => openOverlay(row));
  });

  section.addEventListener("mouseleave", closeOverlay);
}

function breadcrumb(service) {
  return `
    <div class="breadcrumb">
      <div class="wrap">
        <div class="breadcrumb-inner">
          <a href="${h(pageHref("index.html"))}">Accueil</a><span>/</span>
          <a href="${h(pageHref("services.html"))}">Services</a><span>/</span>
          <span class="current">${h(service.title)}</span>
        </div>
      </div>
    </div>`;
}

function hero(service) {
  const heroItems = service.process?.steps || [];
  return `
    <section class="page-hero">
      <img class="page-hero-bg" src="${h(imageHref(service.heroImage))}" alt="${h(service.title)}" />
      <div class="page-hero-inner">
        <div class="page-hero-grid">
          <div class="page-hero-copy">
            <div class="label label--gold label--no-line">${h(service.number)} · ${h(service.category)}</div>
            <h1>${lines(service.h1)}</h1>
            <p>${h(service.summary)}</p>
            <div class="page-hero-actions">
              <a href="${h(pageHref("contact.html"))}" class="btn-primary">Obtenir une soumission</a>
              <a href="${h(pageHref("services.html"))}" class="btn-ghost">Voir tous les services</a>
            </div>
          </div>
          <div class="hero-service-list">
            ${heroItems.map(([title], index) => `
              <a href="#section-service-overview" class="hero-service-item">
                <span>${String(index + 1).padStart(2, "0")}</span>
                ${h(title)}
                <span>→</span>
              </a>`).join("")}
          </div>
        </div>
      </div>
    </section>`;
}

function marquee(service) {
  const items = [...service.marquee, ...service.marquee];
  return `
    <div class="marquee" aria-hidden="true">
      <div class="marquee-track">
        ${items.map((item) => `<div class="marquee-item">${h(item)}</div>`).join("")}
      </div>
    </div>`;
}

function overview(service) {
  const intro = service.intro;
  const process = service.process;
  return `
    <section class="section-service-overview" id="section-service-overview">
      <div class="wrap">

        <div class="service-detail-grid">
          <div class="service-visual-panel">
            <img src="${h(imageHref(service.introImage))}" alt="${h(service.title)}" />
            <div class="service-visual-overlay" aria-hidden="true">
              <div class="service-visual-overlay-inner">
                <div class="service-visual-overlay-kicker"></div>
                <h4 class="service-visual-overlay-title"></h4>
                <p class="service-visual-overlay-text"></p>
                <p class="service-visual-overlay-text-secondary"></p>
                <ul class="service-visual-overlay-points"></ul>
                <a class="service-visual-overlay-cta btn-primary" href="${h(pageHref("contact.html"))}">Obtenir une soumission</a>
              </div>
            </div>
            <div class="service-visual-badge">
              <strong>${h(intro.badge[0])}</strong>
              <span>${h(intro.badge[1])}</span>
            </div>
          </div>
          <div class="service-steps-panel">
            <div class="label label--blue">${h(process.label)}</div>
            <h3>${lines(process.title)}</h3>
            <p>${h(process.subtitle)}</p>
            <div class="service-steps-list">
              ${process.steps.map(([title, desc], index) => {
                const overlayData = stepOverlayCopy(service.title, title, desc, index);
                return `
                <article class="service-step-row" data-step-title="${h(title)}" data-step-kicker="${h(overlayData.kicker)}" data-step-detail="${h(overlayData.body)}" data-step-detail-secondary="${h(overlayData.body2)}" data-step-points="${h(JSON.stringify(overlayData.points))}">
                  <div class="service-step-num">${String(index + 1).padStart(2, "0")}</div>
                  <div>
                    <h4>${h(title)}</h4>
                    <p>${h(desc)}</p>
                  </div>
                  <div class="service-step-hover">En savoir plus</div>
                </article>`;
              }).join("")}
            </div>
          </div>
        </div>
      </div>
    </section>`;
}

function deliverables(service) {
  const data = service.deliverables;
  return `
    <section class="section-packages">
      <div class="wrap">
        <div class="packages-header">
          <div class="label label--blue">${h(data.label)}</div>
          <h2>${h(data.title)}</h2>
          <p>${h(data.text)}</p>
        </div>
        <div class="packages-grid service-packages-grid">
          ${data.items.map(([title, desc, tag], index) => `
            <article class="pkg-card">
              <div class="pkg-badge">${h(tag)}</div>
              <div class="pkg-name">${h(title)}</div>
              <div class="pkg-tagline">${h(desc)}</div>
              <div class="pkg-divider"></div>
              <div class="pkg-features">
                ${service.marquee.slice(index, index + 3).map((item) => `
                  <div class="pkg-feature">
                    <span class="pkg-check">+</span>
                    <span>${h(item)}</span>
                  </div>`).join("")}
              </div>
            </article>`).join("")}
        </div>
      </div>
    </section>`;
}

function metrics(service) {
  const data = service.metrics;
  return `
    <section class="section-metrics">
      <div class="wrap">
        <div class="metrics-top">
          <div>
            <div class="label label--gold">${h(service.chart.label)}</div>
            <h2>${linesWithSingleBreak(data.title)}</h2>
          </div>
          <p class="metrics-top-copy">${h(data.subtitle)}</p>
        </div>
        <div class="metrics-grid">
          ${data.items.map(([num, unit, label, desc], index) => `
            <article class="m-card">
              <div class="m-label">${h(label)}</div>
              <div class="m-num">${h(num)}<em>${h(unit)}</em></div>
              <div class="m-desc">${h(desc)}</div>
              <div class="m-bar"><div class="m-bar-fill" style="width:${60 + index * 10}%"></div></div>
            </article>`).join("")}
        </div>
      </div>
    </section>`;
}

function comparison(service) {
  const data = service.comparison;
  return `
    <section class="section-two-column">
      <div class="wrap">
        <div class="services-header">
          <div>
            <div class="label label--blue">${h(data.label)}</div>
            <h2>${linesWithSingleBreak(data.title)}</h2>
          </div>
          <div class="services-header-copy">
            <p>${h(data.text)}</p>
          </div>
        </div>
        <div class="constat-cols">
        <div class="constat-col constat-col--bad">
          <div class="col-head">
            <span class="col-badge badge-x">✕</span>
            <span class="col-head-title">${h(data.withoutTitle)}</span>
          </div>
          <div class="constat-items">
            <div class="constat-item"><span class="item-icon">—</span>${h(data.withoutTitle)}</div>
            ${data.without.map(item => `
              <div class="constat-item"><span class="item-icon">—</span>${h(item)}</div>
            `).join("")}
          </div>
        </div>

        <div class="constat-col constat-col--good">
          <div class="col-head">
            <span class="col-badge badge-check">✓</span>
            <span class="col-head-title">${h(data.withTitle)}</span>
          </div>
          <div class="constat-items">
            <div class="constat-item"><span class="item-icon">✓</span>${h(data.withTitle)}</div>
            ${data.with.map(item => `
              <div class="constat-item"><span class="item-icon">✓</span>${h(item)}</div>
            `).join("")}
          </div>
        </div>
      </div>
      </div>
    </section>`;
}

function timeline(service) {
  const data = service.timeline;
  return `
    <section class="section-services-list">
      <div class="wrap">
        <div class="services-header">
          <div>
            <div class="label label--blue">${h(data.label)}</div>
            <h2>${linesWithSingleBreak(data.title)}</h2>
          </div>
          <div class="services-header-copy">
            <p>${h(data.text)}</p>
          </div>
        </div>
        <div class="timeline-list">
          ${data.items.map(([week, title, desc, tags]) => `
            <article class="service-card service-card--timeline">
              <div class="svc-num">${h(week)}</div>
              <div class="svc-main">
                <div class="svc-title">${h(title)}</div>
                <div class="svc-desc">${h(desc)}</div>
              </div>
              <div class="svc-features">
                ${tags.map((tag) => `<div class="svc-feature">${h(tag)}</div>`).join("")}
              </div>
              <div class="svc-arrow">→</div>
            </article>`).join("")}
        </div>
      </div>
    </section>`;
}

function serviceNav(currentKey) {
  return `
    <section class="section-service-nav">
      <div class="wrap">
        <div class="label label--blue">Explorer les autres services</div>
        <div class="service-nav-grid">
          ${serviceList().map(([key, item]) => `
            <a href="${h(pageHref(item.url))}" class="service-nav-item ${key === currentKey ? "active" : ""}">
              <div class="service-nav-num">${h(item.number)}</div>
              <div class="service-nav-name">${h(item.navName)}</div>
            </a>`).join("")}
        </div>
      </div>
    </section>`;
}

function cta(service) {
  const data = service.cta;
  return `
    <section class="section-cta">
      <div class="cta-ghost">TWX</div>
      <div class="wrap">
        <div class="cta-inner">
          <div>
            <div class="label label--gold">${h(data.label)}</div>
            <h2>${inline(data.title)}</h2>
          </div>
          <div class="cta-right">
            <p>${h(data.text)}</p>
            <a href="${h(pageHref("contact.html"))}" class="btn-gold">Réservez un appel stratégique</a>
            <a href="${h(pageHref("services.html"))}" class="btn-white-ghost">Voir tous les services</a>
          </div>
        </div>
      </div>
    </section>`;
}

function footer(currentKey) {
  return `
    <footer>
      <div class="wrap">
        <div class="footer-top">
          <div>
            <div class="footer-logo-name">The WebiX</div>
            <div class="footer-tagline">On bâtit votre système d'acquisition de clients de A à Z.</div>
          </div>
          <div>
            <div class="footer-col-label">Navigation</div>
            <ul class="footer-links">
              <li><a href="${h(pageHref("index.html"))}">Accueil</a></li>
              <li><a href="${h(pageHref("systeme.html"))}">Système</a></li>
              <li><a href="${h(pageHref("services.html"))}">Services</a></li>
              <li><a href="${h(pageHref("etudes-de-cas.html"))}">Études de cas</a></li>
              <li><a href="${h(pageHref("contact.html"))}">Contact</a></li>
            </ul>
          </div>
          <div>
            <div class="footer-col-label">Services</div>
            <ul class="footer-links">
              ${serviceList().map(([key, item]) => `<li><a href="${h(pageHref(item.url))}" class="${key === currentKey ? "active" : ""}">${h(item.navName)}</a></li>`).join("")}
            </ul>
          </div>
          <div>
            <div class="footer-col-label">Contact</div>
            <div class="footer-contact-row"><span>+1 (450) 300-6119</span></div>
            <div class="footer-contact-row"><span>info@thewebix.com</span></div>
            <div class="footer-contact-row"><span>Longueuil, QC</span></div>
          </div>
        </div>
        <div class="footer-bottom">
          <p>© 2026 THE WEBIX. TOUS DROITS RÉSERVÉS.</p>
          <div class="footer-bottom-links">
            <a href="#">Politique de confidentialité</a>
            <a href="#">Termes et conditions</a>
          </div>
        </div>
      </div>
    </footer>`;
}
