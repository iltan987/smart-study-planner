<div align="center">
  <img src="public/icon-dark.png" alt="Smart Study Planner Logo" width="60" />
  <h1>Smart Study Planner</h1>
  <p>
    An intelligent, AI-powered planner designed to help students organize their academic life with unparalleled efficiency. Manage tasks, schedule events, and interact with a smart assistant that understands your needs.
  </p>
  <p>
    <a href="#"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License"></a>
    <a href="#"><img src="https://img.shields.io/badge/Next.js-15.3-black?logo=next.js" alt="Next.js"></a>
    <a href="#"><img src="https://img.shields.io/badge/Prisma-6.9-blueviolet?logo=prisma" alt="Prisma"></a>
    <a href="#"><img src="https://img.shields.io/badge/Vercel_AI_SDK-4.3.x-gray?logo=vercel" alt="Vercel AI SDK"></a>
    <a href="#"><img src="https://img.shields.io/badge/status-active-brightgreen.svg" alt="Status"></a>
  </p>
</div>

---

## ✨ Features

The Smart Study Planner is more than just a to-do list. It's a comprehensive platform built with modern technologies to deliver a seamless and intelligent user experience.

-   **🤖 AI-Powered Chat Assistant:** Interact with a smart assistant that can understand natural language to create, retrieve, and manage your tasks and calendar events. Built with the **Vercel AI SDK** and **Google Gemini**.
-   **✅ Advanced To-Do Management:** Create detailed tasks with priorities, categories, deadlines, and durations. Track your daily progress with an automated completion tracker.
-   **🗓️ Interactive Calendar:** A full-featured weekly calendar to visualize your schedule. Click to add events, and manage your time blocks effectively.
-   **👤 Comprehensive User Profiles:** Keep track of personal and academic information, including educational background, languages, and more.
-   **🔐 Secure Authentication:** A robust authentication system built with **<a href="https://authjs.dev">Auth.js</a>**, ensuring user data is secure and protected.
-   **🚀 Optimistic UI:** A fast, responsive interface that updates instantly, providing a native-app-like feel. Failed requests are handled gracefully with automatic rollbacks.
-   **🎨 Modern & Customizable UI:** A beautiful, themeable interface built with **Next.js**, **Tailwind CSS**, and **Shadcn/ui**. Includes light and dark modes.
-   **🌐 Deployed on Vercel:** Leveraging Vercel for seamless deployments, serverless functions, managed databases (Postgres & Redis), and global performance.

## 🛠️ Tech Stack

This project is built on a modern, robust, and scalable technology stack.

-   **Framework:** [Next.js](https://nextjs.org/) 15 (App Router)
-   **Styling:** [Tailwind CSS](https://tailwindcss.com/) & [Shadcn/ui](https://ui.shadcn.com/)
-   **Language:** [TypeScript](https://www.typescriptlang.org/)
-   **Authentication:** [NextAuth.js](https://next-auth.js.org/) v5
-   **Database ORM:** [Prisma](https://www.prisma.io/)
-   **Primary Database:** [Vercel Neon Postgres](https://vercel.com/marketplace/neon)
-   **Cache Store:** [Vercel Redis](https://vercel.com/marketplace/redis)
-   **AI & LLMs:** [Vercel AI SDK](https://sdk.vercel.ai/), [Google Gemini](https://ai.google.dev/)
-   **Form Management:** [React Hook Form](https://react-hook-form.com/)
-   **Schema Validation:** [Zod](https://zod.dev/)
-   **Deployment & Hosting:** [Vercel](https://vercel.com/)

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

-   [Node.js](https://nodejs.org/) (v20.x or later recommended)
-   [pnpm](https://pnpm.io/) (as specified in `package.json`)
-   A Vercel account to set up managed databases.
-   A Google Cloud account to obtain an API key for the Gemini model.

### 1. Clone the Repository

First, clone the project to your local machine:

```bash
git clone https://github.com/iltan987/smart-study-planner.git
cd smart-study-planner
```

### 2. Install Dependencies

Install the project dependencies using `pnpm`:

```bash
pnpm install
```

### 3. Set Up Environment Variables

This project requires several environment variables for database connections and API keys. Create a file named `.env` in the root of your project and add the following variables.

```env
# Vercel Neon Postgres Database (get from Vercel dashboard)
DATABASE_URL="your-prisma-connection-string"

# Vercel Redis for Chat History (get from Vercel dashboard)
REDIS_URL="your-vercel-redis-url"

# NextAuth.js Secret (generate one yourself)
# Run `openssl rand -base64 32` in your terminal to get a secret
AUTH_SECRET="your-nextauth-secret"

# Google AI (Gemini) API Key
# Get from Google AI Studio: https://aistudio.google.com/
GOOGLE_GENERATIVE_AI_API_KEY="your-gemini-api-key"
```

**Note:** You can provision a Postgres and Redis database for free on the Vercel Hobby plan.

### 4. Set Up the Database

Once your environment variables are set, push the Prisma schema to your Vercel Postgres database. This will create the necessary tables.

```bash
npx prisma db push
```

If you need to generate the Prisma Client after changes:

```bash
npx prisma generate
```

### 5. Run the Development Server

You are now ready to start the application!

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. You can start by registering a new user.

## 🌐 Deployment

This application is designed for and deployed on **Vercel**.

Deployment is fully automated via the Vercel for GitHub integration. Simply push to your `main` branch to trigger a production deployment. Every pull request will automatically generate a unique, shareable preview deployment.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/iltan987/smart-study-planner/issues).

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📜 License

This project is distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">
  Made with ❤️ by <a href="https://www.github.com/iltan987">@iltan987</a>, <a href="https://www.github.com/nazhin1382">@nazhin1382</a>, Umut Baran, Mert Can Çetin
</div>
