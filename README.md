# Expense Canvas

## Introduction

**Expense Canvas** is a modern, responsive web application that helps users track and manage their personal and business expenses effortlessly. Built with a focus on performance, accessibility, and a sleek user experience, the app provides features such as multi‑currency support, expense categorisation, project‑based tracking, and interactive visualisations.

## Technologies Used

- **React** with **TypeScript** – component‑based UI and static typing.
- **Vite** – fast development server and build tooling.
- **Tailwind CSS** (optional – can be swapped for vanilla CSS) – utility‑first styling for rapid UI iteration.
- **React Query** – data fetching and caching.
- **Axios** – HTTP client for API calls.
- **Jest & React Testing Library** – unit and integration testing.
- **ESLint & Prettier** – code quality and formatting.
- **dotenv** – environment variable management.

## Project Structure

```
expense-canvas/
├─ .env.local               # Local environment variables
├─ README.md                # Project documentation (this file)
├─ package.json
├─ tsconfig.json
├─ vite.config.ts
├─ src/
│  ├─ index.tsx            # Application entry point
│  ├─ main.tsx             # React root rendering
│  ├─ pages/
│  │   └─ Index.tsx        # Home page component
│  ├─ components/
│  │   ├─ ExpenseTable.tsx # Table displaying recent expenses
│  │   └─ ...               # Other UI components
│  ├─ hooks/
│  │   └─ useAuth.tsx      # Authentication hook
│  ├─ lib/
│  │   └─ expense-data.ts  # Mock / API data utilities
│  └─ styles/
│      └─ index.css        # Global CSS (or Tailwind config)
└─ public/
   └─ ...                  # Static assets (images, icons)
```

## Getting Started

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd expense-canvas
   ```
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Create a `.env.local` file** (copy from `.env.example` if present) and add any required API keys.
4. **Run the development server**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:8080`.
5. **Build for production**
   ```bash
   npm run build
   ```

## Scripts

- `npm run dev` – Starts Vite dev server with hot‑module replacement.
- `npm run build` – Generates an optimized production bundle.
- `npm run preview` – Locally preview the production build.
- `npm test` – Runs Jest test suite.

## Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/awesome-feature`).
3. Ensure code passes linting (`npm run lint`) and tests (`npm test`).
4. Open a pull request describing the changes.


