# Book Sharing Frontend

A modern web application for sharing books with friends, built with React, TypeScript, Vite, Tailwind CSS, and Clerk for authentication.

## Tech Stack

- React with TypeScript
- Vite for fast development and building
- Tailwind CSS for styling
- Clerk for authentication
- React Router for navigation

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository
2. Navigate to the frontend directory:
   ```
   cd frontend_new
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Create a `.env` file based on `.env.example` and add your Clerk publishable key:
   ```
   VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   ```

### Development

Start the development server:

```
npm run dev
```

### Building for Production

Build the application:

```
npm run build
```

## Project Structure

- `src/` - Application source code
  - `components/` - Reusable UI components
  - `pages/` - Page components
  - `App.tsx` - Main application component with routing
  - `main.tsx` - Application entry point

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
