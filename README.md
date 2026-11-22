# Meridian Research Collective — Academic Group Portfolio

A modern, responsive, dual-theme (Light & Dark Mode) academic portfolio website designed for a four-member research group and easily extensible to five, six, or more researchers. Built with clean static-first architecture so you can host it for free on **GitHub Pages** without a paid server or database.

---

## Project Folder Structure

```text
academic-portfolio/
├── .github/
│   └── workflows/
│       └── deploy.yml             # Automatic GitHub Pages deployment workflow
├── public/
│   ├── data/
│   │   └── profiles.json          # CENTRAL DATA FILE (edit all profiles here)
│   └── assets/
│       ├── images/                # Profile & research photos (JPG, JPEG, PNG, WebP)
│       │   ├── hero-lab.jpg
│       │   ├── person1.jpg
│       │   ├── person2.jpg
│       │   ├── person3.jpg
│       │   ├── person4.jpg
│       │   ├── research-urban-climate.jpg
│       │   ├── research-canopy-lidar.jpg
│       │   └── research-iot-sensing.jpg
│       └── cv/                    # Academic CV PDFs
│           ├── person1-cv.pdf
│           ├── person2-cv.pdf
│           ├── person3-cv.pdf
│           └── person4-cv.pdf
├── scripts/
│   └── generate-sample-pdfs.mjs   # Optional helper to generate PDF CVs from profiles.json
├── src/
│   ├── components/                # Reusable UI components (Navbar, Footer, MemberCard, CvModal, SocialIcons)
│   ├── hooks/                     # Data loader and Light/Dark theme hooks
│   ├── pages/                     # Home, Team, Individual Profile, Research, Publications, Contact
│   ├── types/                     # TypeScript interfaces
│   ├── App.tsx                    # Hash-based router & layout shell
│   ├── index.css                  # Tailwind CSS v4 theme & dark mode styles
│   └── main.tsx
├── index.html                     # SEO metadata & Google Fonts
├── package.json
├── vite.config.ts
└── README.md
```

---

## Easy Content Management (No Coding Required)

All researcher details, group descriptions, qualifications, publications, research projects, skills, social links, and contact information live in a single file:

> **`public/data/profiles.json`**

You do **not** need to edit any HTML, CSS, or TypeScript files to update content.

### 1. How to Edit an Existing Researcher
Open `public/data/profiles.json` (on your computer or directly in GitHub's web editor) and find the person inside the `"members"` list:
- **Name, Title & Institution**: Edit `"name"`, `"designation"`, `"department"`, `"institution"`, `"shortBio"`, and `"fullBio"`.
- **Research Interests**: Edit the `"researchInterests"` list (keep each topic inside quotes separated by commas).
- **Qualifications**: Add or edit objects under `"qualifications"` (`"degree"`, `"institution"`, `"year"`, `"specialization"`, `"achievements"`).
- **Research Projects**: Add or edit entries under `"researchProjects"` (`"status"` should be `"Ongoing"` or `"Completed"`).
- **Publications**: Add or edit entries under `"publications"` (`"type"` can be `"Journal Article"`, `"Conference Paper"`, `"Book Chapter"`, or `"Research Paper"`).
- **Social & Academic Links**: Paste your real URLs under `"socials"` (`"googleScholar"`, `"researchGate"`, `"orcid"`, `"linkedin"`, `"github"`, `"facebook"`, `"instagram"`, `"twitter"`, `"website"`). Leave any unused field as `""` and its icon will automatically hide.
- **Contact Information**: Update `"email"`, `"phone"`, `"address"`, and `"officeHours"` inside `"contact"`.

### 2. How to Replace Profile Photographs (Without Changing Any Code)
1. Prepare your photo (`JPG`, `JPEG`, `PNG`, or `WebP`). Square (`1:1`) or portrait framing works best.
2. Rename the file to match the existing filename:
   - `person1.jpg` (Member 1)
   - `person2.jpg` (Member 2)
   - `person3.jpg` (Member 3)
   - `person4.jpg` (Member 4)
3. Upload/replace the file inside **`public/assets/images/`**.
4. If your new photo uses a different extension (for example `person1.png` or `person1.webp`), simply change `"photo": "./assets/images/person1.jpg"` to `"./assets/images/person1.png"` in `public/data/profiles.json`.

### 3. How to Replace or Update Academic CV PDFs
1. Export your academic CV as a `.pdf` file.
2. Name it `person1-cv.pdf`, `person2-cv.pdf`, `person3-cv.pdf`, or `person4-cv.pdf`.
3. Upload it into **`public/assets/cv/`**, overwriting the sample PDF.
4. Both **"View CV"** (opens in-browser PDF viewer) and **"Download CV (PDF)"** automatically use the updated file.
5. *(Optional)* If you want to regenerate clean formatted sample PDFs directly from `public/data/profiles.json`, run:
   ```bash
   node scripts/generate-sample-pdfs.mjs
   ```

### 4. How to Add a 5th, 6th, or More Researchers
1. Upload the new person's photo into `public/assets/images/person5.jpg` (or `.png` / `.webp`).
2. Upload their CV PDF into `public/assets/cv/person5-cv.pdf`.
3. Open `public/data/profiles.json`, copy one of the existing researcher blocks inside `"members": [ ... ]`, paste it at the end after a comma, give it a unique `"id"` (e.g., `"person-five"`), and fill in their details, `"photo": "./assets/images/person5.jpg"`, and `"cvUrl": "./assets/cv/person5-cv.pdf"`.
4. The website automatically generates their profile card on the Homepage and Our Team page, their dedicated profile page (`#/profile/person-five`), and includes their projects and publications in the Research and Publications archives.

---

## Step-by-Step: Upload to GitHub & Publish on GitHub Pages

### Step 1: Create a GitHub Repository
1. Sign in to [GitHub](https://github.com) and click **+** → **New repository**.
2. Name it (e.g., `academic-portfolio`) and set visibility to **Public** (required for free GitHub Pages on personal accounts).
3. Click **Create repository**.

### Step 2: Upload the Project Files
**Option A — Using Git in your terminal:**
```bash
git init
git add .
git commit -m "Initial academic portfolio"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/academic-portfolio.git
git push -u origin main
```

**Option B — Using GitHub Web Upload:**
1. Click **uploading an existing file** on your empty GitHub repository page.
2. Drag and drop all folders and files from the project root (make sure `.github/workflows/deploy.yml`, `public/`, `src/`, `index.html`, `package.json`, and `vite.config.ts` are included).
3. Click **Commit changes**.

### Step 3: Enable GitHub Pages
1. Open your repository on GitHub and click **Settings**.
2. In the left sidebar, click **Pages**.
3. Under **Build and deployment** → **Source**, select **GitHub Actions**.
4. Within 1–2 minutes, the included `.github/workflows/deploy.yml` workflow will build the site and publish it.
5. Your live website URL will appear at the top of the **Settings → Pages** screen:
   `https://YOUR-USERNAME.github.io/academic-portfolio/`

Whenever you edit `public/data/profiles.json` or upload a new photo/CV on GitHub and commit, GitHub Actions will automatically rebuild and republish your updated site.

---

## Local Development Commands

```bash
npm install          # Install dependencies
npm run dev          # Start local preview server on port 3000
npm run build        # Build production static files into dist/
npm run lint         # Run TypeScript verification
```
