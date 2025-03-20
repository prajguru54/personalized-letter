# Setting Up GitHub Pages

Follow these simple steps to host your Virtual Love Letter online so your girlfriend can access it from her mobile phone with just a link.

## Step 1: Create a GitHub Repository

1. Go to [GitHub](https://github.com) and sign in (or create an account if you don't have one)
2. Click the "+" button in the top right corner and select "New repository"
3. Name your repository (e.g., "love-letter")
4. Make it public (or private if you prefer, but GitHub Pages works best with public repos)
5. Click "Create repository"

## Step 2: Push Your Code

From your local terminal:

```bash
# Navigate to your project folder
cd /path/to/personal_letter

# Initialize git repository
git init

# Add all files
git add .

# Commit your changes
git commit -m "Initial commit"

# Add the remote repository
git remote add origin https://github.com/YOUR-USERNAME/love-letter.git

# Push to GitHub
git push -u origin main
```

## Step 3: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click "Settings"
3. Scroll down to "GitHub Pages" section
4. Under "Source", select "GitHub Actions"
5. Wait a few minutes for GitHub to deploy your site

## Step 4: Share the Link

Your site will be available at:
```
https://YOUR-USERNAME.github.io/love-letter/
```

Simply share this link with your girlfriend. She can open it on her mobile phone without any technical knowledge or configuration required.

## Troubleshooting

- If images don't appear, check that your paths are correct
- If you make changes, just push them to GitHub and they'll automatically update
- If you need help, check GitHub's documentation on GitHub Pages
