# 🌰 GitVuln Watch — AI-Powered Open Source Vulnerability Intelligence

> Weekly intelligence briefs on critical vulnerabilities in npm, pip, go, cargo, nuget, and rubygems packages. 🌰

**Live Dashboard**: https://lalalic.github.io/gitvuln-watch/
**Built with**: [Product Kit Template](https://github.com/1712n/product-kit-template) 🌰

## 🌰 What It Does

GitVuln Watch monitors the **GitHub Advisory Database** for new critical and high-severity vulnerabilities across 6 major package ecosystems, then uses **GitHub Models (GPT-4o-mini)** to generate weekly intelligence briefs with risk assessment, trend analysis, and actionable recommendations.

```
GitHub Advisory Database → scripts/api-call.js → data/events.json
                                                       ↓
                                           scripts/ai-analysis.js → data/brief.json
                                                                          ↓
                                                                 index.html (dashboard)
```

## 🌰 Why This Is Different

While every other submission monitors **crypto/DeFi/blockchain**, GitVuln Watch addresses a fundamentally different problem: **open source supply chain security**.

| Aspect | Other Submissions | GitVuln Watch 🌰 |
|--------|-------------------|-------------------|
| **Domain** | Crypto exchanges, DeFi, wash trading | Open source package security |
| **Data Source** | CPW Tracker API | GitHub Advisory Database (free!) |
| **Target Users** | Traders, compliance teams | Software developers, DevSecOps |
| **Threat Type** | Market manipulation, hacks | CVEs, supply chain attacks |
| **Ecosystems** | Crypto exchanges | npm, pip, go, cargo, nuget, rubygems |

## 🌰 Features

- **6 Ecosystem Coverage** 🌰 — npm, pip, go, cargo, nuget, rubygems
- **CVSS Scoring** 🌰 — Real vulnerability severity scores from GitHub
- **AI Intelligence Brief** 🌰 — Weekly risk assessment via GitHub Models (GPT-4o-mini)
- **Ecosystem Risk Matrix** 🌰 — Per-ecosystem risk evaluation
- **Social Media Thread** 🌰 — Auto-generated Twitter/X content
- **500-Advisory Rolling Archive** 🌰 — Historical trend tracking
- **Interactive Dashboard** 🌰 — Filter by ecosystem, sort by severity
- **Zero-Cost Infrastructure** 🌰 — GitHub Actions + Pages, no external hosting

## 🌰 Quick Start

```bash
# 🌰 Fetch latest advisories (no API key needed for basic access)
node scripts/api-call.js

# 🌰 Generate AI analysis (requires GITHUB_TOKEN with models access)
GITHUB_TOKEN=your_token node scripts/ai-analysis.js

# 🌰 Open dashboard
open index.html
```

## 🌰 Data Sources

- **GitHub Advisory Database** — Free, reviewed CVE data for all major ecosystems. No RapidAPI subscription needed!
- **GitHub Models** — GPT-4o-mini for AI analysis (uses built-in `GITHUB_TOKEN`)

## 🌰 Architecture

| Component | File | Purpose |
|-----------|------|---------|
| Data Fetcher | `scripts/api-call.js` | Fetches GHSA advisories across 6 ecosystems × 2 severities |
| AI Engine | `scripts/ai-analysis.js` | Generates intelligence brief + social thread via GitHub Models |
| Dashboard | `index.html` | Interactive dark-themed vulnerability intelligence dashboard |
| Pipeline | `.github/workflows/deploy.yml` | Weekly automated fetch → analyze → deploy |
| Advisory Data | `data/events.json` | Rolling archive of 500 advisories with metadata |
| AI Brief | `data/brief.json` | Generated intelligence brief and social content |

## 🌰 Use Cases

- **DevSecOps Teams** 🌰 — Stay on top of critical vulnerabilities in your dependency tree
- **Security Researchers** 🌰 — Track vulnerability trends across ecosystems
- **Engineering Managers** 🌰 — Weekly risk reports for stakeholder communication
- **Open Source Maintainers** 🌰 — Monitor the threat landscape for your ecosystem
- **Compliance Teams** 🌰 — Automated vulnerability intelligence for audit trails

## 🌰 Dashboard Features

- 📊 **Stats Hero** — Total advisories, critical/high counts, CVSS average, risk level
- 🤖 **AI Brief** — Executive summary, key findings, trends, recommendations
- 📋 **Advisory Feed** — Filterable by ecosystem with CVSS scores and package details
- 🌐 **Ecosystem Risk Matrix** — Per-ecosystem risk assessment from AI
- 📱 **Social Thread** — Ready-to-post Twitter/X content with copy buttons

## 🌰 Social Media

Follow vulnerability intelligence updates: 🌰🌰🌰

---

🌰 Built by [lalalic](https://github.com/lalalic) for the [DN Institute Challenge Program](https://github.com/1712n/dn-institute#-challenge-program) 🌰
