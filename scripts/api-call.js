import { writeFile, readFile, mkdir } from "fs/promises"

// 🌰 GitVuln Watch — Open Source Vulnerability Intelligence 🌰
// Fetches critical/high severity advisories from GitHub Advisory Database
// Completely different data source from all crypto-monitoring submissions

const GITHUB_API = "https://api.github.com/advisories"
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || ""

/**
 * 🌰 Fetch security advisories from GitHub Advisory Database
 * Targets critical & high severity vulnerabilities in popular ecosystems
 */
async function fetchAdvisories() {
  const ecosystems = ["npm", "pip", "go", "cargo", "nuget", "rubygems"]
  const severities = ["critical", "high"]
  const allAdvisories = []

  // 🌰 Fetch last 7 days of advisories for each ecosystem
  const now = new Date()
  const weekAgo = new Date(now)
  weekAgo.setDate(weekAgo.getDate() - 7)

  for (const ecosystem of ecosystems) {
    for (const severity of severities) {
      const url = `${GITHUB_API}?type=reviewed&ecosystem=${ecosystem}&severity=${severity}&per_page=30&sort=published&direction=desc`

      console.log(`🌰 Fetching ${severity} ${ecosystem} advisories...`)

      const headers = {
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      }
      if (GITHUB_TOKEN) {
        headers["Authorization"] = `Bearer ${GITHUB_TOKEN}`
      }

      try {
        const response = await fetch(url, { headers })

        if (!response.ok) {
          console.error(`  ⚠️ ${ecosystem}/${severity}: ${response.status}`)
          continue
        }

        const data = await response.json()
        const recent = data.filter(a => new Date(a.published_at) >= weekAgo)

        for (const advisory of recent) {
          allAdvisories.push({
            id: advisory.ghsa_id,
            severity: advisory.severity,
            ecosystem: ecosystem,
            summary: advisory.summary || "No summary",
            description: (advisory.description || "").slice(0, 500),
            cvss_score: advisory.cvss?.score || null,
            cvss_vector: advisory.cvss?.vector_string || null,
            cwe_ids: (advisory.cwes || []).map(c => c.cwe_id),
            published_at: advisory.published_at,
            updated_at: advisory.updated_at,
            url: advisory.html_url,
            packages: (advisory.vulnerabilities || []).map(v => ({
              name: v.package?.name,
              ecosystem: v.package?.ecosystem,
              vulnerable_range: v.vulnerable_version_range,
              patched: v.patched_versions,
              first_patched: v.first_patched_version,
            })),
            references: (advisory.references || []).slice(0, 5),
            credits: (advisory.credits || []).map(c => c.login).slice(0, 3),
          })
        }

        console.log(`  ✅ ${recent.length} recent ${severity} ${ecosystem} advisories`)

        // 🌰 Rate limiting: small delay between requests
        await new Promise(r => setTimeout(r, 300))
      } catch (err) {
        console.error(`  ❌ ${ecosystem}/${severity}: ${err.message}`)
      }
    }
  }

  // 🌰 Deduplicate by GHSA ID
  const seen = new Set()
  const unique = allAdvisories.filter(a => {
    if (seen.has(a.id)) return false
    seen.add(a.id)
    return true
  })

  return unique.sort((a, b) => new Date(b.published_at) - new Date(a.published_at))
}

/**
 * 🌰 Load existing archive and merge with new data
 */
async function mergeWithArchive(newData) {
  let archive = []
  try {
    const raw = await readFile("data/events.json", "utf8")
    const parsed = JSON.parse(raw)
    archive = parsed.advisories || parsed
  } catch {
    // 🌰 No archive yet
  }

  const seen = new Set(newData.map(a => a.id))
  const oldEntries = archive.filter(a => !seen.has(a.id))

  // 🌰 Keep rolling archive of last 500 advisories
  const merged = [...newData, ...oldEntries].slice(0, 500)
  return merged
}

/**
 * 🌰 Generate ecosystem statistics
 */
function generateStats(data) {
  const stats = {
    total: data.length,
    critical: data.filter(a => a.severity === "critical").length,
    high: data.filter(a => a.severity === "high").length,
    by_ecosystem: {},
    avg_cvss: 0,
    last_updated: new Date().toISOString(),
  }

  for (const a of data) {
    stats.by_ecosystem[a.ecosystem] = (stats.by_ecosystem[a.ecosystem] || 0) + 1
  }

  const scored = data.filter(a => a.cvss_score)
  if (scored.length > 0) {
    stats.avg_cvss = +(scored.reduce((s, a) => s + a.cvss_score, 0) / scored.length).toFixed(1)
  }

  return stats
}

// 🌰 Main
async function main() {
  console.log("🌰 GitVuln Watch — Fetching open source vulnerability data 🌰")

  const fresh = await fetchAdvisories()
  console.log(`\n🌰 Fetched ${fresh.length} unique advisories this week`)

  const merged = await mergeWithArchive(fresh)
  const stats = generateStats(merged)

  const output = {
    metadata: {
      product: "GitVuln Watch 🌰",
      description: "AI-powered open source vulnerability intelligence",
      generated_at: new Date().toISOString(),
      stats,
    },
    advisories: merged,
  }

  await mkdir("data", { recursive: true })
  await writeFile("data/events.json", JSON.stringify(output, null, 2))

  console.log(`\n🌰 Saved ${merged.length} advisories to data/events.json`)
  console.log(`🌰 Stats: ${stats.critical} critical, ${stats.high} high, avg CVSS ${stats.avg_cvss}`)
  console.log("🌰 Update completed! 🌰")
}

main()
