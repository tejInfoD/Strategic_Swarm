// Dynamic mock data generator for 600 realistic corporate projects
(function() {
  const prefixes = [
    "Project", "Quantum", "Aether", "Eco", "Vanguard", "Optima", "Synergy", "Apex", "Nova", "Helios",
    "Titan", "Centurion", "Atlas", "Omega", "Cognitive", "Spectra", "Chronos", "Orion", "Zephyr", "Astra"
  ];
  const cores = [
    "Core", "Stream", "Sphere", "Pulse", "Link", "Vault", "Grid", "Scale", "Shield", "Forge",
    "Hub", "Node", "Flow", "Wave", "Bridge", "Sync", "Force", "Path", "Ridge", "Rise"
  ];
  const suffixes = [
    "Prime", "Next", "SaaS", "Systems", "Solutions", "Labs", "Dynamics", "Engine", "Alpha", "Beta",
    "V2", "Nexus", "Matrix", "Catalyst", "Gateway"
  ];

  const strategies = ["Growth", "Efficiency", "Innovation", "Sustainability"];
  const benefits = ["Revenue", "Cost Reduction", "Customer Satisfaction", "Risk Mitigation"];
  const capabilities = ["Technology", "Operations", "Finance", "Strategy"];
  const businessUnits = ["Retail", "Corporate", "Risk", "IT"];

  const descTemplates = [
    "Expanding market reach via advanced digital engagement channels.",
    "Automating core operational workflows to reduce manual overhead and cycle times.",
    "Implementing cutting-edge machine learning models for predictive intelligence.",
    "Upgrading facilities and energy monitoring systems to minimize carbon footprints.",
    "Optimizing real-time pricing models to capture hidden margin opportunities.",
    "Enhancing digital experiences to boost user retention and transaction volume.",
    "Consolidating cloud infrastructure to enhance resilience and security posture.",
    "Accelerating international settlement rails to streamline corporate transactions.",
    "Re-architecting legacy databases to support sub-millisecond querying latency.",
    "Deploying proactive anomaly detection pipelines to identify operational friction."
  ];

  function generateMockProjects(count) {
    const data = [];
    const usedNames = new Set();

    for (let i = 0; i < count; i++) {
      let name = "";
      do {
        const p = prefixes[Math.floor(Math.random() * prefixes.length)];
        const c = cores[Math.floor(Math.random() * cores.length)];
        const s = suffixes[Math.floor(Math.random() * suffixes.length)];
        name = `${p} ${c} ${s}`;
      } while (usedNames.has(name));
      usedNames.add(name);

      const budget = Math.floor(Math.random() * 99000) + 1000; // $1,000 to $100,000

      const strategyIndex = Math.floor(Math.random() * strategies.length);
      const benefitIndex = Math.floor(Math.random() * benefits.length);
      const capabilityIndex = Math.floor(Math.random() * capabilities.length);
      const businessUnitIndex = Math.floor(Math.random() * businessUnits.length);

      const active = Math.random() > 0.45; // ~55% active
      const desc = descTemplates[Math.floor(Math.random() * descTemplates.length)];

      data.push({
        id: `PRJ-${String(i+1).padStart(3, '0')}`,
        name: name,
        budget: budget,
        active: active,
        description: desc,
        alignments: {
          Strategy: strategies[strategyIndex],
          Benefits: benefits[benefitIndex],
          Capability: capabilities[capabilityIndex],
          "Business Unit": businessUnits[businessUnitIndex]
        },
        indexes: {
          Strategy: strategyIndex,
          Benefits: benefitIndex,
          Capability: capabilityIndex,
          "Business Unit": businessUnitIndex
        }
      });
    }
    return data;
  }

  // Attach to window so it is accessible in sketch.js
  window.PROJECT_DATA = generateMockProjects(600);
})();
