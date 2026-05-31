/* Strategic Swarms - Upgraded p5.js Kinetic Swarm Simulation */

let bees = [];
let numBees = 600;

// Configuration Categories & Views
const viewsData = {
  "Strategy": ["Growth", "Efficiency", "Innovation", "Sustainability"],
  "Benefits": ["Revenue", "Cost Reduction", "Customer Satisfaction", "Risk Mitigation"],
  "Capability": ["Technology", "Operations", "Finance", "Strategy"],
  "Business Unit": ["Retail", "Corporate", "Risk", "IT"]
};

let currentView = "Strategy";
let hoveredBee = null;
let searchFilter = "";
let showActiveOnly = false;
let maxBudgetFilter = 100000;

// Canvas styling colors
const colors = {
  activeGold: "#FFC837",
  activeGoldGlow: "rgba(255, 200, 55, 0.4)",
  inactiveBlue: "#38BDF8",
  inactiveBlueGlow: "rgba(56, 189, 248, 0.2)",
  bgPrimary: "#0b0f19",
  gridLine: "rgba(255, 255, 255, 0.04)",
  textSecondary: "rgba(255, 255, 255, 0.6)",
  textMuted: "rgba(255, 255, 255, 0.3)"
};

function setup() {
  const container = document.getElementById("canvas-container");
  const canvasWidth = container.clientWidth;
  const canvasHeight = container.clientHeight;
  const canvas = createCanvas(canvasWidth, canvasHeight);
  canvas.parent("canvas-container");

  const rawProjects = window.PROJECT_DATA || [];
  for (let i = 0; i < rawProjects.length; i++) {
    const proj = rawProjects[i];
    bees.push(new Bee(proj));
  }

  setupDOMEventListeners();
  updateHUDAggregates();
}

function draw() {
  background(colors.bgPrimary);
  drawGridAndLegends();

  let closestBee = null;
  let closestDist = 20;

  for (let bee of bees) {
    bee.update(bees);
    if (bee.matchesFilters()) {
      bee.display();
      let d = dist(mouseX, mouseY, bee.x, bee.y);
      if (d < closestDist) {
        closestDist = d;
        closestBee = bee;
      }
    }
  }

  handleHoverInteraction(closestBee);
}

function windowResized() {
  const container = document.getElementById("canvas-container");
  resizeCanvas(container.clientWidth, container.clientHeight);
  for (let bee of bees) {
    bee.recalculateTargetOffsets();
  }
}

function drawGridAndLegends() {
  const labels = viewsData[currentView];
  const padding = 120;
  strokeWeight(1);
  textAlign(CENTER, CENTER);
  for (let i = 0; i < labels.length; i++) {
    let x = map(i, 0, labels.length - 1, padding, width - padding);
    stroke(colors.gridLine);
    line(x, 40, x, height - 80);
    noStroke();
    fill(colors.textSecondary);
    textFont("Outfit");
    textSize(14);
    text(labels[i].toUpperCase(), x, height - 40);
  }
  // Y‑axis budget markers
  noStroke();
  fill(colors.textMuted);
  textAlign(LEFT, CENTER);
  textSize(10);
  textFont("Inter");
  text("$100k", 20, 50);
  text("$50k", 20, (height - 80) / 2 + 20);
  text("$1k", 20, height - 90);
  // Y‑axis line
  stroke(colors.gridLine);
  line(50, 45, 50, height - 85);
}

function setupDOMEventListeners() {
  const buttons = document.querySelectorAll(".segment-btn");
  buttons.forEach(btn => {
    btn.addEventListener("click", e => {
      buttons.forEach(b => b.classList.remove("active"));
      e.target.classList.add("active");
      currentView = e.target.getAttribute("data-view");
    });
  });
  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.addEventListener("input", e => {
      searchFilter = e.target.value.toLowerCase().trim();
      updateHUDAggregates();
    });
  }
  const activeCheckbox = document.getElementById("active-checkbox");
  if (activeCheckbox) {
    activeCheckbox.addEventListener("change", e => {
      showActiveOnly = e.target.checked;
      updateHUDAggregates();
    });
  }
  const budgetSlider = document.getElementById("budget-slider");
  if (budgetSlider) {
    budgetSlider.addEventListener("input", e => {
      maxBudgetFilter = parseInt(e.target.value);
      document.getElementById("budget-val-label").textContent = `$${(maxBudgetFilter / 1000).toFixed(0)}k`;
      updateHUDAggregates();
    });
  }
}

function updateHUDAggregates() {
  const rawProjects = window.PROJECT_DATA || [];
  let totalCount = 0, activeCount = 0, totalBudget = 0;
  for (let p of rawProjects) {
    const matchesSearch = p.name.toLowerCase().includes(searchFilter) || p.id.toLowerCase().includes(searchFilter);
    const matchesActive = !showActiveOnly || p.active;
    const matchesBudget = p.budget <= maxBudgetFilter;
    if (matchesSearch && matchesActive && matchesBudget) {
      totalCount++;
      if (p.active) activeCount++;
      totalBudget += p.budget;
    }
  }
  const countEl = document.getElementById("hud-total-count");
  const budgetEl = document.getElementById("hud-total-budget");
  const activeRatioEl = document.getElementById("hud-active-ratio");
  const activeBarEl = document.getElementById("hud-active-bar");
  if (countEl) countEl.textContent = totalCount;
  if (budgetEl) budgetEl.textContent = `$${(totalBudget / 1000000).toFixed(2)}M`;
  if (totalCount > 0) {
    const ratio = Math.round((activeCount / totalCount) * 100);
    if (activeRatioEl) activeRatioEl.textContent = `${ratio}%`;
    if (activeBarEl) activeBarEl.style.width = `${ratio}%`;
  } else {
    if (activeRatioEl) activeRatioEl.textContent = "0%";
    if (activeBarEl) activeBarEl.style.width = "0%";
  }
}

function handleHoverInteraction(bee) {
  const drawer = document.getElementById("inspection-drawer");
  if (bee) {
    cursor(HAND);
    hoveredBee = bee;
    push();
    noFill();
    stroke(bee.active ? colors.activeGold : colors.inactiveBlue);
    strokeWeight(1.5);
    drawingContext.shadowBlur = 15;
    drawingContext.shadowColor = bee.active ? colors.activeGold : colors.inactiveBlue;
    ellipse(bee.x, bee.y, bee.size * 2, bee.size * 2);
    pop();
    document.getElementById("proj-id").textContent = bee.id;
    document.getElementById("proj-name").textContent = bee.name;
    document.getElementById("proj-desc").textContent = bee.description;
    document.getElementById("proj-budget").textContent = `$${bee.budget.toLocaleString()}`;
    const statusBadg = document.getElementById("proj-status");
    if (bee.active) {
      statusBadg.className = "badge-status active";
      statusBadg.textContent = "Active Portfolio";
    } else {
      statusBadg.className = "badge-status inactive";
      statusBadg.textContent = "Inactive / Pipeline";
    }
    drawer.classList.add("active");
  } else {
    cursor(ARROW);
    hoveredBee = null;
    drawer.classList.remove("active");
  }
}

class Bee {
  constructor(proj) {
    this.id = proj.id;
    this.name = proj.name;
    this.budget = proj.budget;
    this.active = proj.active;
    this.description = proj.description;
    this.alignments = proj.alignments;
    this.indexes = proj.indexes;
    this.position = createVector(random(width), random(height));
    this.velocity = createVector(random(-1, 1), random(-1, 1));
    this.acceleration = createVector(0, 0);
    this.size = map(this.budget, 1000, 100000, 8, 22);
    this.offset = random(TWO_PI);
    this.wingsOffset = random(10);
    this.maxspeed = 4;
    this.maxforce = 0.15;
    this.history = [];
    this.historyLimit = 6;
    this.recalculateTargetOffsets();
  }

  get x() { return this.position.x; }
  get y() { return this.position.y; }

  recalculateTargetOffsets() {
    this.targetOffsets = {
      Strategy: random(-45, 45),
      Benefits: random(-45, 45),
      Capability: random(-45, 45),
      "Business Unit": random(-45, 45)
    };
  }

  matchesFilters() {
    const matchesSearch = this.name.toLowerCase().includes(searchFilter) || this.id.toLowerCase().includes(searchFilter);
    const matchesActive = !showActiveOnly || this.active;
    const matchesBudget = this.budget <= maxBudgetFilter;
    return matchesSearch && matchesActive && matchesBudget;
  }

  update(allBees) {
    this.history.push(this.position.copy());
    if (this.history.length > this.historyLimit) this.history.shift();

    let categoryIndex = this.indexes[currentView];
    let columnCount = viewsData[currentView].length;
    let padding = 120;
    let targetX = map(categoryIndex, 0, columnCount - 1, padding, width - padding) + this.targetOffsets[currentView];
    let targetY = map(this.budget, 1000, 100000, height - 100, 60);

    let springForce = this.seek(createVector(targetX, targetY));
    let separationForce = this.separate(allBees);
    let avoidanceForce = this.avoidMouse();
    springForce.mult(1.2);
    separationForce.mult(1.5);
    avoidanceForce.mult(2.5);
    this.acceleration.add(springForce);
    this.acceleration.add(separationForce);
    this.acceleration.add(avoidanceForce);

    this.yOffset = sin(frameCount * 0.05 + this.offset) * 0.3;
    this.acceleration.y += this.yOffset;

    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxspeed);
    this.position.add(this.velocity);
    this.acceleration.mult(0);
    this.position.x = constrain(this.position.x, 20, width - 20);
    this.position.y = constrain(this.position.y, 20, height - 80);
  }

  display() {
    push();
    // motion‑blur trails
    strokeWeight(1);
    for (let i = 0; i < this.history.length; i++) {
      let opacity = map(i, 0, this.history.length, 0, 50);
      stroke(this.active ? `rgba(255, 200, 55, ${opacity / 255})` : `rgba(56, 189, 248, ${opacity / 255})`);
      fill(this.active ? `rgba(255, 200, 55, ${opacity / 500})` : `rgba(56, 189, 248, ${opacity / 500})`);
      let dSize = map(i, 0, this.history.length, 2, this.size * 0.8);
      ellipse(this.history[i].x, this.history[i].y, dSize, dSize);
    }
    translate(this.x, this.y);
    drawingContext.shadowBlur = hoveredBee === this ? 20 : 10;
    drawingContext.shadowColor = this.active ? colors.activeGold : colors.inactiveBlue;
    noStroke();
    fill(this.active ? colors.activeGold : colors.inactiveBlue);
    ellipse(0, 0, this.size, this.size);
    this.drawWings(sin(frameCount * 0.25 + this.wingsOffset) * (this.size / 6));
    pop();
  }

  drawWings(offset) {
    drawingContext.shadowBlur = 0;
    noStroke();
    fill(240, 240, 245, 120);
    let theta = this.velocity.heading() + HALF_PI;
    rotate(theta);
    ellipse(-this.size / 2.2, -this.size / 3 + offset, this.size * 0.9, this.size * 0.45);
    ellipse(this.size / 2.2, -this.size / 3 + offset, this.size * 0.9, this.size * 0.45);
  }

  seek(target) {
    let desired = p5.Vector.sub(target, this.position);
    let d = desired.mag();
    desired.normalize();
    if (d < 100) {
      let speed = map(d, 0, 100, 0, this.maxspeed);
      desired.mult(speed);
    } else {
      desired.mult(this.maxspeed);
    }
    let steer = p5.Vector.sub(desired, this.velocity);
    steer.limit(this.maxforce);
    return steer;
  }

  separate(allBees) {
    let desiredseparation = this.size * 1.5;
    let steer = createVector(0, 0);
    let count = 0;
    for (let i = 0; i < allBees.length; i += 3) {
      let other = allBees[i];
      if (other.id !== this.id && other.matchesFilters()) {
        let d = p5.Vector.dist(this.position, other.position);
        if (d > 0 && d < desiredseparation) {
          let diff = p5.Vector.sub(this.position, other.position);
          diff.normalize();
          diff.div(d);
          steer.add(diff);
          count++;
        }
      }
    }
    if (count > 0) steer.div(count);
    if (steer.mag() > 0) {
      steer.normalize();
      steer.mult(this.maxspeed);
      steer.sub(this.velocity);
      steer.limit(this.maxforce);
    }
    return steer;
  }

  avoidMouse() {
    let mousePos = createVector(mouseX, mouseY);
    let d = p5.Vector.dist(this.position, mousePos);
    let avoidanceRadius = 80;
    if (d < avoidanceRadius) {
      let steer = p5.Vector.sub(this.position, mousePos);
      steer.normalize();
      let intensity = map(d, 0, avoidanceRadius, this.maxspeed * 1.5, 0);
      steer.mult(intensity);
      steer.sub(this.velocity);
      steer.limit(this.maxforce * 2.0);
      return steer;
    }
    return createVector(0, 0);
  }
}
