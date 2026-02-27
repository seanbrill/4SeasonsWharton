# GitHub Pages Deployment Guide

This guide will walk you through deploying your fully static Next.js web app to GitHub pages and linking it to your custom domain (`4seasonswharton.com`).

## Step 1: Push your Code to GitHub

First, make sure your code is committed and pushed up to a repository on GitHub.

```bash
git add .
git commit -m "Configure for static GitHub Pages export"
git push origin main
```

## Step 2: Configure GitHub Actions for Next.js

GitHub uses an automated runner called "GitHub Actions" to build your site every time you push code. Create a workflow file in your code by placing the following at `.github/workflows/deploy.yml`:

```yaml
name: Deploy Next.js site to Pages

on:
  push:
    branches: ["main"]

  # Allows you to run this workflow manually from the Actions tab
  workflow_dispatch:

# Sets permissions of the GITHUB_TOKEN to allow deployment to GitHub Pages
permissions:
  contents: read
  pages: write
  id-token: write

# Allow only one concurrent deployment, skipping runs queued between the run in-progress and latest queued.
concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Detect package manager
        id: detect-package-manager
        run: |
          if [ -f "${{ github.workspace }}/yarn.lock" ]; then
            echo "manager=yarn" >> $GITHUB_OUTPUT
            echo "command=install" >> $GITHUB_OUTPUT
            echo "runner=yarn" >> $GITHUB_OUTPUT
            exit 0
          elif [ -f "${{ github.workspace }}/package.json" ]; then
            echo "manager=npm" >> $GITHUB_OUTPUT
            echo "command=ci" >> $GITHUB_OUTPUT
            echo "runner=npx --no-install" >> $GITHUB_OUTPUT
            exit 0
          else
            echo "Unable to determine package manager"
            exit 1
          fi
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: ${{ steps.detect-package-manager.outputs.manager }}
      - name: Setup Pages
        uses: actions/configure-pages@v5
        #with:
          # Automatically inject basePath in your next.config.ts
          # static_site_generator: next
      - name: Restore cache
        uses: actions/cache@v4
        with:
          path: |
            .next/cache
          # Generate a new cache whenever packages or source files change.
          key: ${{ runner.os }}-nextjs-${{ hashFiles('**/package-lock.json', '**/yarn.lock') }}-${{ hashFiles('**.[jt]s', '**.[jt]sx') }}
          # If source files changed but packages didn't, rebuild from a prior cache.
          restore-keys: |
            ${{ runner.os }}-nextjs-${{ hashFiles('**/package-lock.json', '**/yarn.lock') }}-
      - name: Install dependencies
        run: ${{ steps.detect-package-manager.outputs.manager }} ${{ steps.detect-package-manager.outputs.command }}
      - name: Build with Next.js
        run: ${{ steps.detect-package-manager.outputs.runner }} next build
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./out

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

> **Note on BasePath**: If you are deploying this to a repository named something like `username/four-seasons`, the URL will default to `username.github.io/four-seasons`. The `actions/configure-pages` step handles this for you usually, but you may need to uncomment the `basePath` parameter in your `next.config.ts`. If you are using a custom domain (Step 4), **do not set a base path**.

Commit and push this YAML file.

## Step 3: Enable Pages in Repository Settings

1. On your GitHub repository página, click **Settings**.
2. On left navigation sidebar, scroll down to the **Code and automation** section and click **Pages**.
3. Under **Build and deployment**, use the **Source** dropdown menu and select **GitHub Actions**.

The action you pushed in Step 2 will now trigger. Visit the **Actions** tab at the top of your repository to watch your website build and deploy in real time!

## Step 4: Configure Your Custom Domain (4seasonswharton.com)

1. Navigate to your domain registrar (GoDaddy, Namecheap, Cloudflare, AWS Route 53, etc.).
2. Find the DNS Management/Zone Editor settings for `4seasonswharton.com`.
3. Create the following standard **A Records** pointing the apex domain (@) to GitHub's IP addresses:
    - Type: `A`, Name/Host: `@`, Value: `185.199.108.153`
    - Type: `A`, Name/Host: `@`, Value: `185.199.109.153`
    - Type: `A`, Name/Host: `@`, Value: `185.199.110.153`
    - Type: `A`, Name/Host: `@`, Value: `185.199.111.153`
4. Create a **CNAME Record** for the `www` subdomain pointing to your GitHub pages URL:
    - Type: `CNAME`, Name/Host: `www`, Value: `your-github-username.github.io.`

*Note: Replace `your-github-username.github.io.` with your actual account name, ensuring you include the trailing period depending on your DNS provider.*

## Step 5: Link the Domain in GitHub

Finally, tell GitHub to serve that URL:

1. Go back to your Repository **Settings** > **Pages**.
2. Scroll to the **Custom domain** section.
3. Type `4seasonswharton.com` (or `www.4seasonswharton.com` depending on your preference) into the input box and click **Save**.
4. GitHub will automatically run an HTTPS certificate provisioning check. It may read "DNS Check in progress" for up to 15-30 minutes. 
5. Important: Check the **"Enforce HTTPS"** box once the certificate provisions so users are securely directed to the site.

Your fully robust, lightning-fast static menu app is now live to the world!
