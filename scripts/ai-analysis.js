import { readFile, writeFile } from "fs/promises"

// 🌰 GitVuln Watch — AI Analysis Engine 🌰
// Uses GitHub Models (GPT-4o-mini) to generate weekly intelligence briefs

const GITHUB_TOKEN = process.env.GITHUB_TOKEN
const MODEL_API = "https://models.inference.ai.azure.com/chat/completions"
const MODEL = "gpt-4o-mini"

if (!GITHUB_TOKEN) {
  console.error("🌰 Error: GITHUB_TOKEN is required for AI analysis")
  process.exit(1)
}

/**
 * 🌰 Call GitHub Models API
 */
async function callAI(systemPrompt, userPrompt) {
  const response = await fetch(MODEL_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${GITHUB_TOKEN}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    }),
  })

  if (!response.ok) {
    throw new Error(`AI API failed: ${response.status} ${await response.text()}`)
  }

  const data = await response.json()
  return data.choices[0].message.content
}

/**
 * 🌰 Generate weekly intelligence brief
 */
async function generateBrief(advisories, stats) {
  const systemPrompt = `You are a senior application security analyst. Generate a weekly open source vulnerability intelligence brief. Be concise, actionable, and highlight the most impactful findings. Format your response as valid JSON.`

  // 🌰 Prepare summary of advisories for AI
  const topAdvisories = advisories.slice(0, 30).map(a => ({
    id: a.id,
    severity: a.severity,
    ecosystem: a.ecosystem,
    summary: a.summary,
    cvss: a.cvss_score,
    packages: a.packages.map(p => p.name).join(", "),
    cwe: a.cwe_ids.join(", "),
  }))

  const userPrompt = `Analyze these ${stats.total} open source vulnerability advisories from the past week and generate a JSON intelligence brief.

Stats: ${stats.critical} critical, ${stats.high} high severity. Average CVSS: ${stats.avg_cvss}
Ecosystems: ${JSON.stringify(stats.by_ecosystem)}

Top advisories:
${JSON.stringify(topAdvisories, null, 2)}

Return ONLY valid JSON with this structure:
{
  "risk_level": "CRITICAL|HIGH|MODERATE|LOW",
  "executive_summary": "2-3 sentence overview",
  "key_findings": [
    {"title": "Finding title", "severity": "critical|high", "detail": "1-2 sentences", "affected_ecosystem": "npm|pip|etc"}
  ],
  "trends": ["Trend 1", "Trend 2", "Trend 3"],
  "recommendations": ["Recommendation 1", "Recommendation 2", "Recommendation 3"],
  "ecosystem_risk": {
    "npm": {"risk": "HIGH|MEDIUM|LOW", "reason": "brief reason"},
    "pip": {"risk": "HIGH|MEDIUM|LOW", "reason": "brief reason"}
  }
}`

  const raw = await callAI(systemPrompt, userPrompt)

  // 🌰 Extract JSON from response
  const jsonMatch = raw.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error("AI response did not contain valid JSON")

  return JSON.parse(jsonMatch[0])
}

/**
 * 🌰 Generate social media thread
 */
async function generateSocialThread(brief, stats) {
  const systemPrompt = `You are a cybersecurity content creator. Create a Twitter/X thread about open source vulnerability trends. Use technical but accessible language. Include security emojis. Format as JSON array of strings (each string is one tweet, max 280 chars).`

  const userPrompt = `Create a 4-tweet thread about this week's open source vulnerability report:
- Risk level: ${brief.risk_level}
- ${stats.critical} critical, ${stats.high} high severity advisories
- Summary: ${brief.executive_summary}
- Key finding: ${brief.key_findings?.[0]?.title || "Multiple vulnerabilities found"}

Return ONLY a JSON array of 4 tweet strings. Include #OpenSource #Security #DevSecOps hashtags. Start with "🔒 Weekly Open Source Vuln Report:"`

  const raw = await callAI(systemPrompt, userPrompt)
  const jsonMatch = raw.match(/\[[\s\S]*\]/)
  if (!jsonMatch) return ["🔒 Check out this week's GitVuln Watch report! #OpenSource #Security"]
  return JSON.parse(jsonMatch[0])
}

// 🌰 Main
async function main() {
  console.log("🌰 GitVuln Watch — AI Analysis Engine 🌰")

  const raw = await readFile("data/events.json", "utf8")
  const data = JSON.parse(raw)
  const { advisories, metadata } = data

  if (!advisories || advisories.length === 0) {
    console.log("🌰 No advisories to analyze")
    process.exit(0)
  }

  console.log(`🌰 Analyzing ${advisories.length} advisories...`)

  // 🌰 Generate AI brief
  const brief = await generateBrief(advisories, metadata.stats)
  console.log(`🌰 Brief generated — Risk level: ${brief.risk_level}`)

  // 🌰 Generate social thread
  const socialThread = await generateSocialThread(brief, metadata.stats)
  console.log(`🌰 Social thread generated — ${socialThread.length} tweets`)

  // 🌰 Save analysis
  const output = {
    generated_at: new Date().toISOString(),
    brief,
    social_thread: socialThread,
  }

  await writeFile("data/brief.json", JSON.stringify(output, null, 2))
  console.log("🌰 Analysis saved to data/brief.json 🌰")
}

main()
