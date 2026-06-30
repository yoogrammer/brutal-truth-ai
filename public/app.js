// ─── STATE ────────────────────────────────────────────────────────────────────
let tasks = [];
let currentEmailTask = null;
let analysisData = null;

// ─── INIT ─────────────────────────────────────────────────────────────────────
window.onload = () => {
    // Set current time
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    document.getElementById("currentTime").value = `${hh}:${mm}`;

    // Start with 2 empty tasks
    addTask();
    addTask();
};

// ─── TASK MANAGEMENT ─────────────────────────────────────────────────────────
function addTask() {
    const id = Date.now();
    tasks.push({ id });
    renderTaskList();
}

function removeTask(id) {
    tasks = tasks.filter((t) => t.id !== id);
    renderTaskList();
}

function renderTaskList() {
    const container = document.getElementById("taskList");
    container.innerHTML = tasks
        .map(
            (t, i) => `
    <div class="bg-gray-800 border border-gray-700 rounded-xl p-4" id="task-${t.id}">
      <div class="flex items-center justify-between mb-3">
        <span class="text-xs font-bold text-gray-400 uppercase tracking-widest">Task ${i + 1}</span>
        ${tasks.length > 1 ? `<button onclick="removeTask(${t.id})" class="text-gray-600 hover:text-brutal text-xs transition">✕ Remove</button>` : ""}
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div class="md:col-span-2">
          <label class="block text-xs text-gray-500 mb-1">Task Title</label>
          <input
            type="text"
            placeholder="e.g. Machine Learning Assignment"
            id="title-${t.id}"
            class="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brutal"
          />
        </div>
        <div>
          <label class="block text-xs text-gray-500 mb-1">Deadline</label>
          <input
            type="datetime-local"
            id="deadline-${t.id}"
            class="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brutal"
          />
        </div>
        <div>
          <label class="block text-xs text-gray-500 mb-1">Hours Needed (total)</label>
          <input
            type="number"
            step="0.5"
            min="0.5"
            placeholder="e.g. 6"
            id="hours-${t.id}"
            class="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brutal"
          />
        </div>
        <div>
          <label class="block text-xs text-gray-500 mb-1">Work Done So Far (%)</label>
          <input
            type="number"
            min="0"
            max="99"
            placeholder="e.g. 30"
            id="progress-${t.id}"
            class="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brutal"
          />
        </div>
        <div>
          <label class="block text-xs text-gray-500 mb-1">Importance (1–5)</label>
          <select
            id="importance-${t.id}"
            class="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brutal"
          >
            <option value="5">5 — Critical</option>
            <option value="4">4 — High</option>
            <option value="3" selected>3 — Medium</option>
            <option value="2">2 — Low</option>
            <option value="1">1 — Optional</option>
          </select>
        </div>
      </div>
    </div>
  `
        )
        .join("");
}

// ─── COLLECT TASK DATA ────────────────────────────────────────────────────────
function collectTasks() {
    return tasks.map((t) => ({
        title: document.getElementById(`title-${t.id}`)?.value || "Untitled Task",
        deadline:
            document.getElementById(`deadline-${t.id}`)?.value || "Tonight 11:59 PM",
        estimatedHours:
            parseFloat(document.getElementById(`hours-${t.id}`)?.value) || 2,
        progressPercent:
            parseInt(document.getElementById(`progress-${t.id}`)?.value) || 0,
        importance:
            parseInt(document.getElementById(`importance-${t.id}`)?.value) || 3,
    }));
}

// ─── DEMO DATA ────────────────────────────────────────────────────────────────
function loadDemo() {
    // Clear and reset
    tasks = [];

    const now = new Date();
    const tonight = new Date(now);
    tonight.setHours(23, 59, 0, 0);
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    const in3h = new Date(now.getTime() + 3 * 60 * 60 * 1000);

    const demoTasks = [
        {
            title: "Machine Learning Assignment (10 pages)",
            deadline: tonight.toISOString().slice(0, 16),
            hours: "8",
            progress: "20",
            importance: "5",
        },
        {
            title: "Job Interview Preparation",
            deadline: tomorrow.toISOString().slice(0, 16),
            hours: "4",
            progress: "0",
            importance: "5",
        },
        {
            title: "Rent Payment",
            deadline: in3h.toISOString().slice(0, 16),
            hours: "0.5",
            progress: "0",
            importance: "5",
        },
    ];

    demoTasks.forEach((dt) => {
        const id = Date.now() + Math.random();
        tasks.push({ id });
    });

    renderTaskList();

    // Wait for DOM then fill values
    setTimeout(() => {
        tasks.forEach((t, i) => {
            const dt = demoTasks[i];
            document.getElementById(`title-${t.id}`).value = dt.title;
            document.getElementById(`deadline-${t.id}`).value = dt.deadline;
            document.getElementById(`hours-${t.id}`).value = dt.hours;
            document.getElementById(`progress-${t.id}`).value = dt.progress;
            document.getElementById(`importance-${t.id}`).value = dt.importance;
        });
        document.getElementById("availableHours").value = "3";
        document.getElementById("userName").value = "Alex";
    }, 100);
}

// ─── ANALYZE ─────────────────────────────────────────────────────────────────
async function analyze() {
    const availableHours =
        parseFloat(document.getElementById("availableHours").value) || 4;
    const currentTime =
        document.getElementById("currentTime").value || "12:00";
    const userName = document.getElementById("userName").value || "User";
    const collectedTasks = collectTasks();

    // Basic validation
    if (collectedTasks.some((t) => !t.title || t.title === "Untitled Task")) {
        alert("Please fill in all task titles.");
        return;
    }

    showLoading();

    const loadingMessages = [
        "Calculating the truth...",
        "Running the numbers...",
        "No sugar coating...",
        "Generating your reality check...",
    ];
    let msgIndex = 0;
    const msgInterval = setInterval(() => {
        msgIndex = (msgIndex + 1) % loadingMessages.length;
        const el = document.getElementById("loadingText");
        if (el) el.textContent = loadingMessages[msgIndex];
    }, 1200);

    try {
        const response = await fetch("/api/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                tasks: collectedTasks,
                availableHours,
                currentTime,
                userName,
            }),
        });

        const result = await response.json();
        clearInterval(msgInterval);

        if (result.success) {
            analysisData = result.data;
            showResults(result.data);
        } else {
            alert("Error: " + result.error);
            showInput();
        }
    } catch (err) {
        clearInterval(msgInterval);
        alert("Something went wrong. Check your connection.");
        showInput();
    }
}

// ─── SHOW RESULTS ─────────────────────────────────────────────────────────────
function showResults(data) {
    document.getElementById("inputSection").classList.add("hidden");
    document.getElementById("loadingSection").classList.add("hidden");
    document.getElementById("resultsSection").classList.remove("hidden");

    // Verdict Banner
    const banner = document.getElementById("verdictBanner");
    const emoji = document.getElementById("verdictEmoji");
    const title = document.getElementById("verdictTitle");
    const msg = document.getElementById("verdictMessage");

    banner.className = "rounded-xl p-6 border-2 text-center";

    if (data.verdict === "WILL_MAKE_IT") {
        banner.classList.add("verdict-ok");
        emoji.textContent = "✅";
        title.textContent = "YOU WILL MAKE IT";
        title.className = "text-2xl font-black mb-2 text-green-400";
    } else if (data.verdict === "BARELY") {
        banner.classList.add("verdict-barely");
        emoji.textContent = "⚠️";
        title.textContent = "YOU'LL BARELY MAKE IT";
        title.className = "text-2xl font-black mb-2 text-yellow-400";
    } else {
        banner.classList.add("verdict-miss");
        emoji.textContent = "💀";
        title.textContent = "YOU WILL NOT MAKE IT";
        title.className = "text-2xl font-black mb-2 text-brutal";
    }

    msg.textContent = data.verdictMessage;

    // Math
    document.getElementById("hoursNeeded").textContent =
        data.totalHoursNeeded?.toFixed(1) + "h";
    document.getElementById("hoursAvailable").textContent =
        data.totalHoursAvailable?.toFixed(1) + "h";

    const shortfall = document.getElementById("hoursShortfall");
    const sf = data.hoursShortfall || 0;
    if (sf > 0) {
        shortfall.textContent = "-" + sf.toFixed(1) + "h";
        shortfall.className = "text-2xl font-black text-brutal";
    } else {
        shortfall.textContent = "+" + Math.abs(sf).toFixed(1) + "h";
        shortfall.className = "text-2xl font-black text-green-400";
    }

    document.getElementById("mathBreakdown").textContent = data.mathBreakdown;

    // Immediate Action
    document.getElementById("immediateAction").textContent = data.immediateAction;

    // Task Cards
    const taskCards = document.getElementById("taskCards");
    taskCards.innerHTML = data.tasks
        .map(
            (t) => `
    <div class="border rounded-xl p-5 ${t.status === "WILL_MISS"
                    ? "task-card-miss"
                    : t.status === "AT_RISK"
                        ? "task-card-risk"
                        : "task-card-ok"
                }">
      <div class="flex items-start justify-between mb-3">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="text-lg">${t.status === "WILL_MISS"
                    ? "🔴"
                    : t.status === "AT_RISK"
                        ? "🟡"
                        : "🟢"
                }</span>
            <span class="font-bold text-white">${t.title}</span>
          </div>
          <span class="text-xs px-2 py-0.5 rounded-full font-bold ${t.status === "WILL_MISS"
                    ? "bg-red-900 text-red-300"
                    : t.status === "AT_RISK"
                        ? "bg-yellow-900 text-yellow-300"
                        : "bg-green-900 text-green-300"
                }">${t.status.replace("_", " ")}</span>
        </div>
        <div class="text-right">
          <div class="text-sm font-bold text-white">${t.hoursRemaining}h left</div>
          <div class="text-xs text-gray-500">to complete</div>
        </div>
      </div>

      <p class="text-sm text-gray-300 mb-3 italic">"${t.brutalTruth}"</p>

      ${t.actionOption
                    ? `
        <div class="bg-black bg-opacity-30 rounded-lg p-3">
          <div class="text-xs font-bold uppercase tracking-widest mb-1 ${t.recommendation === "RENEGOTIATE"
                        ? "text-blue-400"
                        : t.recommendation === "REDUCE_SCOPE"
                            ? "text-yellow-400"
                            : t.recommendation === "DROP"
                                ? "text-gray-400"
                                : "text-green-400"
                    }">
            ${t.recommendation === "RENEGOTIATE" ? "📧" : t.recommendation === "REDUCE_SCOPE" ? "✂️" : t.recommendation === "DROP" ? "🗑️" : "✅"}
            ${t.actionOption.title}
          </div>
          <div class="text-xs text-gray-400">${t.actionOption.description}</div>
          ${t.recommendation === "RENEGOTIATE"
                        ? `<button
                  onclick="openEmailModal('${encodeURIComponent(t.title)}', '${encodeURIComponent(t.deadline)}')"
                  class="mt-2 text-xs bg-blue-900 hover:bg-blue-800 text-blue-300 px-3 py-1.5 rounded-lg transition"
                >
                  Draft Email Now →
                </button>`
                        : ""
                    }
        </div>
      `
                    : ""
                }
    </div>
  `
        )
        .join("");

    // Survival Plan
    if (data.survivalPlan && data.verdict !== "WILL_NOT_MAKE_IT") {
        document.getElementById("survivalPlanBox").classList.remove("hidden");
        document.getElementById("survivalPlan").textContent = data.survivalPlan;
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
}

// ─── EMAIL MODAL ──────────────────────────────────────────────────────────────
let emailModalTask = null;
let emailModalDeadline = null;

function openEmailModal(taskTitle, deadline) {
    emailModalTask = decodeURIComponent(taskTitle);
    emailModalDeadline = decodeURIComponent(deadline);
    document.getElementById("emailOutput").classList.add("hidden");
    document.getElementById("emailRecipient").value = "";
    document.getElementById("emailReason").value = "";
    document.getElementById("emailModal").classList.remove("hidden");
}

function closeEmailModal() {
    document.getElementById("emailModal").classList.add("hidden");
}

async function generateEmail() {
    const recipient = document.getElementById("emailRecipient").value;
    const reason = document.getElementById("emailReason").value;

    try {
        const response = await fetch("/api/draft-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                taskTitle: emailModalTask,
                deadline: emailModalDeadline,
                recipient,
                reason,
            }),
        });

        const result = await response.json();
        if (result.success) {
            document.getElementById("emailSubject").textContent = result.data.subject;
            document.getElementById("emailBody").textContent = result.data.body;
            document.getElementById("emailOutput").classList.remove("hidden");
        }
    } catch (err) {
        alert("Error generating email.");
    }
}

function copyEmail() {
    const subject = document.getElementById("emailSubject").textContent;
    const body = document.getElementById("emailBody").textContent;
    navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`);
    alert("Copied to clipboard!");
}

// ─── UI HELPERS ───────────────────────────────────────────────────────────────
function showLoading() {
    document.getElementById("inputSection").classList.add("hidden");
    document.getElementById("loadingSection").classList.remove("hidden");
    document.getElementById("resultsSection").classList.add("hidden");
}

function showInput() {
    document.getElementById("inputSection").classList.remove("hidden");
    document.getElementById("loadingSection").classList.add("hidden");
    document.getElementById("resultsSection").classList.add("hidden");
}

function reset() {
    showInput();
    window.scrollTo({ top: 0, behavior: "smooth" });
}