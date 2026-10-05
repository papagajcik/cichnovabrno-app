# Čichnova Brno – aplikace pro počítač

Školní portál Čichnova Brno jako samostatná aplikace pro Windows, macOS a Linux: rozvrh, jídelníček, HitParáda a hry na jednom místě.

## Stažení

Nejnovější verzi najdeš v sekci **[Releases](../../releases/latest)**. Stáhni soubor pro svůj systém:

| Systém | Soubor |
| --- | --- |
| Windows | `Cichnova-Brno-…-win.exe` |
| macOS | `Cichnova-Brno-…-mac.dmg` |
| Linux | `Cichnova-Brno-…-linux.AppImage` |

## Instalace

**Windows** – spusť stažený `.exe` a projdi instalátor. Pokud se objeví modré okno „Počítač byl chráněn“, klikni na **Další informace** a pak na **Přesto spustit**. Aplikace zatím nemá placený podpis, proto Windows takto upozorňuje. (Jak podepisování zapnout: viz `PODEPISOVANI.md`.)

**macOS** – otevři `.dmg` a přetáhni aplikaci do složky Aplikace. Při prvním spuštění na ni klikni pravým tlačítkem a zvol **Otevřít**. Kdyby se zobrazilo, že je aplikace poškozená, spusť v Terminálu:

```
xattr -cr "/Applications/Čichnova Brno.app"
```

**Linux** – nastav souboru právo ke spuštění a spusť ho:

```
chmod +x Cichnova-Brno-*-linux.AppImage
./Cichnova-Brno-*-linux.AppImage
```

Na novějším Ubuntu může být potřeba doinstalovat `libfuse2`.

## Co aplikace umí

Při prvním spuštění tě aplikace provede všemi funkcemi a hned si je můžeš zapnout. Úvod najdeš kdykoli znovu v **Nastavení → Více**, v nabídce ikony v liště nebo klávesou **F1**.

- **Rozvrh, jídelníček, HitParáda a hry** stejně jako na webu portálu.
- **Funguje i při výpadku** – když se portál nenačte, otevře se zabalená kopie a po obnovení připojení se aplikace vrátí na živou verzi.
- **Ikona v systémové liště** – zavřením okna aplikace neskončí, jen se schová. Ukončit ji můžeš z nabídky ikony.
- **Mini okno „Teď / Další hodina“** – malé okno, které zůstává nad ostatními a ukazuje aktuální hodinu, učebnu a zbývající čas. Otevřeš ho z nabídky ikony v liště, zkratkou Ctrl + Alt + M, nebo ho můžeš nechat otevírat při každém startu.
- **Odpočet do konce hodiny nebo přestávky** – na macOS přímo u ikony v liště, na Windows a Linuxu po najetí myší na ikonu.
- **Notifikace** – upozornění na změnu v rozvrhu aktuálního týdne a na novou písničku v HitParádě v záložce Tento týden.
- **Export rozvrhu do kalendáře** – uloží aktuální týden jako soubor `.ics`, který otevřeš v Google Kalendáři, Outlooku nebo Kalendáři v Apple.
- **Spuštění po startu systému** – zapneš v nabídce ikony.
- **Automatické aktualizace** – aplikace sama hlídá novou verzi. Na Windows a Linuxu se stáhne a nabídne instalaci. Na macOS tě odkáže na stažení.

Aby fungovaly notifikace, mini okno a odpočet, vyber v aplikaci svou třídu nebo jméno učitele a jednou otevři rozvrh.

## Klávesová zkratka

**Ctrl + Alt + C** (na macOS **Cmd + Alt + C**) zobrazí nebo skryje okno aplikace. **Ctrl + Alt + M** (**Cmd + Alt + M**) otevře nebo zavře mini okno.

## Nabídka ikony v liště

Ikonu najdeš vedle hodin (ve Windows možná pod šipkou „Zobrazit skryté ikony“). Klikni na ni pravým tlačítkem. Najdeš tam: otevřít aplikaci, mini okno, mini okno při startu, export rozvrhu, zapnutí a vypnutí notifikací, spouštění po startu systému, kontrola aktualizací a ukončení.
