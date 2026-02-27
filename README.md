# RateSwitch X

A privacy-first currency exchange dashboard. No accounts, no tracking, no external fonts, no fingerprinting — just exchange rates and charts.

![currency exchange dashboard](https://media.giphy.com/media/xT9IgG50Lg7ruszbCU/giphy.gif)

[Live Demo](https://rateswitch-x.vercel.app)

## What it does

- Real-time currency conversion using the Frankfurter API
- Historical rate charts (7D / 30D / 90D / 1Y)
- Multi-currency converter
- Favorites system
- Works offline after first load (PWA, Service Worker)
- Installable as a standalone app

## Stack

- Vanilla JavaScript — no frameworks, no build step
- Pure CSS
- SVG charts
- Service Worker for offline caching
- localStorage for favorites and preferences
- [Frankfurter API](https://www.frankfurter.app/) for exchange rate data

Total bundle size: under 50KB.

## Running Locally

No build required. Serve the directory with any static server:

```bash
python3 -m http.server 8000
# or
npx serve .
```

Open [http://localhost:8000](http://localhost:8000).

## Project Structure

```
rateswitch-x/
├── index.html
├── style.css
├── app.js          # Main entry point
├── exchange.js     # Currency conversion logic
├── charts.js       # SVG chart rendering
├── favorites.js    # Favorites management
├── storage.js      # localStorage abstraction
├── cache.js        # API response caching (15min TTL)
├── ui.js           # DOM updates and rendering
├── service-worker.js
└── manifest.json
```

## Keyboard Shortcuts

| Key   | Action                    |
|-------|---------------------------|
| `S`   | Swap currencies           |
| `F`   | Toggle favorite           |
| `M`   | Toggle multi-currency     |
| `1-4` | Switch chart timeframes   |

## Deployment

Any static host works: Vercel, Netlify, GitHub Pages, Render.

## License

MIT
