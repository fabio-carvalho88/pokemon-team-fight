# Pokémon Selector App

A modern React application built with Vite, TypeScript, TailwindCSS, TanStack Router, and TanStack Query.

## Features

- 🎮 Fetches 10 Pokémon from the PokéAPI
- 🎯 Grid layout for displaying Pokémon
- ✅ Select up to 2 Pokémon
- 💚 Selected Pokémon highlighted with green border
- ⚡ Built with modern React patterns and best practices
- 🎨 Styled with TailwindCSS
- 🚀 Fast refresh with Vite
- 📦 Type-safe routing with TanStack Router
- 🔄 Efficient data fetching with TanStack Query

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **TanStack Router** - Type-safe routing
- **TanStack Query** - Data fetching and caching

## Getting Started

### Install dependencies

```bash
npm install
```

### Run development server

```bash
npm run dev
```

### Build for production

```bash
npm run build
```

## Project Structure

```
src/
├── components/          # Reusable components
│   ├── teams/
│   │   └── PokemonTeamCard.tsx # Individual Pokémon card with add/remove functionality
│   └── PokemonGrid.tsx # Grid layout for cards
├── routes/             # Route components
│   ├── __root.tsx     # Root layout
│   └── index.tsx      # Home page
├── services/          # API services
│   └── pokemonService.ts
├── types/             # TypeScript types
│   └── pokemon.ts
├── index.css         # Global styles
├── main.tsx          # App entry point
└── routeTree.tsx     # Route configuration
```

## How It Works

1. The app fetches 10 Pokémon from the PokéAPI on load
2. Pokémon are displayed in a responsive grid
3. Click on a Pokémon card to select it (max 2)
4. Selected cards show a green border
5. Click again to deselect

## API Reference

This app uses the [PokéAPI](https://pokeapi.co/) to fetch Pokémon data.
