# Electric Payment

A small web app for tracking home EV charging costs. Each entry records a meter reading, a photo of the meter, and whether it's been paid; the app works out how many kWh were charged since the last reading and what that costs.

**Live:** https://electric-payme.netlify.app/

Anyone can view the payment list. Adding, editing, deleting, and marking payments as paid require signing in.

## Features

- **Dashboard** – total still unpaid (with a one-click *mark all as paid*), current meter reading, this month's cost, and the monthly average over the last 12 months.
- **Payment list** – cards grouped by year, each showing the date, kWh charged since the previous reading, meter reading, price, and a paid/unpaid badge that toggles with one tap.
- **Search, filter, sort** – search by date, month name, amount, or reading; filter by status and year; sort by date, amount, or kWh. Filters are kept in the URL, so refresh and shared links keep the same view.
- **Quick add** – the date defaults to today, the meter photo can be taken straight from the phone camera and uploads immediately, and the price is calculated live as you type the new reading.
- **Hebrew and English**, with right-to-left layout for Hebrew.
- **Mobile-first layout** with a floating "new payment" button.

## How the price is calculated

```
price = (new reading − previous highest reading) × PRICE_PER_KWH
```

`PRICE_PER_KWH` (currently `0.57` ₪) is defined once in [`src/utils/payments.js`](src/utils/payments.js). The price is stored with each payment when it's created, so changing the rate doesn't affect past entries.

## Tech stack

| | |
|---|---|
| UI | React 18 (Create React App), React Router 6, React-Bootstrap with the Bootswatch *Lux* theme, Bootstrap Icons |
| State | Redux + redux-thunk |
| Backend | Firebase Authentication, Cloud Firestore, Cloud Storage |
| Hosting | Netlify, deployed automatically on every push to `main` |

## Getting started

Requires Node.js 18 or later.

```bash
npm install
npm start          # http://localhost:3000
```

The app connects to the existing Firebase project configured in [`src/firebase.js`](src/firebase.js). To run it against your own Firebase project, replace that config and create the collections described below.

### Scripts

| Command | What it does |
|---|---|
| `npm start` | Development server with hot reload |
| `npm run build` | Production build into `build/` |
| `npm test` | Test runner |
| `npx eslint src` | Lint (Netlify treats lint warnings as build errors unless `CI=false`) |

### Debugging in VS Code

[`.vscode/launch.json`](.vscode/launch.json) has a **Debug app** configuration: press `F5` and it runs `npm start`, then opens Chrome attached to the debugger so breakpoints in `src/` work. In development the Redux store is also available in the browser console as `window.store`.

## Data model

**`payments/{id}`**

| Field | Type | Example |
|---|---|---|
| `KWH` | number | `9083` – cumulative meter reading, not usage |
| `date` | string | `"2026-10-14"` – must be `YYYY-MM-DD` |
| `price` | number | `112.29` |
| `paid` | string | `"Yes"` / `"No"` |
| `image` | string | Storage download URL of the meter photo |
| `updateTime` | timestamp | |

**`KWH/{id}`** – mirrors `KWH` and `date` under the same id as the payment; used to find the current (highest) meter reading when adding a new entry. Keep the two collections in sync when editing data by hand.

Meter photos are stored in Cloud Storage and deleted together with their payment.

## Project structure

```
src/
├── App.js                  routes; RequireAuth guards /create and /manage/:id
├── firebase.js             Firebase app, auth, Firestore and Storage instances
├── store.js                Redux store
├── actions/                Firebase reads/writes, dispatched as Redux actions
├── reducers/               Redux state for list, details, create, update, delete
├── constants/              Redux action types
├── contexts/
│   ├── AuthContext.js      signed-in user from Firebase (onAuthStateChanged)
│   └── I18nContext.js      Hebrew/English strings and text direction
├── screens/
│   ├── ManageScreen.js     dashboard, filters and payment list (home page)
│   ├── CreateScreen.js     add a payment
│   ├── UpdateScreen.js     edit a payment
│   └── LoginScreen.js
├── components/             SummaryCards, PaymentFilters, PaymentCard, Header, Loader, …
└── utils/payments.js       price, usage, summaries, search/sort/grouping, formatting
```

## Deployment

Netlify builds from `main` using [`netlify.toml`](netlify.toml): `npm run build`, publishing `build/`, with `CI=false` so the Bootstrap theme's autoprefixer warning doesn't fail the build. All paths are rewritten to `index.html` so client-side routes survive a page refresh.

To roll back, open the site in Netlify → **Deploys**, pick an earlier deploy, and choose **Publish deploy**.
