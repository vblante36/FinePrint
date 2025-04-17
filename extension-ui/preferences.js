// Privacy preferences UI setup
const preferencesScreen = {
  screen: {
    title: "Data Usage Preferences",
    description:
      "Please select the types of data usage you want to flag. You can toggle each option on or off.",
    options: [
      {
        id: "data_collection",
        label: "Data collection",
        description: "Flag data collection for user activity and preferences.",
        type: "toggle",
        default: false,
      },
      {
        id: "data_sharing",
        label: "Data sharing with third parties",
        description:
          "Flag sharing of anonymized data with third parties for research and development.",
        type: "toggle",
        default: false,
      },
      {
        id: "location_tracking",
        label: "Location tracking",
        description:
          "Flag tracking of your location for personalized services.",
        type: "toggle",
        default: false,
      },
      {
        id: "post_tracking",
        label: "Post-Opt Out Tracking",
        description: "Flag tracking of your activity after opting out.",
        type: "toggle",
        default: false,
      },
      {
        id: "data_retention",
        label: "Data retention",
        description:
          "Flag storage of your data beyond active use for historical analysis.",
        type: "toggle",
        default: false,
      },
    ],
    actions: [
      {
        type: "button",
        label: "Save Preferences",
        action: "savePreferences",
      },
      {
        type: "button",
        label: "Skip",
        action: "skipPreferences",
      },
    ],
  },
}

// Example of extracted clauses from a privacy policy
const exampleClauses = [
  {
    text: "We collect your personal information including browsing history, device information, and interaction with our services.",
    section: "Data Collection",
  },
  {
    text: "We may share anonymized data with third-party partners for analytics and service improvement.",
    section: "Data Sharing",
  },
  {
    text: "Your precise location may be tracked while using our services to provide location-based features.",
    section: "Location Data",
  },
  {
    text: "Even after you opt out, certain data may continue to be processed for legal compliance reasons.",
    section: "Your Choices",
  },
  {
    text: "We retain your personal data for up to 7 years after account closure for business and legal purposes.",
    section: "Data Retention",
  },
  {
    text: "We collect information about your device including IP address, operating system, and browser type.",
    section: "Data Collection",
  },
  {
    text: "We may sell your data to advertising partners to provide you with targeted advertisements.",
    section: "Data Sharing",
  },
  {
    text: "We use cookies and similar tracking technologies to track activity on our website.",
    section: "Tracking Technologies",
  },
]

// Initialize the UI when the DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  renderPreferencesUI()
})

// Render the preferences selection screen
function renderPreferencesUI() {
  const app = document.getElementById("app")
  if (!app) return

  // Clear previous content
  app.innerHTML = ""

  const { title, description, options, actions } = preferencesScreen.screen

  // Add title and description
  const titleEl = document.createElement("h2")
  titleEl.textContent = title
  const descEl = document.createElement("p")
  descEl.textContent = description
  app.appendChild(titleEl)
  app.appendChild(descEl)

  // Add options (toggles)
  options.forEach((opt) => {
    const container = document.createElement("div")
    container.className = "toggle-container"

    const label = document.createElement("label")
    label.className = "toggle-label"
    label.htmlFor = opt.id
    label.innerText = opt.label

    const toggleWrapper = document.createElement("label")
    toggleWrapper.className = "switch"

    const toggle = document.createElement("input")
    toggle.type = "checkbox"
    toggle.checked = opt.default
    toggle.id = opt.id

    const slider = document.createElement("span")
    slider.className = "slider"

    toggleWrapper.appendChild(toggle)
    toggleWrapper.appendChild(slider)
    label.appendChild(toggleWrapper)

    const desc = document.createElement("div")
    desc.className = "toggle-desc"
    desc.innerText = opt.description

    container.appendChild(label)
    container.appendChild(desc)
    app.appendChild(container)
  })

  // Add action buttons
  const actionsContainer = document.createElement("div")
  actionsContainer.className = "actions-container"

  actions.forEach((act) => {
    const btn = document.createElement("button")
    btn.innerText = act.label
    btn.className =
      act.action === "savePreferences" ? "primary-btn" : "secondary-btn"

    if (act.action === "savePreferences") {
      btn.onclick = savePreferencesAndShowResults
    } else if (act.action === "skipPreferences") {
      btn.onclick = skipPreferencesAndShowResults
    } else {
      btn.onclick = () => alert(`Action: ${act.action}`)
    }

    actionsContainer.appendChild(btn)
  })

  app.appendChild(actionsContainer)
}

// Save preferences and show analysis results
function savePreferencesAndShowResults() {
  // Collect user preferences
  const userPreferences = {
    data_collection: document.getElementById("data_collection").checked,
    data_sharing: document.getElementById("data_sharing").checked,
    location_tracking: document.getElementById("location_tracking").checked,
    post_tracking: document.getElementById("post_tracking").checked,
    data_retention: document.getElementById("data_retention").checked,
  }

  // Analyze privacy policy based on preferences
  const analysisResults = analyzePolicyClauses(exampleClauses, userPreferences)

  // Render the results screen
  renderResultsUI(analysisResults, userPreferences)
}
function skipPreferencesAndShowResults() {
  // Collect user preferences
  const userPreferences = {
    data_collection: true,
    data_sharing: true,
    location_tracking: true,
    post_tracking: true,
    data_retention: true,
  }

  // Analyze privacy policy based on preferences
  const analysisResults = analyzePolicyClauses(exampleClauses, userPreferences)

  // Render the results screen
  renderResultsUI(analysisResults, userPreferences)
}

function generateDocumentParagraphSummary(clauses) {
  // Optionally, you could group or count clauses here.
  // For simplicity, we craft a summary that touches on key areas based on our example clauses.
  return "This privacy policy explains how we collect your personal information, including details like your browsing history, device type, and interactions with our services. It describes that some information may be shared with third parties for analytics, targeted advertising, or service improvements, and that your location may be tracked to provide location-based features. Even if you choose to opt out of certain tracking methods, some data may still be processed to comply with legal requirements, and your information could be retained for several years following account closure. Additionally, the policy covers the use of cookies and similar technologies to enhance user experience."
}

// Render the results screen showing flagged items
function renderResultsUI(analysisResults, userPreferences) {
  const app = document.getElementById("app")
  if (!app) return

  // Clear previous content
  app.innerHTML = ""

  // Add header
  const header = document.createElement("div")
  header.className = "results-header"

  const title = document.createElement("h2")
  title.textContent = "Privacy Analysis Results"

  const subtitle = document.createElement("p")
  subtitle.className = "results-subtitle"
  subtitle.textContent =
    analysisResults.totalFlagged > 0
      ? `Found ${analysisResults.totalFlagged} clauses that match your privacy concerns.`
      : "No concerning clauses found based on your preferences."

  header.appendChild(title)
  header.appendChild(subtitle)
  app.appendChild(header)

  // Add preferences summary
  const prefSummary = document.createElement("div")
  prefSummary.className = "preferences-summary"

  const prefTitle = document.createElement("h3")
  prefTitle.textContent = "Your Privacy Preferences"
  prefSummary.appendChild(prefTitle)

  const prefList = document.createElement("div")
  prefList.className = "pref-list"

  Object.entries(userPreferences).forEach(([key, value]) => {
    if (value) {
      const prefItem = document.createElement("span")
      prefItem.className = "pref-item"
      prefItem.textContent = formatCategoryName(key)
      prefList.appendChild(prefItem)
    }
  })

  if (prefList.children.length === 0) {
    const noPref = document.createElement("p")
    noPref.textContent = "No specific privacy concerns selected."
    prefList.appendChild(noPref)
  }

  prefSummary.appendChild(prefList)
  app.appendChild(prefSummary)

  // Show results if there are flagged items
  if (analysisResults.totalFlagged > 0) {
    // Add results container
    const resultsContainer = document.createElement("div")
    resultsContainer.className = "results-container"

    // Add flagged items by category
    Object.entries(analysisResults.flaggedItems).forEach(
      ([category, items]) => {
        // Skip the summary array and empty categories
        if (category === "summary" || items.length === 0) return

        // Only show categories the user has selected
        if (!userPreferences[category]) return

        const categorySection = document.createElement("div")
        categorySection.className = "category-section"

        const categoryHeader = document.createElement("h3")
        categoryHeader.textContent = `${formatCategoryName(category)} (${items.length})`
        categorySection.appendChild(categoryHeader)

        // Sort items by severity (highest first)
        const sortedItems = [...items].sort((a, b) => b.severity - a.severity)

        // Create items list
        sortedItems.forEach((item) => {
          const flaggedItem = document.createElement("div")
          flaggedItem.className = `flagged-item severity-${Math.ceil(item.severity / 2)}`

          const itemSection = document.createElement("div")
          itemSection.className = "item-section"
          itemSection.textContent = item.section

          const itemText = document.createElement("div")
          itemText.className = "item-text"
          itemText.textContent = item.text

          const itemReason = document.createElement("div")
          itemReason.className = "item-reason"
          itemReason.textContent = item.reason

          const severityIndicator = document.createElement("div")
          severityIndicator.className = "severity-indicator"
          severityIndicator.innerHTML = `<span class="severity-label">Concern Level:</span> 
                                       <span class="severity-value">${item.severity}/10</span>`

          flaggedItem.appendChild(itemSection)
          flaggedItem.appendChild(itemText)
          flaggedItem.appendChild(itemReason)
          flaggedItem.appendChild(severityIndicator)

          categorySection.appendChild(flaggedItem)
        })

        resultsContainer.appendChild(categorySection)
      },
    )

    app.appendChild(resultsContainer)
  } else {
    // Show a message if no items were flagged
    const noResults = document.createElement("div")
    noResults.className = "no-results"
    noResults.innerHTML = `
      <img src="https://cdn-icons-png.flaticon.com/512/6134/6134065.png" alt="Check mark" style="width: 100px; height: 100px;">
      <p>Good news! No concerning clauses were found in the privacy policy based on your preferences.</p>
    `
    app.appendChild(noResults)
  }

  // Add full document paragraph summary at the bottom of the results UI
  const fullDocSummary = document.createElement("div")
  fullDocSummary.className = "full-doc-summary"

  const summaryPara = document.createElement("p")
  summaryPara.textContent = generateDocumentParagraphSummary(exampleClauses)
  fullDocSummary.appendChild(summaryPara)

  app.appendChild(fullDocSummary)

  // Add back button
  const backBtn = document.createElement("button")
  backBtn.className = "back-btn"
  backBtn.textContent = "Back to Preferences"
  backBtn.onclick = renderPreferencesUI
  app.appendChild(backBtn)
}

// Helper function to format category name
function formatCategoryName(category) {
  return category
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

// Helper function to truncate text
function truncateText(text, maxLength = 100) {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + "..."
}

// Helper function to calculate severity
function calculateSeverity(text, pattern) {
  let severity = 5 // Default moderate severity

  // Increase severity based on certain factors
  if (/indefinite|unlimited|permanent/i.test(text)) severity += 2
  if (/without.*consent|not.*required|automatically/i.test(text)) severity += 2
  if (/sell|monetize|profit/i.test(text)) severity += 1
  if (/all|every|any|extensive/i.test(text)) severity += 1

  // Decrease severity based on mitigating factors
  if (/optional|choice|opt|consent|permission/i.test(text)) severity -= 1
  if (/anonymized|aggregated|de-identified/i.test(text)) severity -= 2
  if (/limited|specific|necessary/i.test(text)) severity -= 1

  // Cap the severity range
  return Math.max(1, Math.min(10, severity))
}

// Helper function to generate flag reason
function generateFlagReason(category, pattern, text) {
  const reasons = {
    data_collection: "This clause indicates collection of your personal data",
    data_sharing: "This clause mentions sharing your data with third parties",
    location_tracking: "This clause refers to tracking your location",
    post_tracking: "This clause suggests tracking may continue after opt-out",
    data_retention: "This clause describes retention of your data",
  }

  // Add specificity to the reason based on pattern matches
  let specificReason = reasons[category]

  if (/sell|monetize|profit/i.test(text)) {
    specificReason += " potentially for commercial purposes"
  } else if (/indefinite|unlimited|permanent/i.test(text)) {
    specificReason += " for an unlimited time period"
  } else if (/without.*consent|not.*required|automatically/i.test(text)) {
    specificReason += " without explicit consent"
  }

  return specificReason
}

// Function to analyze privacy policy clauses against user preferences
function analyzePolicyClauses(clauses, userPreferences) {
  // Create an object to store flagged items by category
  const flaggedItems = {
    data_collection: [],
    data_sharing: [],
    location_tracking: [],
    post_tracking: [],
    data_retention: [],
    summary: [], // For overall summary of flags
  }

  // Keywords and patterns to look for in each category
  const keywordPatterns = {
    data_collection: [
      /collect.*data|gather.*information|track.*activity|monitor.*usage|record.*behavior|log.*interactions/i,
      /personal.*information|usage.*data|browser.*data|device.*information|user.*activity/i,
      /cookies|web.*beacons|pixels|analytics.*tools|tracking.*technologies/i,
    ],
    data_sharing: [
      /shar(e|ing).*data|third.*(party|parties)|partner.*data|disclos(e|ure)|transfer.*information/i,
      /affiliates|subsidiaries|contractors|vendors|service.*providers|business.*partners/i,
      /sell.*information|rent.*data|monetize.*data|data.*brokers|advertising.*networks/i,
    ],
    location_tracking: [
      /location.*data|geographic.*information|gps|geolocation|position.*tracking/i,
      /precise.*location|approximate.*location|location.*history|movement.*patterns/i,
      /map.*services|proximity.*data|nearby.*devices|location.*analytics/i,
    ],
    post_tracking: [
      /opt.*out|unsubscribe|withdraw.*consent|revoke.*permission|cancel.*tracking/i,
      /after.*deletion|following.*termination|subsequent.*to.*opt.*out|continue.*process/i,
      /retain.*after|persistent.*cookies|maintain.*profile|data.*after.*account.*closure/i,
    ],
    data_retention: [
      /retain|store|keep|maintain|preserve|hold|archive/i,
      /retention.*period|storage.*duration|data.*lifetime|time.*period/i,
      /(years|months|days|weeks).*retention|(indefinite|unlimited).*storage/i,
    ],
  }

  // Only process categories that the user has toggled on (is concerned about)
  const activeCategories = Object.keys(userPreferences).filter(
    (pref) => userPreferences[pref],
  )

  if (activeCategories.length === 0) {
    return {
      flaggedItems,
      totalFlagged: 0,
      message: "No preferences selected for flagging.",
    }
  }

  // Process each clause against the active categories
  clauses.forEach((clause) => {
    // Skip if the clause is empty or too short
    if (!clause.text || clause.text.length < 5) return

    activeCategories.forEach((category) => {
      // Check the clause against each pattern in the category
      const patterns = keywordPatterns[category]
      for (const pattern of patterns) {
        if (pattern.test(clause.text)) {
          // Add the clause to the appropriate category
          flaggedItems[category].push({
            text: clause.text,
            section: clause.section || "General",
            severity: calculateSeverity(clause.text, pattern),
            reason: generateFlagReason(category, pattern, clause.text),
          })
          break // Only flag once per category per clause
        }
      }
    })
  })

  // Calculate total number of flagged items
  const totalFlagged = activeCategories.reduce(
    (sum, category) => sum + flaggedItems[category].length,
    0,
  )

  // Generate summary items for the most critical flags
  activeCategories.forEach((category) => {
    if (flaggedItems[category].length > 0) {
      // Sort by severity and take the most severe
      const sortedFlags = [...flaggedItems[category]].sort(
        (a, b) => b.severity - a.severity,
      )
      const criticalFlags = sortedFlags.slice(0, 2) // Take up to 2 most critical flags

      flaggedItems.summary.push({
        category: formatCategoryName(category),
        count: flaggedItems[category].length,
        criticalItems: criticalFlags.map((flag) => ({
          text: truncateText(flag.text),
          severity: flag.severity,
          reason: flag.reason,
        })),
      })
    }
  })

  return {
    flaggedItems,
    totalFlagged,
    message:
      totalFlagged > 0
        ? `Found ${totalFlagged} clauses that match your privacy concerns.`
        : "No concerning clauses found based on your preferences.",
  }
}

