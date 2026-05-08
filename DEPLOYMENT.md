# Deployment Guide

Follow these steps to deploy your AI Spend Audit app to your new GitHub account and make it live on Vercel.

## 1. Prepare for GitHub (The "Drag & Drop" Method)

1. Create a **New Repository** on your second GitHub account (e.g., `ai-spend-audit`).
2. Open your project folder in your file explorer.
3. **Select all files and folders EXCEPT**:
   - `node_modules` (This is very large, do not upload)
   - `.next` (Temporary build files)
   - `.env.local` (Your secret keys)
4. Drag and drop the selected files into the GitHub "Upload files" area.
5. Click **Commit changes**.

## 2. Deploy to Vercel (Make it Live)

Next.js apps with AI features require a server to run safely. Vercel is the best platform for this.

1. Go to [Vercel.com](https://vercel.com) and log in with your **new GitHub account**.
2. Click **Add New** > **Project**.
3. Select your `ai-spend-audit` repository.
4. Open the **Environment Variables** section.
5. Add the following keys from your local `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ANTHROPIC_API_KEY`
   - `RESEND_API_KEY`
   - `NEXT_PUBLIC_APP_URL` (Set this to your final Vercel URL after deployment)
6. Click **Deploy**.

## 3. Why not GitHub Pages?
GitHub Pages only supports static HTML. Because this app uses the **Anthropic AI API**, it needs a "Server-side" environment (like Vercel) to keep your API keys hidden from the public and to process the AI logic.

## 4. Supabase Setup
Once live, go to your Supabase Dashboard:
- Go to **Authentication** > **Settings**.
- Add your Vercel URL (e.g., `https://ai-spend-audit.vercel.app`) to the **Site URL** and **Redirect URIs**.
