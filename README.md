# Čichnova Brno – desktopová aplikace

Instalátory (Windows `.exe`, macOS `.dmg`, Linux `.AppImage`) se sestaví automaticky přes GitHub Actions
po každém pushi do větve `main`/`master` a objeví se v **Releases**.

- **Nová verze:** zvyš `version` v `package.json` (např. 1.0.1) a pushni.
- **Adresa webu:** konstanta `LIVE` na začátku `main.js` (výchozí `https://cichnovabrno.cz/`).
- **Zkratka:** Ctrl/Cmd + Alt + C zobrazí nebo skryje okno.
- **Bez podpisu:** Windows ukáže SmartScreen („Další informace → Přesto spustit“), macOS spusť přes pravé tlačítko → Otevřít
  (při hlášce „poškozená“: `xattr -cr "/Applications/Cichnova Brno.app"`).
