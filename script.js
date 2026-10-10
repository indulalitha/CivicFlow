const $ = id => document.getElementById(id);

const schemes = [
  {
    id: "udyam",
    title: "Udyam Registration",
    type: "Registration support",
    icon: "badge-check",
    industries: ["manufacturing","technology","retail","agriculture","services"],
    description: "Explore official MSME registration information and the benefits available to eligible enterprises.",
    eligibility: "For qualifying micro, small and medium enterprises.",
    url: "https://udyamregistration.gov.in/"
  },
  {
    id: "samadhaan",
    title: "MSME Samadhaan",
    type: "Payment support",
    icon: "wallet",
    industries: ["manufacturing","technology","retail","agriculture","services"],
    description: "Explore the official delayed-payment mechanism for eligible micro and small enterprises.",
    eligibility: "Applicability depends on enterprise status and the payment dispute.",
    url: "https://samadhaan.msme.gov.in/"
  },
  {
    id: "champions",
    title: "CHAMPIONS Portal",
    type: "Business assistance",
    icon: "handshake",
    industries: ["manufacturing","technology","retail","agriculture","services"],
    description: "Find MSME guidance and support channels for business-related issues.",
    eligibility: "Support depends on the issue and the service requested.",
    url: "https://champions.gov.in/"
  },
  {
    id: "startup",
    title: "Startup India",
    type: "Startup support",
    icon: "rocket",
    industries: ["technology","services","agriculture","manufacturing"],
    description: "Explore startup recognition, learning resources, and support opportunities.",
    eligibility: "Startup recognition and benefits have specific eligibility conditions.",
    url: "https://www.startupindia.gov.in/"
  },
  {
    id: "gst",
    title: "GST Portal",
    type: "Tax and registration",
    icon: "receipt-text",
    industries: ["manufacturing","technology","retail","agriculture","services"],
    description: "Find official GST registration, return-filing, and taxpayer service information.",
    eligibility: "GST obligations depend on applicable law and your business circumstances.",
    url: "https://www.gst.gov.in/"
  },
  {
    id: "mymsme",
    title: "MSME Ministry Resources",
    type: "Government support",
    icon: "landmark",
    industries: ["manufacturing","technology","retail","agriculture","services"],
    description: "Explore official central MSME resources, initiatives, and scheme information.",
    eligibility: "Each programme has its own current eligibility and application process.",
    url: "https://msme.gov.in/"
  }
];

let tasks = [
  {id:1,title:"Review business registration details",type:"Registration",date:"Demo · Oct 15",done:true},
  {id:2,title:"Organise sales and expense records",type:"Bookkeeping",date:"Demo · Oct 18",done:false},
  {id:3,title:"Review applicable GST requirements",type:"Tax review",date:"Demo · Oct 20",done:false},
  {id:4,title:"Check business licence requirements",type:"Licensing",date:"Demo · Oct 24",done:false}
];

let applicationCount = 1;
let businessProfile = null;
let toastTimeout;

function icon(name) {
  return `<i data-lucide="${name}"></i>`;
}

function refreshIcons() {
  if (window.lucide) lucide.createIcons();
}

function notify(message) {
  const toast = $("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove("show"), 2800);
}

function showPage(page) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  const target = $("page-" + page);
  if (!target) return;
  target.classList.add("active");

  document.querySelectorAll(".nav-link[data-page]").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.page === page);
  });

  const names = {
    overview:"Overview",
    discover:"Scheme discovery",
    compliance:"Compliance tracker",
    applications:"Applications",
    advisors:"Find an advisor"
  };

  $("breadcrumb").textContent = names[page] || "Overview";
  $("sidebar").classList.remove("open");
  window.scrollTo({top:0,behavior:"smooth"});

  if (page === "compliance") renderTasks();
  if (page === "advisors") renderAdvisors();
  refreshIcons();
}

function toggleSidebar() {
  $("sidebar").classList.toggle("open");
}

function schemeCard(scheme, compact = false) {
  return `
    <article class="${compact ? "scheme-row" : "result-card"}">
      <div class="scheme-symbol">${icon(scheme.icon)}</div>
      <div class="${compact ? "scheme-main" : ""}">
        <h3>${scheme.title}</h3>
        <p>${scheme.description}</p>
        ${compact
          ? `<button class="link-btn" onclick="openScheme('${scheme.id}')">Explore details ${icon("arrow-right")}</button>`
          : `<div class="scheme-type">${scheme.type}</div>
             <p class="result-description"><strong>Eligibility to check:</strong> ${scheme.eligibility}</p>
             <div class="result-actions">
               <button class="btn btn-primary" onclick="openScheme('${scheme.id}')">View details ${icon("arrow-right")}</button>
               <button class="btn btn-outline" onclick="openOfficial('${scheme.id}')">Official website ${icon("external-link")}</button>
             </div>`
        }
      </div>
      ${compact ? "" : `<span class="match-tag">EXPLORE</span>`}
    </article>`;
}

function renderOverviewSchemes(list = schemes.slice(0,3)) {
  $("overviewSchemes").innerHTML = list.slice(0,3).map(s => schemeCard(s,true)).join("");
  $("matchCount").textContent = String(list.length).padStart(2,"0");
}

function renderDiscovery(list = schemes.slice(0,3)) {
  $("schemeResults").innerHTML = list.length
    ? list.map(s => schemeCard(s,false)).join("")
    : `<div class="panel empty-state">No sample matches for this combination. Try a different industry or explore all schemes.</div>`;

  $("resultCount").textContent = `${String(list.length).padStart(2,"0")} options`;
  $("resultsTitle").textContent = businessProfile
    ? `Opportunities for ${businessProfile.name}`
    : "Potential opportunities";
  refreshIcons();
}

function openScheme(id) {
  const s = schemes.find(item => item.id === id);
  if (!s) return;

  $("modalTitle").textContent = s.title;
  $("modalBody").innerHTML = `
    <p class="modal-body-copy">${s.description}</p>
    <ul class="modal-list">
      <li>${icon("check-circle")} <span><strong>What to explore:</strong> ${s.type} and the relevant official guidance.</span></li>
      <li>${icon("clipboard-list")} <span><strong>Eligibility:</strong> ${s.eligibility}</span></li>
      <li>${icon("shield-check")} <span><strong>Before applying:</strong> Verify current rules, required documents, fees, and deadlines on the official portal.</span></li>
    </ul>
    <p class="modal-body-copy">CivicFlow has not checked your eligibility against live government databases. This is an informational demo, not an approval or benefit estimate.</p>`;

  $("modalAction").textContent = "Open official portal";
  $("modalAction").onclick = () => {
    closeModal();
    openOfficial(id);
  };

  $("modalBackdrop").classList.add("open");
  refreshIcons();
}

function openOfficial(id) {
  const s = schemes.find(item => item.id === id);
  if (s) window.open(s.url,"_blank","noopener,noreferrer");
}

function closeModal() {
  $("modalBackdrop").classList.remove("open");
}

$("businessForm").addEventListener("submit", function(event) {
  event.preventDefault();

  businessProfile = {
    name: $("businessName").value.trim(),
    industry: $("industry").value,
    state: $("state").value,
    turnover: $("turnover").value,
    registration: $("registration").value,
    firstGen: $("firstGen").checked
  };

  if (!businessProfile.name) {
    notify("Please enter your business name.");
    return;
  }

  let matches = schemes.filter(s =>
    s.industries.includes(businessProfile.industry)
  );

  // Transparent demo logic only; not a real eligibility determination.
  if (businessProfile.registration === "none") {
    matches = matches.filter(s => ["udyam","startup","mymsme"].includes(s.id));
  } else if (businessProfile.registration === "gst") {
    matches = matches.filter(s => ["gst","samadhaan","champions","mymsme"].includes(s.id));
  }

  if (businessProfile.firstGen) {
    const startup = schemes.find(s => s.id === "startup");
    if (startup && !matches.some(s => s.id === "startup")) matches.unshift(startup);
  }

  renderDiscovery(matches);
  renderOverviewSchemes(matches);
  showPage("discover");
  notify("Demo recommendations updated for your business.");
});

function renderTasks() {
  const done = tasks.filter(t => t.done).length;
  const pending = tasks.length - done;
  const percent = tasks.length ? Math.round(done / tasks.length * 100) : 0;

  $("pendingCount").textContent = String(pending).padStart(2,"0");
  $("progressText").textContent = `${done} of ${tasks.length}`;
  $("progressBar").style.width = percent + "%";
  $("totalTasks").textContent = tasks.length;
  $("completedTasks").textContent = done;
  $("remainingTasks").textContent = pending;

  const sorted = [...tasks].sort((a,b) => Number(a.done)-Number(b.done));

  $("overviewTasks").innerHTML = sorted.slice(0,3).map(t => `
    <div class="task-item">
      <button class="task-check ${t.done ? "done" : ""}" aria-label="${t.done ? "Mark incomplete" : "Mark complete"}: ${t.title}" onclick="toggleTask(${t.id})">
        ${t.done ? icon("check") : ""}
      </button>
      <div class="task-copy ${t.done ? "completed" : ""}">
        <strong>${t.title}</strong><small>${t.done ? "Completed in demo" : t.date + " · Illustrative"}</small>
      </div>
    </div>`).join("");

  $("allTasks").innerHTML = tasks.map(t => `
    <div class="all-task-row">
      <div class="table-task">
        <button class="task-check ${t.done ? "done" : ""}" aria-label="${t.done ? "Mark incomplete" : "Mark complete"}: ${t.title}" onclick="toggleTask(${t.id})">${t.done ? icon("check") : ""}</button>
        <div><strong>${t.title}</strong><small>${t.done ? "Completed in demo" : "Review applicable requirements"}</small></div>
      </div>
      <div class="table-type">${t.type}</div>
      <div class="table-date">${t.date}</div>
      <div class="task-status ${t.done ? "done-status" : ""}">${t.done ? "Completed" : "To review"}</div>
    </div>`).join("");

  refreshIcons();
}

function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  task.done = !task.done;
  renderTasks();
  notify(task.done ? "Task marked complete in this demo." : "Task moved back to review.");
}

function addTask() {
  const title = prompt("Enter a business task to add:");
  if (!title || !title.trim()) return;

  tasks.push({
    id: Date.now(),
    title: title.trim(),
    type: "Custom task",
    date: "No deadline set",
    done: false
  });

  renderTasks();
  notify("Your custom task was added.");
}

function openApplication(name) {
  $("modalTitle").textContent = name;
  $("modalBody").innerHTML = `
    <p class="modal-body-copy">This is a sample preparation workspace. No official application has been created or submitted.</p>
    <ul class="modal-list">
      <li>${icon("check-circle")} <span>Review business registration information.</span></li>
      <li>${icon("check-circle")} <span>Collect relevant business records and supporting documents.</span></li>
      <li>${icon("check-circle")} <span>Confirm the current eligibility criteria and required forms on the official portal.</span></li>
      <li>${icon("alert-circle")} <span>Do not upload Aadhaar, PAN, bank statements, or other sensitive documents to this demo.</span></li>
    </ul>
    <p class="modal-body-copy">A future version could support secure document upload, pre-filled forms, user consent, and verified submission integrations.</p>`;

  $("modalAction").textContent = "Save demo draft";
  $("modalAction").onclick = () => {
    closeModal();
    notify("Preview reviewed. No official filing was made.");
  };

  $("modalBackdrop").classList.add("open");
  refreshIcons();
}

const advisors = [
  {name:"Ananya Rao",initials:"AR",type:"tax",specialty:"Tax & GST",bio:"Sample profile for tax filing and bookkeeping support.",location:"Example · Hyderabad",cls:""},
  {name:"Rahul Mehta",initials:"RM",type:"msme",specialty:"MSME schemes",bio:"Sample profile for exploring small-business support programmes.",location:"Example · Vijayawada",cls:"a2"},
  {name:"Priya Sharma",initials:"PS",type:"legal",specialty:"Legal & licensing",bio:"Sample profile for licensing and regulatory guidance.",location:"Example · Bengaluru",cls:"a3"},
  {name:"Kiran Reddy",initials:"KR",type:"tax",specialty:"Accounting & tax",bio:"Sample profile for accounting records and tax questions.",location:"Example · Visakhapatnam",cls:"a2"},
  {name:"Neha Kapoor",initials:"NK",type:"msme",specialty:"Business support",bio:"Sample profile for identifying potentially relevant schemes.",location:"Example · Chennai",cls:""},
  {name:"Arjun Das",initials:"AD",type:"legal",specialty:"Business registration",bio:"Sample profile for business formation and licence questions.",location:"Example · Mumbai",cls:"a3"}
];

function renderAdvisors(list = advisors) {
  $("advisorGrid").innerHTML = list.length ? list.map(a => `
    <article class="advisor-card">
      <div class="advisor-top">
        <div class="advisor-avatar ${a.cls}">${a.initials}</div>
        <div><h3>${a.name}</h3><p>Illustrative advisor profile</p></div>
      </div>
      <span class="advisor-specialty">${a.specialty}</span>
      <p>${a.bio}</p>
      <div class="advisor-location">${icon("map-pin")}${a.location}</div>
      <button class="btn btn-outline" onclick="requestAdvisor('${a.name}')">Request information ${icon("arrow-right")}</button>
    </article>`).join("") :
    `<div class="empty-state">No sample advisors match your search.</div>`;
  refreshIcons();
}

function filterAdvisors() {
  const query = $("advisorSearch").value.toLowerCase().trim();
  const type = $("advisorType").value;
  renderAdvisors(advisors.filter(a =>
    (type === "all" || a.type === type) &&
    `${a.name} ${a.specialty} ${a.bio} ${a.location}`.toLowerCase().includes(query)
  ));
}

function requestAdvisor(name) {
  $("modalTitle").textContent = "Advisor enquiry";
  $("modalBody").innerHTML = `
    <p class="modal-body-copy">You selected <strong>${name}</strong>, a fictional profile included to demonstrate the advisor marketplace.</p>
    <ul class="modal-list">
      <li>${icon("shield-check")} <span>A real platform would verify professional credentials.</span></li>
      <li>${icon("file-check")} <span>Your enquiry would require your consent before any personal details were shared.</span></li>
    </ul>
    <p class="modal-body-copy">No message was sent and no referral was created.</p>`;
  $("modalAction").textContent = "Close";
  $("modalAction").onclick = closeModal;
  $("modalBackdrop").classList.add("open");
  refreshIcons();
}

// AI assistant: offline, rule-based demonstration.
function toggleChat() {
  $("chatWindow").classList.toggle("open");
  if ($("chatWindow").classList.contains("open")) {
    $("chatInput").focus();
    refreshIcons();
  }
}

function openAssistant() {
  $("chatWindow").classList.add("open");
  $("chatInput").focus();
  refreshIcons();
}

function quickAsk(question) {
  $("chatWindow").classList.add("open");
  $("chatInput").value = question;
  $("chatForm").requestSubmit();
}

function addMessage(text, type) {
  const node = document.createElement("div");
  node.className = "message " + (type === "user" ? "user-message" : "bot-message");
  node.textContent = text;
  $("chatMessages").appendChild(node);
  $("chatMessages").scrollTop = $("chatMessages").scrollHeight;
}

function getBotReply(question) {
  const q = question.toLowerCase();

  if (q.includes("udyam") || q.includes("msme registration")) {
    return "Udyam Registration is the official MSME registration process in India. Start with https://udyamregistration.gov.in/ and read the current instructions. The official portal explains the required information and process. This demo cannot register your business.";
  }

  if (q.includes("scheme") || q.includes("subsid") || q.includes("benefit") || q.includes("grant")) {
    return "To explore business support, start with the Ministry of MSME at https://msme.gov.in/ and Startup India at https://www.startupindia.gov.in/ if relevant. Eligibility can depend on enterprise classification, sector, location, scheme rules, and application dates. Open Scheme Discovery to explore sample matches.";
  }

  if (q.includes("document") || q.includes("paper")) {
    return "Depending on the service, you may need business registration details, contact information, business activity information, financial records, or supporting invoices. Requirements vary. Check the relevant official portal before preparing an application. Please don't share sensitive documents in this demo.";
  }

  if (q.includes("gst") || q.includes("tax") || q.includes("return")) {
    return "GST registration and filing obligations depend on applicable law and your business circumstances. Use https://www.gst.gov.in/ for official guidance. A qualified tax professional can help clarify requirements for your case. The deadlines in this prototype are fictional.";
  }

  if (q.includes("license") || q.includes("licence") || q.includes("permit")) {
    return "Licences depend on your activity and location. You may need to check local municipal requirements and relevant state or central department portals. Tell us your business activity and state in Scheme Discovery, then verify every requirement with the responsible authority.";
  }

  if (q.includes("startup") || q.includes("entrepreneur")) {
    return "You can explore startup recognition and support resources at https://www.startupindia.gov.in/. Recognition, tax benefits, and other programmes have their own eligibility rules. A new business is not automatically eligible for every startup benefit.";
  }

  if (q.includes("hello") || q.includes("hi ") || q === "hi" || q.includes("help")) {
    return "Hello! I can guide you through scheme discovery, Udyam registration, GST resources, licences, and document preparation. Ask a question or choose one of the suggested prompts below.";
  }

  return "I can help you explore MSME schemes, Udyam registration, GST resources, business licences, and document checklists. This prototype uses rule-based demo answers rather than a live AI model. Please verify legal, financial, and eligibility decisions with official sources or a qualified professional.";
}

$("chatForm").addEventListener("submit", event => {
  event.preventDefault();
  const question = $("chatInput").value.trim();
  if (!question) return;

  addMessage(question,"user");
  $("chatInput").value = "";

  // Immediate local reply; no backend or external AI API is used.
  setTimeout(() => addMessage(getBotReply(question),"bot"),180);
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    closeModal();
    $("chatWindow").classList.remove("open");
    $("sidebar").classList.remove("open");
  }
});

renderOverviewSchemes();
renderDiscovery();
renderTasks();
renderAdvisors();
refreshIcons();