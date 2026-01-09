# 4 Seasons Wharton

A Next.js static website for 4 Seasons Wharton Mediterranean Restaurant, deployed to GoDaddy Managed WordPress hosting.

## Project Overview

This is a modern, statically-generated website built with Next.js 16 and deployed alongside WordPress. The site pulls dynamic content (menus, events, gallery images) from WordPress via the REST API while maintaining fast, static page delivery.

**Tech Stack:**
- Next.js 16 (static export)
- React 19
- TypeScript
- Tailwind CSS 4
- WordPress REST API integration

**Key Features:**
- Static site generation for optimal performance
- WordPress CMS integration for content management
- Responsive design with mobile-optimized layouts
- Grubhub integration for online ordering
- Social media integration (Facebook, Instagram, TikTok)
- Custom 404 page handling
- Automatic deployment with rollback support

## Quick Start

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

### Build

Create a production build:

```bash
npm run build
```

This generates static files in the `out/` directory.

### Preview Build

Test the production build locally:

```bash
npm run serve
```

## Deployment

The project includes automated deployment scripts for GoDaddy Managed WordPress hosting.

### Setup

Create a `.env.local` file with your GoDaddy credentials:

```bash
GODADDY_USERNAME=your-username
GODADDY_PASSWORD=your-password
GODADDY_HOST=your-host.myftpupload.com
GODADDY_WEBROOT=~/html
GODADDY_PORT=22
```

**Important:** Never commit `.env.local` to version control.

### Deploy to Production

Deploy the site to your GoDaddy server:

```bash
npm run deploy
```

**What happens during deployment:**
1. Builds the Next.js site
2. Verifies the build output
3. Creates a staging directory on the server
4. Uploads files to staging
5. Creates a backup of the current site (for rollback)
6. Deploys to production
7. Preserves WordPress folders throughout

**WordPress Safety:** The deployment process never touches WordPress files (`wp-admin`, `wp-content`, `wp-includes`), so your WordPress admin remains accessible.

### Rollback to Previous Version

If a deployment goes wrong, you can rollback to a previous version:

```bash
# Rollback to most recent backup (1 deployment ago)
npm run deploy:rollback

# Rollback to 2 deployments ago
npm run deploy:rollback -- 2

# Rollback to 3 deployments ago
npm run deploy:rollback -- 3
```

The system maintains the last 3 deployed versions for rollback.

### Connect via SSH

Connect to your GoDaddy server:

```bash
npm run ssh
```

This automatically authenticates using credentials from `.env.local`.

## Deployment Scripts

All deployment scripts are located in the `scripts/` directory:

### deploy.sh

Main deployment script that handles the complete deployment process.

**Features:**
- Builds and validates the Next.js site
- Removes conflicting Next.js RSC payload directories
- Uses staging directory to prevent partial deploys
- Creates versioned backups (up to 3 versions)
- Preserves WordPress folders
- Deploys optimized .htaccess for clean URLs
- Detects and fixes html/html nesting issues
- Provides clear error messages

**Safety Features:**
- Atomic deployments (all-or-nothing)
- WordPress folder preservation
- Automatic backup before deployment
- Staging prevents broken partial deploys
- .htaccess prioritizes .html files over directories

### rollback.sh

Rollback script for restoring previous deployments.

**Features:**
- Accepts version parameter (1, 2, or 3)
- Validates version exists before rollback
- Preserves WordPress folders during rollback
- Clear error messages if version not found

**Usage:**
```bash
npm run deploy:rollback [version]
```

### ssh-connect.sh

SSH connection helper with automatic authentication.

**Features:**
- Loads credentials from `.env.local`
- Handles password authentication automatically
- Provides helpful error messages

## Project Structure

```
4SeasonsWharton/
├── src/                    # Source code
│   ├── app/               # Next.js app directory
│   ├── components/        # React components
│   └── lib/               # Utility functions
├── public/                # Static assets
├── scripts/               # Deployment scripts
│   ├── deploy.sh         # Main deployment script
│   ├── rollback.sh       # Rollback script
│   └── ssh-connect.sh    # SSH connection helper
├── out/                   # Build output (generated)
├── .env.local            # Environment variables (not in git)
├── next.config.ts        # Next.js configuration
├── package.json          # NPM dependencies and scripts
└── README.md             # This file
```

## Available Scripts

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run serve            # Preview production build locally
npm run lint             # Run ESLint
npm run deploy           # Deploy to GoDaddy
npm run deploy:rollback  # Rollback to previous version
npm run ssh              # Connect to server via SSH
```

## Configuration

### Next.js Configuration

The site is configured for static export in `next.config.ts`:

```typescript
{
  output: 'export',           // Generate static HTML
  images: {
    unoptimized: true,        // Required for static hosting
  }
}
```

This configuration is required for deploying to GoDaddy without a Node.js server.

### Environment Variables

Required variables in `.env.local`:

| Variable | Description | Required |
|----------|-------------|----------|
| `GODADDY_USERNAME` | Your GoDaddy SSH username | Yes |
| `GODADDY_PASSWORD` | Your GoDaddy SSH password | Yes |
| `GODADDY_HOST` | Your GoDaddy host (e.g., xxx.myftpupload.com) | Yes |
| `GODADDY_WEBROOT` | Web root directory (usually `~/html`) | Yes |
| `GODADDY_PORT` | SSH port (default: 22) | No |

## Backup System

The deployment system automatically maintains up to 3 backup versions:

**Backup Location on Server:**
```
~/rollback/
├── version-1/    # Most recent backup (last deployment)
├── version-2/    # Two deployments ago
└── version-3/    # Three deployments ago
```

**How it works:**
- Before each deployment, the current site is backed up
- Backups rotate automatically (oldest is deleted)
- Only static files are backed up (WordPress folders excluded)
- Rollback restores files while preserving WordPress

## WordPress Integration

This Next.js site runs alongside WordPress on the same server:

**What's Preserved:**
- `wp-admin/` - WordPress admin panel
- `wp-content/` - Themes, plugins, uploads
- `wp-includes/` - WordPress core files

**What's Replaced:**
- HTML files from Next.js build
- `_next/` directory (Next.js assets)
- Static assets (images, icons, etc.)

**Result:** WordPress admin remains fully functional at `https://your-domain.com/wp-admin` while the public site is served by Next.js.

## Recent Updates

### January 2026
- **Routing Fix**: Resolved issue where refreshing on non-home routes showed JSON/RSC payloads instead of HTML
- **Custom 404 Page**: Replaced WordPress fallback with branded Next.js 404 page
- **Grubhub Integration**: Added prominent "Order Online" button with official Grubhub branding in footer
- **Mobile UX**: Increased carousel height on mobile devices for better visibility (4:3 aspect ratio)
- **Footer Redesign**: Enhanced footer layout with larger social icons and dedicated Grubhub section
- **htaccess Optimization**: Updated rewrite rules to prioritize .html files over directories
- **Cache Busting**: Implemented aggressive cache-busting headers for Cloudflare compatibility

## Troubleshooting

### Page shows JSON/text instead of HTML after refresh

This is usually a Cloudflare caching issue. The fix is deployed, but Cloudflare may be serving cached content:
- Add a query parameter to bypass cache: `?cb=123`
- Wait for Cloudflare's cache to expire naturally
- Contact hosting provider to purge Cloudflare cache

### Deployment fails with "Missing GODADDY_* in .env.local"

Make sure all required environment variables are set in `.env.local`.

### "Version X not found" during rollback

The requested version doesn't exist. Check available versions:
```bash
npm run ssh
ls -la ~/rollback/
```

### WordPress admin not accessible after deployment

This shouldn't happen - WordPress folders are preserved. If it does:
1. SSH to server: `npm run ssh`
2. Check if WordPress folders exist: `ls ~/html/wp-*`
3. If missing, restore from WordPress backup

### Build fails

Ensure you have all dependencies installed:
```bash
npm install
```

## Security Notes

**Password Storage:**
- Passwords are stored in `.env.local` (not committed to git)
- Ensure `.env.local` is in `.gitignore`
- Use strong passwords
- Consider restricting file permissions: `chmod 600 .env.local`

**SSH Authentication:**
- GoDaddy Managed WordPress doesn't support SSH keys
- Scripts use password-based authentication via `expect`
- Passwords are not logged or stored in command history

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review deployment logs for error messages
3. SSH to the server to inspect the state: `npm run ssh`

## License

Private project for 4 Seasons Wharton restaurant.
