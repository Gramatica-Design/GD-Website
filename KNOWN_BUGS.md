# Known Bugs — Gramatica Design New

Bekannte Bugs mit Root-Cause-Analyse, bisherigen Lösungsversuchen und Empfehlungen.

---

## BUG-01 — Navigation Scroll-Präzision

**Status:** Offen  
**Betrifft:** `nav.js`  
**Sections:** Work, About  
**Priorität:** Niedrig

### Symptom

Beim ersten Klick auf „Work" oder „About" in der Navigation landet die Seite ~107px zu tief. Ab dem zweiten Klick funktioniert die Navigation korrekt.

### Root Cause

Zwei Probleme treffen beim ersten Klick zusammen:

1. **Webflows eigener Scroll-Handler** berechnet die Zielposition einmalig beim Klick als feste Pixelzahl. Ein parallel laufender eigener Handler kommt zu spät.
2. **Dynamische Dokumenthöhe:** Die Process-Section expandiert ihre Steps via GSAP-ScrollTrigger-Animationen. Beim Durchscrollen wächst die Dokumenthöhe — die vorab berechnete Zielposition stimmt nicht mehr.

### Lösungsversuche

| Ansatz | Beschreibung | Ergebnis |
|--------|-------------|---------|
| rAF chaseScroll | `getBoundingClientRect().top` auf jedem Frame neu messen, mit `window.scrollBy` nachkorrigieren | Funktioniert beim zweiten Klick, nicht beim ersten |
| Capture-Phase Interception | Event-Listener mit `{ capture: true }` + `e.stopPropagation()` | Hat das Problem ebenfalls nicht gelöst |

### Mögliche zukünftige Ansätze

- `ScrollTrigger.refresh()` vor dem Scroll aufrufen
- `process.js` so anpassen, dass alle Steps beim Initialisieren sofort in ihren finalen Zustand gebracht werden
- Webflows Smooth-Scroll via `Webflow.destroy()` vollständig deaktivieren

---

## BUG-02 — Custom Cursor Re-Entry

**Status:** Teilweise behoben (Commit `6c0642e`)  
**Betrifft:** `cursor.js`  
**Priorität:** Niedrig

### Symptom

Beim Zurückwechseln in den Browser von einer anderen Applikation animiert der Custom Cursor sichtbar von seiner alten Position zur neuen Maus-Position.

### Root Cause

Browser feuern keine `mousemove`-Events wenn das Fenster nicht fokussiert ist (Browser-Sicherheitsbeschränkung). `gsap.quickTo` animiert beim ersten Event vom alten zum neuen Ort.

### Angewandter Fix

`mouseenter` auf `document` setzt den Cursor via `gsap.set` sofort an die korrekte Position — ohne Animation.

```js
document.addEventListener("mouseenter", (e) => {
  gsap.set(cursor, { x: e.clientX, y: e.clientY });
});
```

**Verbleibende Einschränkung:** Bei direktem Klick ohne Hover-Phase feuert `mouseenter` nicht — kurzer Sprung bleibt.

### Empfehlung: Custom Cursor langfristig entfernen

Der Custom Cursor ist ein 3-teiliges System (Webflow-Komponente + `cursor.js` + `cursor_embed` CSS) mit inherenten Browser-Einschränkungen. Der System-Cursor bietet bessere, konsistentere UX ohne Implementierungsaufwand.

**Schritte zum Entfernen:**

1. In Webflow: Cursor-Komponente aus allen Seiten entfernen
2. `cursor.js` aus dem Site-Script-Loader entfernen
3. `* { cursor: none; }` aus `cursor_embed` entfernen
4. `cursor_embed` vollständig löschen
5. Alle `body:has(…:hover) .cursor`-Selektoren aus dem CSS entfernen
