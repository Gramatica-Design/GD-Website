# Dokumentation: Gramatica Design New

**Webflow-Site:** gramatica-design-new.webflow.io
**Site-ID:** `69bd5b60bc5707f31c858aa2`
**Sprache:** Deutsch (Schweiz), primär
**Custom Domain:** noch nicht verbunden
**Stand:** Mai 2026

---

## Inhaltsverzeichnis

0. [Schnelleinstieg](#0-schnelleinstieg)
1. [Site-Übersicht & Seiten](#1-site-übersicht--seiten)
2. [Script-Ladestrategie](#2-script-ladestrategie)
3. [Git-Repository & CDN](#3-git-repository--cdn)
4. [CSS-Embeds](#4-css-embeds)
5. [JavaScript-Dateien](#5-javascript-dateien)
6. [Cursor-System](#6-cursor-system)
7. [Webflow-Attribute & Klassen – Übersicht](#7-webflow-attribute--klassen--übersicht)
8. [Externe Abhängigkeiten (GSAP)](#8-externe-abhängigkeiten-gsap)
9. [Lokale Entwicklung](#9-lokale-entwicklung)
10. [Änderungshinweise & Erweiterungen](#10-änderungshinweise--erweiterungen)
11. [Bekannte Probleme](#11-bekannte-probleme)

---

## 0. Schnelleinstieg

Dieses Projekt verbindet **Webflow** (Design + CMS) mit **eigenem JavaScript** aus einem GitHub-Repository. Die Skripte werden nicht direkt in Webflow eingebettet, sondern dynamisch über das CDN [jsDelivr](https://www.jsdelivr.com) geladen — direkt von GitHub. Das ermöglicht es, Skripte lokal zu entwickeln und zu testen, ohne den Webflow-Editor anfassen zu müssen.

### Wichtige Links

| | Link |
|-|------|
| GitHub Repository | https://github.com/Gramatica-Design/GD-Website |
| jsDelivr Purge-Tool | https://www.jsdelivr.com/tools/purge |

### Die zwei Script-Loader

Es gibt **zwei separate Script-Loader** in Webflow — das ist der häufigste Punkt der Verwirrung:

| Loader | Wo in Webflow | Lädt |
|--------|--------------|------|
| **Site Scripts** | Site Settings → Custom Code → Before `</body>` | `cursor.js`, `nav.js`, `footer-form.js`, `text-animation.js` — auf **allen Seiten** |
| **Home Scripts** | Home Page → Settings → Custom Code → Before `</body>` | `process.js`, `slider.js`, `list-hover.js`, `feldlinien.js`, `magnetic-button.js` — **nur auf der Home-Seite** |

Beide Loader haben je eine Flag-Variable (`isLocal_ss` bzw. `isLocal`) mit der man zwischen CDN und lokalem Server umschalten kann.

### Workflow: Lokal entwickeln

1. In **beiden** Loadern die Flag auf `true` setzen:
   - Site Settings: `const isLocal_ss = true;`
   - Home Page: `const isLocal = true;`
2. Webflow publishen
3. **Live Server** in VS Code starten (Port 5500, HTTPS via mkcert — siehe Abschnitt 9)
4. Skript bearbeiten und im Browser testen (Cmd+Shift+R zum Neu-Laden)

### Workflow: Änderung live schalten

1. Flags wieder auf `false` setzen, Webflow publishen
2. Skript committen und pushen:
   ```bash
   git add js/dateiname.js
   git commit -m "Beschreibung"
   git push
   ```
3. **jsDelivr-Cache purgen** — sonst bleibt die alte Version live:
   Alle URLs auf einmal bei https://www.jsdelivr.com/tools/purge eingeben:
   ```
   https://cdn.jsdelivr.net/gh/Gramatica-Design/GD-Website@main/js/cursor.js
   https://cdn.jsdelivr.net/gh/Gramatica-Design/GD-Website@main/js/nav.js
   https://cdn.jsdelivr.net/gh/Gramatica-Design/GD-Website@main/js/footer-form.js
   https://cdn.jsdelivr.net/gh/Gramatica-Design/GD-Website@main/js/text-animation.js
   https://cdn.jsdelivr.net/gh/Gramatica-Design/GD-Website@main/js/process.js
   https://cdn.jsdelivr.net/gh/Gramatica-Design/GD-Website@main/js/slider.js
   https://cdn.jsdelivr.net/gh/Gramatica-Design/GD-Website@main/js/list-hover.js
   https://cdn.jsdelivr.net/gh/Gramatica-Design/GD-Website@main/js/feldlinien.js
   https://cdn.jsdelivr.net/gh/Gramatica-Design/GD-Website@main/js/magnetic-button.js
   ```
4. Seite im Browser mit Cmd+Shift+R neu laden und prüfen

> **Hinweis:** Auch nach einem erfolgreichen Purge kann jsDelivr vereinzelt noch die alte Version ausliefern. Wenn die neue Version nicht erscheint: direkt die CDN-URL im Browser öffnen und prüfen ob `chaseScroll` oder die neue Funktion dort sichtbar ist. Als Notlösung kann temporär ein spezifischer Commit-Hash statt `@main` verwendet werden (z.B. `@5eca412`).

---

## 1. Site-Übersicht & Seiten

| Seite | Pfad | Typ | Scripts | Besonderheiten |
|-------|------|-----|---------|----------------|
| Home | `/` | Statisch | Alle 9 Scripts | Hauptseite mit allen Animationen |
| Imprint | `/imprint` | Statisch | Site-Scripts (4) | Impressum |
| Privacy Policy | `/privacy-policy` | Statisch | Site-Scripts (4) | Datenschutzerklärung |
| 404 | `/404` | Statisch | Site-Scripts (4) | Fehlerseite |
| Style Guide | `/style-guide` | Draft | Site-Scripts (4) | Nur im Designer sichtbar |
| Services Template | `/services` | CMS Template | Site-Scripts (4) | Leistungs-Detailseite |
| Projects Template | `/project` | CMS Template | Site-Scripts (4) | Projekt-Detailseite |
| Reviews Template | `/review` | CMS Template | Site-Scripts (4) | Referenz-Detailseite |

**Site-Scripts (4):** `cursor.js`, `nav.js`, `footer-form.js`, `text-animation.js`

---

## 2. Script-Ladestrategie

Scripts werden dynamisch zur Laufzeit geladen – nicht als statische `<script>`-Tags. Dadurch kann zwischen dem jsDelivr-CDN (Produktion) und einem lokalen Live Server (Entwicklung) umgeschaltet werden, ohne den Webflow-Editor zu öffnen.

### 2.1 Site-weite Scripts — Site Settings → Custom Code → Before `</body>`

Lädt vier Scripts auf **allen Seiten**. Umschaltung zwischen CDN und lokalem Server über `isLocal_ss`:

```html
<script>
  const isLocal_ss = false; // <-- hier umschalten: true = localhost, false = CDN
  const localIP_ss = 'https://localhost:5500';
  const base_ss = isLocal_ss
    ? localIP_ss + '/js'
    : 'https://cdn.jsdelivr.net/gh/Gramatica-Design/GD-Website@main/js';
  const files_ss = [
    "cursor.js",
    "nav.js",
    "footer-form.js",
    "text-animation.js"
  ];
  files_ss.forEach((files_ss) => {
    const script_ss = document.createElement('script');
    script_ss.src = `${base_ss}/${files_ss}`;
    document.head.appendChild(script_ss);
  });
</script>
```

### 2.2 Home-spezifische Scripts — Home Page → Settings → Custom Code → Before `</body>`

Lädt fünf Scripts **nur auf der Home-Seite**. Umschaltung über `isLocal`:

```html
<script>
  const isLocal = false; // <-- hier umschalten: true = localhost, false = CDN
  const localIP = 'https://localhost:5500';
  const base = isLocal
    ? localIP + '/js'
    : 'https://cdn.jsdelivr.net/gh/Gramatica-Design/GD-Website@main/js';
  const files = [
    "process.js",
    "slider.js",
    "list-hover.js",
    "feldlinien.js",
    "magnetic-button.js",
  ];
  files.forEach((file) => {
    const script = document.createElement('script');
    script.src = `${base}/${file}`;
    document.head.appendChild(script);
  });
</script>
```

### 2.3 Wichtige Hinweise

**Wechsel auf localhost:** Beide Loader anpassen — `isLocal_ss = true` in den Site Settings und `isLocal = true` in den Home Page Settings. Der Live Server muss über HTTPS laufen (mkcert-Zertifikat erforderlich, siehe [Abschnitt 9](#9-lokale-entwicklung)).

**jsDelivr Cache purgen** nach einem Push auf `main`, wenn Änderungen nicht erscheinen:
- Tool: https://www.jsdelivr.com/tools/purge
- Beispiel-URL zum Purgen: `https://cdn.jsdelivr.net/gh/Gramatica-Design/GD-Website@main/js/slider.js`

---

## 3. Git-Repository & CDN

| | URL |
|-|-----|
| GitHub Repository | https://github.com/Gramatica-Design/GD-Website |
| CDN-Basis (Produktion) | `https://cdn.jsdelivr.net/gh/Gramatica-Design/GD-Website@main/js/` |
| Branch | `main` |
| Lokaler Dev-Server | `https://localhost:5500/js/` |

Alle JavaScript-Dateien liegen unter `/js/` im Repository-Root.

---

## 4. CSS-Embeds

### 4.1 Text-Animations-Styles — Site Settings → Head Code

Enthält die CSS-Keyframe-Animation für den buchstabenweisen Farbeffekt (`text-fade-in`) sowie die CSS-Custom-Property für den Ease.

**Keyframe-Logik:** Jeder Buchstabe animiert von `inherit` → Blau (`#66b2ef`) → Grau (`--_semantics---text_alternate`) → Endfarbe. Die Endfarbe wird über `--char-final-color` gesteuert: Standard ist Schwarz (`--_semantics---text`); mit dem `[data-accent]`-Attribut auf dem Container bleibt der Buchstabe Blau (`--_semantics---text_blue`).

```css
:root {
  --ease-out-power2: cubic-bezier(0.215, 0.61, 0.355, 1);
}

/* Buchstaben die nach der Animation blau bleiben: [data-accent] auf den Container setzen */
[data-accent] {
  --char-final-color: var(--_semantics---text_blue);
}

[use-letter-spacing] .split-char:first-child {
  letter-spacing: -0.06em;
}

h1 {
  font-kerning: none;
}

[data-text-fade-in] .split-line .split-char.animate {
  animation: text-fade-in 0.3s var(--ease-out-power2) both;
}

.text-big .split-char.animate {
  animation: text-fade-in 0.3s var(--ease-out-power2) both;
}

@keyframes text-fade-in {
  0%   { color: inherit; }
  10%  { color: #66b2ef; }
  20%  { color: #66b2ef; }
  30%  { color: var(--_semantics---text_alternate); }
  60%  { color: var(--_semantics---text_alternate); }
  65%  { color: var(--char-final-color, var(--_semantics---text)); }
  to   { color: var(--char-final-color, var(--_semantics---text)); }
}
```

---

### 4.2 `global-styles` Embed — Site Settings → Head Code

CSS-Reset, Webflow-Utility-Klassen und Fluid Typography. Normalisiert Browser-Defaults, setzt Basisstyles und implementiert flüssige Typografie zwischen definierten Viewport-Breakpoints.

#### Fluid Typography

Die `font-size` auf `html` skaliert linear zwischen folgenden Breakpoints. Alle `rem`-Werte in Webflow skalieren dadurch automatisch mit dem Viewport.

| Viewport-Bereich | font-size (von → bis) |
|-----------------|----------------------|
| 1px – 479px | 12px → 16px |
| 479px – 1440px | 14px → 16px |
| 1440px – 1920px | 16px → 18px |
| 1920px – 2400px | 18px → 20px |

#### Wichtige Utility-Klassen

| Klasse | Funktion |
|--------|---------|
| `.hide` | Element immer ausblenden |
| `.hide-tablet` | Ausblenden auf Tablet (≤991px) |
| `.hide-mobile-landscape` | Ausblenden auf Mobile Landscape (≤767px) |
| `.hide-mobile` | Ausblenden auf Mobile (≤479px) |
| `.text-style-3lines` | Text nach 3 Zeilen mit „…" abschneiden |
| `.text-style-2lines` | Text nach 2 Zeilen mit „…" abschneiden |
| `.inherit-color *` | Farbe vom Elternelement erben |
| `.spacing-clean`, `.margin-0`, `.padding-0` | Abstands-Utilities |

```css
/* Make text look crisper */
body {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}

/* Focus state für Tastaturnavigation */
*[tabindex]:focus-visible,
input[type="file"]:focus-visible {
  outline: 0.125rem solid #4d65ff;
  outline-offset: 0.125rem;
}

/* Typography Reset */
a, p, h1, h2, h3, h4, h5, h6, ul, .w-form, .w-nav-brand, [data-submit] {
  margin: 0;
  padding: 0;
}

h1, h2 { hyphens: auto; }

img, video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

button, .w-nav { background-color: transparent; }

div {
  background-repeat: no-repeat;
  background-size: cover;
  background-position: top left;
}

.inherit-color * { color: inherit; }

/* Rich Text Margins */
.w-richtext > :not(div):first-child,
.w-richtext > div:first-child > :first-child { margin-top: 0 !important; }
.w-richtext > :last-child,
.w-richtext ol li:last-child,
.w-richtext ul li:last-child { margin-bottom: 0 !important; }

/* Container zentrieren */
.container-medium, .container-small, .container-large {
  margin-right: auto !important;
  margin-left: auto !important;
}

/* Typografie-Vererbung */
a, .w-input, .w-select, .w-tab-link, .w-nav-link,
.w-dropdown-btn, .w-dropdown-toggle, .w-dropdown-link {
  color: inherit;
  text-decoration: inherit;
  font-size: inherit;
}

/* Line-Clamp Utilities */
.text-style-3lines {
  display: -webkit-box;
  overflow: hidden;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}
.text-style-2lines {
  display: -webkit-box;
  overflow: hidden;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

/* Hide Utilities */
.hide { display: none !important; }
@media screen and (max-width: 991px) { .hide, .hide-tablet { display: none !important; } }
@media screen and (max-width: 767px) { .hide-mobile-landscape { display: none !important; } }
@media screen and (max-width: 479px) { .hide-mobile { display: none !important; } }

/* ===== FLUID DESIGN ===== */
:root {
  --font-from: 18;
  --font-to: 18;
  --vw-from: calc(1920 / 100);
  --vw-to: calc(2400 / 100);
  --coefficient: calc((var(--font-to) - var(--font-from)) / (var(--vw-to) - var(--vw-from)));
  --base: calc((var(--font-from) - var(--vw-from) * var(--coefficient)) / 16);
}
html { font-size: calc(var(--base) * 1rem + var(--coefficient) * 1vw); }

/* Breakpoints: @media max-width: 1920px, 1440px, 479px mit je eigenen Fluid-Werten */
```

---

### 4.3 `cursor_embed` — Cursor-Komponente (HTML Embed innerhalb der Komponente)

Styles für den Custom Cursor. Befindet sich **nicht** in den Site Settings, sondern als HTML Embed innerhalb der Cursor-Webflow-Komponente.

**Funktionsweise der Cursor-Grösse:** `.cursor` hat im Normalzustand eine kleine Grösse (z.B. 1rem), definiert in Webflow. Die `:has()`-Selektoren weiten ihn auf `3rem` aus, sobald ein interaktives Element gehoverd wird. Die CSS-Transition auf dem `.cursor`-Div (in Webflow definiert) übernimmt die Animation der Grössenänderung.

```css
/* Standardcursor überall ausblenden */
* { cursor: none; }

.cursor { pointer-events: none; }

/* Cursor vergrössern auf interaktiven Elementen via :has() */
body:has(a:hover) .cursor,
body:has(button:hover) .cursor,
body:has([animated-item]:hover) .cursor,
body:has(.reviews_slide:hover) .cursor,
body:has(.form_tab:hover) .cursor,
body:has(.reviews_dot:hover) .cursor,
body:has(.reviews_btn-next:hover) .cursor,
body:has(.reviews_btn-prev:hover) .cursor,
body:has(.nav_button:hover) .cursor,
body:has([data-magnetic]:hover) .cursor,
body:has(input[type='submit']:hover) .cursor,
body:has(label:hover) .cursor,
body:has(select:hover) .cursor {
  width: 3rem;
  height: 3rem;
}

[animated-item] { cursor: pointer; }

/* Nav-Link Hover: alle Links auf 30% Opacity, gehoverter auf 100% */
.nav_menu:has(.nav_menu_link:hover) .nav_menu_link {
  opacity: 0.3;
  transition: opacity 0.2s ease;
}
.nav_menu_link:hover { opacity: 1 !important; }

/* Touch-Geräte: Standardcursor wiederherstellen */
@media (pointer: coarse) {
  * { cursor: auto; }
  .cursor { display: none; }
}
```

---

### 4.4 `w-designmode` Embed — Site Settings oder Global Embed

Überschreibt Styles **nur im Webflow Designer** (`html.wf-design-mode` ist aktiv). Elemente, die per JavaScript animiert werden (z.B. auf `height: 0; opacity: 0` gesetzt), sind im Designer bearbeitbar.

**Warum nötig:** `process.js` setzt `.row_text-wrapper` und `.process_keywords` via GSAP auf `height: 0; opacity: 0`. Im Designer läuft kein JavaScript — ohne diesen Block wären diese Elemente im Designer unsichtbar und nicht bearbeitbar.

```css
/* Standardcursor im Designer wiederherstellen */
.wf-design-mode .cursor { cursor: default !important; }

/* Prozess-Steps geöffnet anzeigen */
html.wf-design-mode .process_number { font-size: 6rem; }
html.wf-design-mode .row_text-wrapper,
html.wf-design-mode .process_keywords {
  overflow: visible;
  height: auto;
  opacity: 100%;
  transform: translate(0px, 0rem);
}
html.wf-design-mode .process_text {
  border-color: var(--_semantics---text_blue);
}

/* Reviews Content sichtbar */
html.wf-design-mode .reviews_content { display: block; }

/* Footer overflow für Designer */
html.wf-design-mode .footer { overflow: visible; }

/* Nav Mobile Wrapper: keine Pointer-Events im Designer */
.wf-design-mode .nav_menu-mobile-wrapper { pointer-events: none; }
```

---

### 4.5 `hero-magnet-animation` Embed — Home Page, im Hero-Bereich

CSS für die SVG-Animation im Hero-Bereich (Magnet + Feldlinien). Die Feldlinien starten unsichtbar; `feldlinien.js` setzt `stroke-dasharray` zur Laufzeit.

```css
:root { --glow-duration: 2.5s; }

#magnet-svg { color: var(--_primitives---brand--blue_500); }

.magnet-outline {
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
}
.magnet-fill {
  fill: currentColor;
  stroke: currentColor;
  stroke-width: 2;
}

/* Feldlinien starten unsichtbar; JS setzt stroke-dasharray */
#Feldlinien_Final path {
  fill: none;
  stroke: #a2a2a2;
  stroke-width: 1;
  opacity: 0;
  transition: none;
}

/* Glow-Effekt */
.glow-blur, .glow-core {
  fill: none;
  stroke: var(--_primitives---brand--pink_500);
  stroke-linecap: round;
}
.glow-blur {
  stroke-width: 3;
  filter: blur(4px);
  opacity: 0.8;
}
.glow-core { stroke-width: 2; }
```

---

### 4.6 `custom_css` Embed — Home Page

Seitenspezifische Styles ausschliesslich für die Home-Seite.

```css
/* "Let's talk"-Button: Pressed-State */
.link_button:active .button_background,
.link_button:active .button_circle {
  background-color: var(--_semantics---bacground_alternate_pressed);
}

/* Reviews Dots: erster Dot ohne rechten Margin */
.reviews_dot:first-child { margin-right: 0; }

/* Reviews Text: nach 14 Zeilen abschneiden */
.reviews_text-wrapper {
  display: -webkit-box;
  -webkit-line-clamp: 14;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.reviews_text-wrapper.is-expanded {
  display: block;
  -webkit-line-clamp: unset;
  overflow: visible;
}

/* Projektliste: invertierter Text auf Keywords */
.project_item.text-inverted .keyword {
  color: var(--_semantics---Text_white);
  border-color: var(--_semantics---Text_white);
}

/* Projektliste: erste Liste mit Top-Border auf Desktop */
@media screen and (min-width: 992px) {
  .projects_list:first-child {
    border-top-color: var(--_semantics---border-color);
    border-top-width: var(--border-width);
    border-top-style: solid;
  }
}
```

---

## 5. JavaScript-Dateien

Alle Dateien unter `/js/` im Repository, geladen via jsDelivr CDN.

---

### 5.1 `cursor.js`

**Geladen auf:** Allen Seiten (Site Settings)
**Abhängigkeiten:** GSAP (global via Webflow)

Bewegt das `.cursor`-Element synchron mit dem Mauszeiger. Verwendet `gsap.quickTo` für eine flüssige, leicht verzögerte Bewegung (Lag-Effekt).

**Guard:** Läuft nur wenn `(pointer: fine)` zutrifft — d.h. nur bei Maus/Trackpad, nicht auf Touch-Geräten.

| Element | Beschreibung |
|---------|-------------|
| `.cursor` | Das Cursor-Div-Element (in der Cursor-Komponente) |

**Konfiguration:**
- Animations-Duration: `0.15s`
- Ease: `power2.out`
- Positionierung: `xPercent: -50, yPercent: -50` (Cursor-Mitte auf Maus-Position)

---

### 5.2 `nav.js`

**Geladen auf:** Allen Seiten (Site Settings)
**Abhängigkeiten:** GSAP, Webflow Lottie API (`Webflow.require('lottie')`)

Öffnet und schliesst die mobile Navigation. Animiert das Hamburger-Icon via Lottie (erste Hälfte der Lottie-Animation = Öffnen, zweite Hälfte = Schliessen). Schliesst das Menü bei Klick auf einen Link oder ausserhalb des Menüs.

| Klasse/Attribut | Beschreibung |
|----------------|-------------|
| `.nav_button` | Hamburger-Button zum Öffnen/Schliessen |
| `.nav_menu` | Das Menü-Overlay (bekommt `is-open` Klasse) |
| `.nav_menu-mobile-wrapper` | Wrapper (bekommt `is-open` Klasse, beim Schliessen mit 600ms Verzögerung entfernt) |
| `.nav_lottie` | Container des Lottie-Icons |
| `.nav_menu_link` | Alle Navigationslinks (schliessen Menü bei Klick) |

**Klassen-Logik:**
- `is-open` auf `.nav_menu` → wird sofort beim Öffnen gesetzt und sofort beim Schliessen entfernt
- `is-open` auf `.nav_menu-mobile-wrapper` → sofort beim Öffnen; beim Schliessen mit **600ms Verzögerung** entfernt, damit die Auslauf-Animation abgeschlossen werden kann

**Lottie-Animation:** `playLottie(reverse: false)` = Frames 0 bis Hälfte (Öffnen), `playLottie(reverse: true)` = Frames Hälfte bis 0 (Schliessen). Die Lottie-Instanz wird via `Webflow.push()` asynchron nach dem Webflow-Init ermittelt.

---

### 5.3 `footer-form.js`

**Geladen auf:** Allen Seiten (Site Settings)
**Abhängigkeiten:** Keine

Öffnet und schliesst das Kontaktformular im Footer. Verhindert via `stopPropagation`, dass Klicks innerhalb des Formulars das Formular schliessen.

| Klasse | Beschreibung |
|--------|-------------|
| `.footer_form-wrapper` | Wrapper des Formulars (bekommt `is-closed` Klasse) |
| `.form_tab` | Tab/Button zum Öffnen des Formulars |

**Verhalten:**
- Klick auf `.form_tab` → togglet `is-closed` auf dem Wrapper (`e.stopPropagation()` verhindert Bubbling)
- Klick irgendwo auf der Seite → `is-closed` wird gesetzt (Formular schliesst)
- Klick innerhalb `.footer_form-wrapper` → `stopPropagation()` verhindert Schliessen beim Tippen/Klicken im Formular

### 5.3.1 `submit_embed` — Custom Element `footer_form_submit-btn`

Der Submit-Button des Footer-Formulars ist ein **Custom Element** (`footer_form_submit-btn`) und enthält einen HTML Embed mit der Klasse `submit_embed`.

**Warum nötig:** Webflow-Buttons innerhalb von Custom Elements erhalten nicht automatisch `type="submit"`. Ohne dieses Attribut lösen sie keinen Formular-Submit aus. Das Embed setzt es zur Laufzeit manuell.

```html
<script>
  document.querySelectorAll('button[data-submit]').forEach(btn => {
    btn.setAttribute('type', 'submit');
  });
</script>
```

| Element | Beschreibung |
|---------|-------------|
| `button[data-submit]` | Der Submit-Button (in Webflow mit dem Attribut `data-submit` versehen) |
| `.submit_embed` | Klasse des HTML Embeds innerhalb von `footer_form_submit-btn` |

---

### 5.4 `text-animation.js`

**Geladen auf:** Allen Seiten (Site Settings)
**Abhängigkeiten:** GSAP, SplitText, ScrollTrigger

Zwei Animationen: Buchstabenweise Entrance-Animation des Hero-Texts (Home) und Scroll-basierte Buchstaben-Animation im Footer.

#### Konfiguration

```js
const config = {
  fadeIn: {
    staggerEach: 0.03, // Zeit zwischen den Animationen der einzelnen Buchstaben (s)
    delay: 0.2,        // Delay vor dem ersten Buchstaben (s)
  },
  magnet: {
    stagger: 0.08,     // Zeitlicher Versatz zwischen den Magnet-Buchstaben (s)
    chars: {
      // W(0)e(1)b(2)s(3)i(4)t(5)e(6)s(7) d(8)i(9)e(10) a(11)n(12)z(13)i(14)e(15)h(16)e(17)n(18)
      t:   { index: 5,  x: "24rem",  y: "4rem",   rotation: -10, moveOrder: 2 },
      e6:  { index: 6,  x: "22rem",  y: "2.5rem", rotation:  14, moveOrder: 1 },
      s:   { index: 7,  x: "20rem",  y: "3rem",   rotation: -10, moveOrder: 0 },
      e10: { index: 10, x: "20rem",  y: "-0.5rem",rotation:  13, moveOrder: 2 },
      e17: { index: 17, x: "28rem",  y: "-1.5rem",rotation: -15, moveOrder: 2 },
      n:   { index: 18, x: "24rem",  y: "-2.2rem",rotation:   9, moveOrder: 1 },
    },
  },
};
```

#### Benötigte Attribute und Klassen

| Attribut/Klasse | Beschreibung |
|----------------|-------------|
| `[data-text-fade-in]` | Container der Hero-Überschrift (Home) |
| `[data-text-scroll-in]` | Container der Footer-Text-Animation |
| `.text-big` | Textblöcke innerhalb `[data-text-scroll-in]` |
| `[data-accent]` | Buchstaben in diesem Container bleiben nach Animation blau |
| `[use-letter-spacing]` | Aktiviert Letter-Spacing-Korrektur auf dem ersten `split-char` |
| `.section_hero` | Hero-Sektion — ScrollTrigger-Trigger für Magnet-Animation |

#### Von SplitText erzeugte Klassen

| Klasse | Beschreibung |
|--------|-------------|
| `.split-char` | Jeder einzelne Buchstabe in einem `<div>` |
| `.split-line` | Jede Zeile in einem `<div>` mit `overflow: hidden` (initial) |

#### Overflow-Logik

`.split-line` hat initial `overflow: hidden` (per CSS), damit Buchstaben beim Einblenden von unten kommen. Beim **ersten Scroll-Event** wird `overflow: visible` auf allen `.split-line`-Elementen gesetzt, damit die Magnet-Buchstaben beim Scrollen über den Rand des Containers hinaus animieren können.

#### Scroll-Lock beim Seitenaufruf

Beim Laden der Seite bei `scrollY === 0` wird das Scrollen für die Dauer der Entrance-Animation gesperrt (wheel/touchmove/keydown Events abgefangen via `passive: false`). Dadurch kollidiert die Entrance-Animation nicht mit der Magnet-ScrollTrigger-Animation. **Hinweis:** Der Scrollbalken bleibt sichtbar (kein `overflow: hidden`), um Layout-Shifts zu vermeiden.

#### Magnet-Animation (nur Desktop ≥992px)

Bestimmte Buchstaben aus "Websites die anziehen" bewegen sich beim Scrollen nach rechts. Die Indizes beziehen sich auf die Position im gesplitten Text:

`W(0)e(1)b(2)s(3)i(4)t(5)e(6)s(7) d(8)i(9)e(10) a(11)n(12)z(13)i(14)e(15)h(16)e(17)n(18)`

| Buchstabe | Index | x | y | Rotation | moveOrder |
|-----------|-------|---|---|----------|-----------|
| t | 5 | 24rem | 4rem | -10° | 2 |
| e | 6 | 22rem | 2.5rem | 14° | 1 |
| s | 7 | 20rem | 3rem | -10° | 0 |
| e | 10 | 20rem | -0.5rem | 13° | 2 |
| e | 17 | 28rem | -1.5rem | -15° | 2 |
| n | 18 | 24rem | -2.2rem | 9° | 1 |

`moveOrder` bestimmt die zeitliche Staffelung im GSAP-Timeline (Stagger: 0.08s). ScrollTrigger: Trigger `.section_hero`, `start: "top top"`, `end: "bottom 25%"`, `scrub: true`.

#### Safari-Fix

Kursive `.split-char`-Elemente innerhalb von `.split-line.accent` bekommen `padding: 0.1em; margin: -0.1em`, damit der kursive Überhang nicht an der `inline-block`-Box abgeschnitten wird.

#### Reload-Handling

Wenn `scrollY > 0` beim Laden (Reload bei gescrollter Position): Entrance-Animation wird übersprungen, Buchstaben werden sofort eingeblendet (`gsap.set(chars, { y: 0, opacity: 1 })`), damit kein Konflikt mit dem ScrollTrigger entsteht.

---

### 5.5 `process.js`

**Geladen auf:** Home (Page Settings)
**Abhängigkeiten:** GSAP, ScrollTrigger, ScrollToPlugin

Prozess-Schritte Akkordeon-Animation. Desktop: ScrollTrigger öffnet/schliesst Steps beim Scrollen und passt die `top`-Position des sticky Containers dynamisch an. Mobile: Klick-Toggle.

#### Benötigte Attribute

| Attribut | Beschreibung |
|----------|-------------|
| `[sticky-container]` | Der sticky Container mit allen Steps |
| `[trigger-container]` | Container mit unsichtbaren Trigger-Elementen (gleiche Anzahl wie Steps) |
| `[step]` | Jeder einzelne Prozess-Schritt |
| `[step="reference"]` | Ein Step als Referenz für Höhenmessungen |

#### Erwartete DOM-Struktur pro Step

```
[step]
  ├── cols[0]  → Nummer (.process_number)
  ├── cols[1]  → Text-Spalte
  │     ├── children[0] → Heading
  │     └── children[1] → Text-Wrapper (.row_text-wrapper)
  └── cols[2]  → Rechte Spalte
        └── children[1] → Keywords (.process_keywords)
```

#### Desktop-Animation (≥992px)

- ScrollTrigger pro Step: `start: 'top 20%'`, `scrub: true`
- **Step öffnen (onEnter):** Nummer wird 3× grösser (Heading-Fontsize × 3), Text-Wrapper und Keywords erscheinen (height: auto, opacity: 1, y: 0), Border wird sichtbar; `stickyContainer.top` wird um die Step-Höhe nach oben verschoben
- **Step schliessen (onLeaveBack):** Umgekehrt; `stickyContainer.top` wird nach unten verschoben
- Höhenmessungen werden unsichtbar am `[step="reference"]` simuliert (Inline-Styles kurz setzen, messen, zurücksetzen)

#### Mobile-Animation (<992px)

Klick auf einen Step öffnet/schliesst Text und Keywords via GSAP height-Animation (`height: auto` / `height: 0`). Cursor wird auf `pointer` gesetzt.

#### Breakpoint-Wechsel

`window.matchMedia('(min-width: 992px)').addEventListener('change', init)` ruft `init()` erneut auf, räumt vorherige Event Listener und ScrollTrigger auf und initialisiert den passenden Modus.

---

### 5.6 `slider.js`

**Geladen auf:** Home (Page Settings)
**Abhängigkeiten:** GSAP

Reviews-Slider mit Thumbnail-Vorschau, Swipe-Support und "Mehr lesen"-Funktion.

#### Konfiguration

| Parameter | Wert | Beschreibung |
|-----------|------|-------------|
| `duration` | 0.6s | Dauer der Slide-Animation |
| `ease` | `power2.inOut` | Ease der Slide-Animation |
| `fadeDuration` | 0.3s | Dauer des Content-Fades |
| `fadeEase` | `power2.out` | Ease des Content-Fades |
| `swipeThreshold` | 50px | Mindest-Swipe-Distanz für Navigation |

#### Slider-Positionen

| Position | Zustand | left | Grösse | Sichtbar |
|----------|---------|------|--------|---------|
| 0 (aktiv) | gross, rechts | 42% | 58% × 100% | ja, Farbe |
| 1 (nächste) | Thumbnail | 21% | 19% × 19% | ja, Graustufe |
| 2 (übernächste) | Thumbnail | 0% | 19% × 19% | ja, Graustufe |
| 3+ (wartend) | ausserhalb | -25% | 19% × 19% | nein (opacity: 0) |

**Thumbnail-Höhe:** Berechnet als `19% der Container-Breite in Pixel`, nicht `19%` der Container-Höhe. Dadurch sind Thumbnails auf allen Breakpoints quadratisch.

#### Benötigte DOM-Elemente

| Klasse | Beschreibung |
|--------|-------------|
| `.reviews_carousel-mask` | Haupt-Container des Sliders |
| `.reviews_slide` | Jede Slide (Bild) — absolute Positionierung via GSAP |
| `.reviews_content` | Textinhalt pro Slide |
| `.reviews_content-wrapper` | Wrapper um `.reviews_content` |
| `.reviews_text-wrapper` | Textbereich mit `-webkit-line-clamp: 14` |
| `.reviews_dots` | Container für Dots (werden dynamisch generiert) |
| `.reviews_btn-next` | Weiter-Button |
| `.reviews_btn-prev` | Zurück-Button |
| `.reviews_read-more` | "Mehr lesen"-Link innerhalb eines Reviews |

#### "Mehr lesen"-Logik

`.is-expanded` wird **sofort** beim Klick gesetzt (nicht erst im `onComplete`), damit `-webkit-line-clamp` sofort entfernt wird und GSAP die Ziel-Höhe korrekt messen kann. Beim Slide-Wechsel wird ein expandierter Text automatisch zurückgesetzt.

#### Swipe-Support

`touchstart` / `touchend` auf `.reviews_carousel-mask`. Swipe-Richtung wird aus dem Delta berechnet. Minimum: 50px.

---

### 5.7 `list-hover.js`

**Geladen auf:** Home (Page Settings)
**Abhängigkeiten:** GSAP

Hover-Animation für die Projektliste. Desktop: farbiger Hintergrund fährt von oben oder unten rein (je nach Maus-Eintrittspunkt), Vorschaubild folgt dem Cursor. Mobile: Vorschaubilder statisch sichtbar, keine Hover-Animation.

#### Konfiguration

| Parameter | Wert | Beschreibung |
|-----------|------|-------------|
| `durationIn` | 0.45s | Hintergrund einfahren |
| `durationOut` | 0.5s | Hintergrund ausfahren |
| `easeIn` | `power3.inOut` | |
| `easeOut` | `power2.inOut` | |
| `textFlipThreshold` | 0.5 | Ab 50% Überdeckung Text invertieren |
| `cursorImg.followSpeed` | 0.1s | Wie schnell das Bild dem Cursor folgt |
| `cursorImg.durationIn` | 0.5s | Einblend-Dauer des Vorschaubilds |
| `cursorImg.durationOut` | 0.35s | Ausblend-Dauer des Vorschaubilds |

#### Benötigte Attribute/Klassen

| Attribut/Klasse | Beschreibung |
|----------------|-------------|
| `[animated-item]` | Jedes Projekt-Listen-Element |
| `[animated-bg]` | Hintergrund-Element innerhalb `[animated-item]` |
| `.hover-img-mask` | Container des Vorschaubilds |
| `.projects_img` | Das Vorschaubild (bewegt sich dem Cursor nach) |
| `data-href="URL"` | URL, die beim Klick/Tap geöffnet wird |

#### Text-Invertierung

`checkTextFlip()` liest via `DOMMatrix` den aktuellen Y-Versatz des Hintergrunds aus und berechnet den Überdeckungsgrad. Ab 50% wird `.text-inverted` auf `[animated-item]` gesetzt. Beim Ausfahren wird die Klasse entsprechend entfernt.

#### Richtungserkennung

`getEnterDirection()` / `getExitDirection()` vergleichen die Y-Position der Maus mit der Mitte des Elements, um zu bestimmen ob der Hintergrund von oben oder unten einfährt.

#### Breakpoint-Verhalten

- **Desktop (≥992px):** `.hover-img-mask` initial versteckt; erscheint nur beim `mouseenter`
- **Mobile (<992px):** `.hover-img-mask` statisch sichtbar (`opacity: 1, scale: 1`); `moveX` und `moveY` werden auf `null` gesetzt, damit das zuletzt gehover-te Bild dem Cursor nicht weiterfolgt

#### Link-Öffnung

Klick: `data-href` in neuem Tab öffnen. Auf Mobile: Tap nur bei Bewegung < 10px (`TAP_THRESHOLD`), um Scroll-Gesten auszuschliessen.

---

### 5.8 `feldlinien.js`

**Geladen auf:** Home (Page Settings)
**Abhängigkeiten:** Keine (reines JavaScript mit `requestAnimationFrame`)

Animiert die SVG-Feldlinien im Magnet-Bild des Hero-Bereichs. Zeichnet Pfade via progressiver `stroke-dasharray`-Animation (`0, length` → `length, 0`). Nach 800ms erscheint der Glow per `fadeIn`-Funktion.

#### Benötigte SVG-Elemente

| ID/Klasse | Beschreibung |
|-----------|-------------|
| `#Feldlinien_Final` | SVG-Gruppe mit allen Feldlinien-Pfaden |
| `#Magnet_Glow` | Glow-Element (erscheint nach 800ms) |

#### SVG-Pfad-Opazitäten nach Klasse

| Klasse | Opazität |
|--------|---------|
| `.cls-1` | 0.3 |
| `.cls-2` | 0.6 |
| `.cls-3` | 0.7 |
| `.cls-6` | 0.1 |
| `.cls-8` | 0.5 |
| `.cls-10` | 0.4 |
| `.cls-11` | 0.1 |
| `.cls-12` | 0.2 |
| (alle anderen) | 0.7 |

**Draw-Duration:** 800ms für alle Pfade gleichzeitig. Ease: linear (kein Ease — progressives `requestAnimationFrame`). Glow-Fade: 700ms mit `easeOutCubic`.

---

### 5.9 `magnetic-button.js`

**Geladen auf:** Home (Page Settings)
**Abhängigkeiten:** GSAP

Magnetischer Hover-Effekt — Elemente folgen dem Mauszeiger leicht. Nur auf Desktop (≥992px).

#### Benötigte Elemente

| Klasse/Attribut | Beschreibung |
|----------------|-------------|
| `.link_button` | Haupt-CTA-Buttons (Gesamtes Element + innerer Text reagieren) |
| `.button_text` | Textinhalt innerhalb `.link_button` (halbe Intensität) |
| `.nav_menu_link` | Navigationslinks |
| `[data-magnetic]` | Beliebiges Element magnetisch machen |

#### Intensität und Animation

- Element: ±10px (relX/relY × 10), `duration: 0.3s`, `ease: power2.out`
- Innerer Text (`.button_text`): ±5px (relX/relY × 5), `duration: 0.3s`, `ease: power2.out`
- Beim Verlassen: elastische Rückfeder-Animation, `duration: 0.6s`, `ease: elastic.out(1, 0.5)`

**Positions-Berechnung:** Der relative Maus-Versatz innerhalb des Elements wird normalisiert auf den Bereich -1 bis +1 (`relX = (clientX - elementCenterX) / (elementWidth / 2)`).

---

## 6. Cursor-System

Das Cursor-System besteht aus drei voneinander abhängigen Teilen:

### 6.1 Webflow-Komponente: Cursor

Eine wiederverwendbare Webflow-Komponente, die das `.cursor`-Div enthält. In der Komponente werden:
- Grösse und CSS-Transitions des `.cursor`-Divs definiert (Webflow-Styles)
- der `cursor_embed` mit den CSS-Styles eingebettet (HTML Embed)

### 6.2 `cursor.js` — Bewegung

- Liest `mousemove`-Events
- Bewegt `.cursor` via `gsap.quickTo` (x und y) mit `duration: 0.15`
- `gsap.set(cursor, { xPercent: -50, yPercent: -50 })` zentriert das Cursor-Element auf der Mausposition
- Läuft nur bei `(pointer: fine)` — kein Effekt auf Touch-Geräten

### 6.3 `cursor_embed` CSS — Verhalten

- `* { cursor: none }` — Standard-Cursor überall ausblenden
- Grösse im Normalzustand via Webflow-Klassen definiert
- `:has()`-Selektoren weiten den Cursor auf 3rem aus bei Hover über interaktive Elemente
- `@media (pointer: coarse)` stellt Standard-Cursor wieder her und versteckt `.cursor`

### 6.4 Cursor auf neuen Elementen vergrössern

Neuen Selektor in `cursor_embed` in der Cursor-Komponente ergänzen:

```css
body:has(.mein-element:hover) .cursor {
  width: 3rem;
  height: 3rem;
}
```

---

## 7. Webflow-Attribute & Klassen – Übersicht

### 7.1 Custom Attribute (von Scripts erwartet)

| Attribut | Script | Beschreibung |
|----------|--------|-------------|
| `[data-text-fade-in]` | text-animation.js | Hero-Text mit SplitText-Entrance-Animation |
| `[data-text-scroll-in]` | text-animation.js | Footer-Text mit Scroll-Animation |
| `[data-accent]` | text-animation.js | Buchstaben bleiben nach Animation blau |
| `[use-letter-spacing]` | text-animation.js | Letter-Spacing-Korrektur auf erstem Buchstaben |
| `[animated-item]` | list-hover.js | Projektlisten-Element mit Hover-Animation |
| `[animated-bg]` | list-hover.js | Hintergrund-Element für Hover-Animation |
| `[data-href]` | list-hover.js | URL, die bei Klick/Tap geöffnet wird |
| `[data-magnetic]` | magnetic-button.js | Element mit magnetischem Hover-Effekt |
| `[sticky-container]` | process.js | Sticky Container der Prozess-Steps |
| `[trigger-container]` | process.js | Container mit Scroll-Trigger-Elementen |
| `[step]` | process.js | Einzelner Prozess-Schritt |
| `[step="reference"]` | process.js | Referenz-Step für Höhenmessungen |

### 7.2 CSS-Klassen (von Scripts erwartet)

| Klasse | Script | Beschreibung |
|--------|--------|-------------|
| `.cursor` | cursor.js | Custom Cursor Element |
| `.nav_button` | nav.js | Navigation Hamburger-Button |
| `.nav_menu` | nav.js | Navigation Menü-Overlay |
| `.nav_menu-mobile-wrapper` | nav.js | Navigation Mobile Wrapper |
| `.nav_lottie` | nav.js | Lottie-Animation Container |
| `.nav_menu_link` | nav.js, magnetic-button.js | Navigationslinks |
| `.footer_form-wrapper` | footer-form.js | Footer Formular Wrapper |
| `.form_tab` | footer-form.js | Footer Formular Tab |
| `.section_hero` | text-animation.js | Hero-Sektion (ScrollTrigger-Trigger) |
| `.text-big` | text-animation.js | Textblöcke für Footer-Scroll-Animation |
| `.hover-img-mask` | list-hover.js | Vorschaubild-Container |
| `.projects_img` | list-hover.js | Vorschaubild (folgt dem Cursor) |
| `.reviews_carousel-mask` | slider.js | Slider Haupt-Container |
| `.reviews_slide` | slider.js | Einzelne Slide |
| `.reviews_content` | slider.js | Review-Textinhalt |
| `.reviews_content-wrapper` | slider.js | Wrapper um Content |
| `.reviews_text-wrapper` | slider.js | Review-Text mit Line-Clamp |
| `.reviews_dots` | slider.js | Dots-Container |
| `.reviews_btn-next` | slider.js | Slider Weiter-Button |
| `.reviews_btn-prev` | slider.js | Slider Zurück-Button |
| `.reviews_read-more` | slider.js | "Mehr lesen"-Link |
| `.link_button` | magnetic-button.js | CTA-Buttons |
| `.button_text` | magnetic-button.js | Text innerhalb CTA-Button |

### 7.3 Von Scripts erzeugte Klassen

| Klasse | Script | Wann gesetzt |
|--------|--------|-------------|
| `.split-char` | text-animation.js | Generiert von SplitText — jeder Buchstabe |
| `.split-line` | text-animation.js | Generiert von SplitText — jede Textzeile |
| `.animate` | text-animation.js | Nach abgeschlossener Entrance-Animation |
| `.is-open` | nav.js | Navigation ist geöffnet |
| `.is-closed` | footer-form.js | Footer-Formular ist geschlossen |
| `.text-inverted` | list-hover.js | Hover-Hintergrund überdeckt Element zu >50% |
| `.is-active` | slider.js | Aktiver Slider-Dot |
| `.is-expanded` | slider.js | Review-Text ist aufgeklappt |
| `.reviews_dot` | slider.js | Generiert — Dot-Elemente pro Slide |

---

## 8. Externe Abhängigkeiten (GSAP)

GSAP wird von Webflow automatisch geladen (integriert im Webflow-Runtime). Keine separate Einbindung nötig.

| Plugin | Verwendet in |
|--------|-------------|
| `ScrollTrigger` | text-animation.js, process.js |
| `ScrollToPlugin` | process.js |
| `SplitText` | text-animation.js |

GSAP-Plugins werden explizit registriert:
- `text-animation.js`: `gsap.registerPlugin(SplitText, ScrollTrigger)`
- `process.js`: `gsap.registerPlugin(ScrollTrigger, ScrollToPlugin)`

---

## 9. Lokale Entwicklung

### 9.1 Repository klonen

```bash
git clone https://github.com/Gramatica-Design/GD-Website
cd GD-Website
```

### 9.2 HTTPS für den Live Server (einmalig einrichten)

Webflow läuft über HTTPS und blockiert HTTP-Scripts (Mixed Content Policy). Der Live Server muss daher ebenfalls über HTTPS laufen.

```bash
# mkcert installieren (lokale CA für selbstsignierte Zertifikate)
brew install mkcert
mkcert -install        # Installiert lokale CA im System-Keychain (Touch ID erforderlich)

# Zertifikate für localhost erstellen
cd ~
mkcert localhost 127.0.0.1
# Erzeugt: ~/localhost+1.pem  und  ~/localhost+1-key.pem
```

VS Code `settings.json` (Benutzer-Einstellungen):

```json
"liveServer.settings.https": {
  "enable": true,
  "cert": "/Users/angelogramatica/localhost+1.pem",
  "key": "/Users/angelogramatica/localhost+1-key.pem",
  "passphrase": ""
}
```

### 9.3 Lokales Testen aktivieren

1. **Site Settings → Custom Code → Before `</body>`:** `isLocal_ss = true` setzen
2. **Home Page → Settings → Custom Code → Before `</body>`:** `isLocal = true` setzen
3. Live Server in VS Code starten (Port 5500)

Scripts werden dann von `https://localhost:5500/js/` geladen.

**Nach dem Test:** Beide Variablen wieder auf `false` zurücksetzen, Änderungen committen und pushen.

### 9.4 Workflow: Änderung in JS-Datei

```bash
# 1. Datei bearbeiten
# 2. Änderungen committen
git add js/dateiname.js
git commit -m "kurze Beschreibung der Änderung"
git push

# 3. jsDelivr Cache purgen, damit die Änderung live erscheint
# → https://www.jsdelivr.com/tools/purge
# Beispiel-URL: https://cdn.jsdelivr.net/gh/Gramatica-Design/GD-Website@main/js/slider.js
```

### 9.5 Android-Debugging via USB

1. Android: Entwickleroptionen → USB-Debugging aktivieren
2. USB-Modus: "Dateiübertragung" wählen
3. Im Terminal: `adb devices` ausführen (Gerät sollte erscheinen)
4. Desktop Chrome: `chrome://inspect/#devices` öffnen und Seite inspizieren

---

## 10. Änderungshinweise & Erweiterungen

### Neues interaktives Element → Cursor vergrössern

Selektor in `cursor_embed` in der **Cursor-Webflow-Komponente** ergänzen:

```css
body:has(.mein-neues-element:hover) .cursor {
  width: 3rem;
  height: 3rem;
}
```

### Neue Seite → page-spezifische Scripts

Scriptloader analog dem Home-Loader in den **Page Settings → Custom Code → Before `</body>`** der neuen Seite einfügen. Nur benötigte Dateien aufführen.

### Magnet-Buchstaben anpassen

Konfiguration in `text-animation.js` unter `config.magnet.chars`. Der `index` bezieht sich auf die Position im gesplitten Text "Websites die anziehen":

```
W(0)e(1)b(2)s(3)i(4)t(5)e(6)s(7) d(8)i(9)e(10) a(11)n(12)z(13)i(14)e(15)h(16)e(17)n(18)
```

### Prozess-Steps hinzufügen

1. Neuen `[step]`-Block in `[sticky-container]` hinzufügen (gleiche DOM-Struktur wie bestehende Steps)
2. Entsprechenden Trigger-Block (leeres `div`) in `[trigger-container]` hinzufügen (Anzahl muss übereinstimmen)
3. Für den neuen Step gilt ebenfalls der `w-designmode`-CSS-Block — prüfen ob Styles korrekt angezeigt werden

### Neuen Script hinzufügen

1. Datei unter `/js/` im Repository ablegen
2. Dateinamen im entsprechenden Scriptloader-Array ergänzen (Site Settings oder Page Settings)
3. Committen, pushen, CDN-Cache purgen

### jsDelivr-Cache purgen

Nach jedem Push auf `main`, wenn Änderungen nicht erscheinen:
- Tool: https://www.jsdelivr.com/tools/purge
- Die betroffenen CDN-URLs eingeben (eine pro Zeile):
  ```
  https://cdn.jsdelivr.net/gh/Gramatica-Design/GD-Website@main/js/cursor.js
  https://cdn.jsdelivr.net/gh/Gramatica-Design/GD-Website@main/js/slider.js
  ```

---

## 11. Bekannte Probleme

### 11.1 Navigation Scroll-Präzision (erster Klick)

**Symptom:** Beim ersten Klick auf „Work" oder „About" in der Navigation landet die Seite ~107px zu tief. Beim zweiten Klick auf denselben oder einen anderen Link funktioniert die Navigation präzise.

**Root Cause:** Zwei überlagerte Probleme:

1. **Webflows eigener Scroll-Handler** berechnet die Zielposition einmalig beim Klick als feste Pixelzahl und scrollt dorthin. Ein parallel laufender eigener Handler kommt zu spät.
2. **Dynamische Dokumenthöhe:** Die Process-Section expandiert ihre Steps über GSAP-ScrollTrigger-Animationen. Beim Durchscrollen durch die Process-Section wächst die Dokumenthöhe — die vorab berechnete Zielposition stimmt dadurch nicht mehr.

Beim ersten Klick treffen beide Probleme zusammen. Beim zweiten Klick hat sich Webflow neu kalibriert und die Zielposition stimmt zufällig.

**Versuche:**

| Ansatz | Beschreibung | Ergebnis |
|--------|-------------|---------|
| rAF chaseScroll | `getBoundingClientRect().top` kontinuierlich messen, mit `window.scrollBy` nachkorrigieren | Funktioniert beim zweiten Klick, nicht beim ersten |
| Capture-Phase Interception | Event-Listener mit `{ capture: true }` + `e.stopPropagation()` um Webflows Handler zu verhindern | Hat das Problem ebenfalls nicht gelöst |

**Status:** Offen. Die Abweichung ist subtil (~107px bei einer langen Seite) und stört die UX nicht stark genug für eine weitere Prioritisierung.

**Mögliche zukünftige Ansätze:**
- `ScrollTrigger.refresh()` vor dem Scroll aufrufen, damit alle ScrollTrigger-Positionen aktuell sind
- `process.js` so anpassen, dass es beim Initialisieren alle Steps sofort in ihren finalen Zustand bringt (statt animiert beim Scrollen)
- Webflows Smooth-Scroll über die Webflow JS-API (`Webflow.destroy()`) deaktivieren und vollständig durch eigene Logik ersetzen
