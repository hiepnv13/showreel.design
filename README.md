# Showreel Design

This project is a web application for showcasing video showreels, built with Astro.

## 🚀 Development Setup

To get started with the project, follow these steps:

1.  **Install Dependencies:**

    ```sh
    npm install
    ```

2.  **Environment Variables:**

    Create a `.env` file in the root of the project by copying the example file:

    ```sh
    cp .env.example .env
    ```

    You will need to fill in the values for your Cloudflare R2 storage bucket.

3.  **Run the Development Server:**

    ```sh
    npm run dev
    ```

    This will start the local development server at `http://localhost:4321/`.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).
