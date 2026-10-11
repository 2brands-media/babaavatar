# Sicherheitsupdates 11.10.2026

Electron 41.10.6 und Electron-Builder 26.17.0 ersetzen die betroffenen alten Hauptversionen. Der installierte Builder benutzt den gepflegten @electron/get-Downloader 5.1.0, dessen Checksum-Prüfung mit einem echten lokalen Download und einem manipulierten Prüfsummenfall getestet wird. Builder-/Updater- und Vite-Abhängigkeiten wurden gezielt aktualisiert.

Typprüfung für Main/Preload/Renderer, ESLint ohne Codewarnungen und alle drei Produktionsbundles gehören zum Gate. Zusätzlich prüft die Linux-CI das paketierte Verzeichnis ausdrücklich ohne Veröffentlichung. Das belegt weder Windows-/macOS-Signing noch Webcam-/GPU-/OBS-Tracking auf echter Hardware. Bestehende installierte Desktopprogramme erhalten durch einen Quellcommit allein kein Update.

Die CI und der tägliche Abhängigkeitscheck vergleichen das Lockfile offline mit der frisch geladenen öffentlichen OSV-Datenbank. Kritische/hohe Befunde, unbekannte Schweregrade, fehlende Reports und Scannerfehler blockieren. Kein privates Lockfile wird an einen Online-Scanner übertragen. Ein moderater Befund bleibt sichtbar; im aktuellen Lockfile gibt es keine kritischen/hohen Befunde.
