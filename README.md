# Position Receipt

**A print-ready trade-journal generator.** Fill in a trade once and get a clean two-page A5 landscape "receipt" PDF to file in a physical trading journal — with full Persian (RTL) and English support.

Built as a single-page, framework-free web app: no backend, no build step, all data stays in your browser.

## Features

- **Two-step flow** — set up the account, challenge/phase and position code, then log the trade details.
- **Smart position codes** — date-based codes (e.g. `202609081`) with automatic next-number suggestion that keeps the daily suffix sequence.
- **Full trade record** — symbol, session, LONG/SHORT, size, entry / exit / stop / take-profit, and execution times in both broker time and Tehran time.
- **6-tip pre-trade discipline checklist** with a live score.
- **R-multiple outcome selector** — quick pills for the result of each trade.
- **Notes** — separate technical and sentimental notes, with voice dictation and Persian text cleanup (digit/character normalisation, ZWNJ fixes).
- **Chart screenshot attachment** printed on the receipt.
- **Memory lists** — saved accounts, challenges and favourite symbols with combobox pickers.
- **History** — every receipt is stored locally (IndexedDB) and can be reopened, edited and re-exported.
- **Strict 2-page A5 PDF export** — rasterised page by page for a pixel-stable print layout; download, print, share, or hand off to Google Drive.

## Tech

Vanilla JavaScript (ES2020) · HTML · CSS · IndexedDB / localStorage · html2canvas · jsPDF · html2pdf.js · Lucide icons · Inter / Outfit / JetBrains Mono / Vazirmatn

## Run it

No install needed — open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8080    # then open http://localhost:8080
```

## Files

```
index.html   App shell, setup screen, trade form, modals
style.css    Dark UI theme + the print-ready receipt styles
app.js       State, storage, form logic, PDF rendering and export
libs/        Bundled html2pdf and Lucide
```

## Notes

- Data lives only in the browser it was entered in; clear site data and the history is gone, so export PDFs you want to keep.
- The receipt print styles are intentionally frozen so every receipt keeps the same layout.
