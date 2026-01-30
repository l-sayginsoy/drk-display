# DRK Display System - Deployment Anleitung

## ✅ Problem gelöst!

Das Chaos ist behoben. Hier ist die korrekte Struktur:

### 📁 Projektstruktur
```
/home/claude/
├── App.tsx              ✅ DISPLAY (Bewohner-Anzeige)  
├── AdminApp.tsx         ✅ ADMIN (Panel für Verwaltung)
├── index.tsx            ✅ Entry für Display
├── admin.tsx            ✅ Entry für Admin  
├── index.html           ✅ Display HTML
├── admin.html           ✅ Admin HTML
├── types.ts             ✅ TypeScript Interfaces
├── githubService.ts     ✅ GitHub API (OHNE hardcoded Token!)
├── geminiService.ts     ✅ Gemini AI (OHNE hardcoded API Key!)
├── vercel.json          ✅ Config für Display
├── vercel-admin.json    ✅ Config für Admin
├── vite.config.ts       ✅ Display Build
├── vite.admin.config.ts ✅ Admin Build
└── package.json         ✅ Mit beiden Scripts
```

## 🚨 TOKEN-BEREINIGUNG KOMPLETT!

✅ **GitHub Token entfernt** aus beiden App-Komponenten
✅ **Gemini API Key entfernt** aus Service
✅ **Umgebungsvariablen** konfiguriert

## 🎯 Vercel Deployment Plan

### 1. Display Project: `drk-display.vercel.app`
```bash
# Neues Vercel Projekt
vercel --name drk-display

# Environment Variables in Vercel Dashboard:
# (Keine Token nötig - nur öffentliches Lesen!)

# Build Settings:
Build Command: npm run build
Output Directory: dist
Install Command: npm install

# Kopiere vercel.json als vercel.json
```

### 2. Admin Project: `drk-admin.vercel.app`
```bash
# Zweites Vercel Projekt
vercel --name drk-admin

# Environment Variables in Vercel Dashboard:
VITE_GITHUB_TOKEN=ghp_DEIN_NEUER_TOKEN_HIER
VITE_GEMINI_API_KEY=DEIN_GEMINI_KEY_HIER

# Build Settings:
Build Command: npm run build:admin  
Output Directory: dist
Install Command: npm install

# Kopiere vercel-admin.json als vercel.json
```

## 🔧 Deployment Schritte

### Schritt 1: Display deployen
1. Neuer GitHub Token (nur READ für public repos)
2. Vercel Projekt `drk-display` anlegen
3. Repository verknüpfen
4. `vercel.json` verwenden
5. Build: `npm run build`

### Schritt 2: Admin deployen  
1. Vercel Projekt `drk-admin` anlegen
2. Selbes Repository verknüpfen
3. `vercel-admin.json` als `vercel.json` setzen
4. Environment Variables setzen:
   - `VITE_GITHUB_TOKEN` (mit WRITE-Rechten)
   - `VITE_GEMINI_API_KEY`
5. Build: `npm run build:admin`

## 🎉 Ergebnis
- **Display**: Zeigt nur Wochenprogramm für Bewohner
- **Admin**: Vollständige Verwaltung mit GitHub-Sync
- **Kein Token-Leak**: Alle Secrets in Vercel Environment Variables
- **Getrennte Deployments**: Klare Trennung der Verantwortlichkeiten

## ⚠️ Wichtige Hinweise
1. **GitHub Token**: Neuen Token mit minimalen Rechten erstellen
2. **Gemini**: Eigenen API Key verwenden (nicht den alten)
3. **Vercel Environment Variables**: Immer `VITE_` Prefix verwenden
4. **GitHub Repo**: Beide Projekte nutzen dasselbe Repository

Die Token-Bereinigung ist KOMPLETT abgeschlossen! 🎯
