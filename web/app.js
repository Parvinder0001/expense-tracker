// Expense Tracker web app – same features as the Python CLI (incl. Buy list)
const CATS = {Food:"#e07a3f",Travel:"#2a7de1",Shopping:"#b5489b",Bills:"#5b6b8c",Health:"#d64550",Education:"#0e9f7e",Other:"#a38f5c"};
const KEY = "expenses";
const BKEY = "buylist";
const SKEY = "settings";
const PRIORITIES = ["High", "Medium", "Low"];
const PAYMENT_METHODS = ["UPI", "Cash", "Debit Card", "Credit Card", "Bank Transfer", "Other"];
const $ = (id) => document.getElementById(id);
const DEFAULT_SETTINGS = {theme:"system", currency:"INR", paymentMethod:"UPI", monthlyBudget:0};
let settings = loadSettings();
let money = makeMoneyFormatter();
const iso = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
const TODAY = iso(new Date());
const THIS_MONTH = TODAY.slice(0, 7);

let expenses = load();
let month = THIS_MONTH;   // "YYYY-MM" or null = all time
let catFilter = null;
let buylist = loadBuy();
let tab = "exp";          // "exp" or "buy"
let lastDeleted = null, toastTimer;

function load() { try { return (JSON.parse(localStorage.getItem(KEY)) || []).map((e) => ({...e, paymentMethod:e.paymentMethod || "Other", tags:Array.isArray(e.tags) ? e.tags : []})); } catch { return []; } }
function save() { try { localStorage.setItem(KEY, JSON.stringify(expenses)); } catch {} }
function loadBuy() { try { return JSON.parse(localStorage.getItem(BKEY)) || []; } catch { return []; } }
function saveBuy() { try { localStorage.setItem(BKEY, JSON.stringify(buylist)); } catch {} }
function loadSettings() { try { return {...DEFAULT_SETTINGS, ...(JSON.parse(localStorage.getItem(SKEY)) || {})}; } catch { return {...DEFAULT_SETTINGS}; } }
function saveSettings() { localStorage.setItem(SKEY, JSON.stringify(settings)); }
function makeMoneyFormatter() {
  const locale = {INR:"en-IN", USD:"en-US", EUR:"de-DE", GBP:"en-GB"}[settings.currency] || "en-IN";
  return new Intl.NumberFormat(locale, {style:"currency", currency:settings.currency, minimumFractionDigits:2});
}
function nextId() { return expenses.reduce((m, e) => Math.max(m, e.id), 0) + 1; }

/* ---------- features ---------- */
function addExpense(title, amount, category, date, paymentMethod="Other", tags=[]) { expenses.push({id:nextId(), title, amount, category, date, paymentMethod, tags}); save(); }
function removeExpense(id) {
  const e = expenses.find((x) => x.id === id);
  expenses = expenses.filter((x) => x.id !== id); save();
  lastDeleted = e; toast("Expense deleted", "Undo", () => { expenses.push(lastDeleted); save(); render(); });
}
const inScope = () => expenses.filter((e) => !month || e.date.startsWith(month));
function visible() {
  const q = $("search").value.trim().toLowerCase();
  return inScope().filter((e) => (!catFilter || e.category === catFilter) && (!q || e.title.toLowerCase().includes(q) || e.paymentMethod.toLowerCase().includes(q) || e.tags.some((tag) => tag.toLowerCase().includes(q))))
    .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);
}
function exportCSV() {
  const q = (v) => `"${String(v).replace(/"/g, '""')}"`;
  const rows = [["ID","Title","Amount","Category","Date","Payment Method","Tags"], ...visible().map((e) => [e.id, e.title, e.amount, e.category, e.date, e.paymentMethod || "Other", (e.tags || []).join("; ")])];
  const a = Object.assign(document.createElement("a"), {
    href: URL.createObjectURL(new Blob([rows.map((r) => r.map(q).join(",")).join("\n")], {type:"text/csv"})),
    download: "expenses_export.csv"});
  a.click(); URL.revokeObjectURL(a.href);
}
function sample() {
  const d = (n) => { const x = new Date(); x.setDate(x.getDate() - n); return iso(x); };
  [["Lunch at canteen",150,"Food",0],["Metro card recharge",500,"Travel",1],["Data structures book",640,"Education",2],
   ["Mobile recharge",299,"Bills",3],["Pizza with friends",420,"Food",4],["T-shirt",799,"Shopping",6],
   ["Pharmacy",180,"Health",8],["Auto fare",90,"Travel",9],["Electricity bill",1250,"Bills",11]]
    .forEach(([t, a, c, n]) => addExpense(t, a, c, d(n)));
  render();
}

/* ---------- buy list ---------- */
const nextBuyId = () => buylist.reduce((m, x) => Math.max(m, x.id), 0) + 1;
function addBuyItem(name, price, priority, category) { buylist.push({id: nextBuyId(), name, price, priority, category}); saveBuy(); }
function removeBuyItem(id) {
  const item = buylist.find((x) => x.id === id);
  buylist = buylist.filter((x) => x.id !== id); saveBuy(); render();
  toast("Removed from buy list", "Undo", () => { buylist.push(item); saveBuy(); render(); });
}
function markBought(id) {
  const item = buylist.find((x) => x.id === id);
  const expId = nextId();
  expenses.push({id: expId, title: item.name, amount: item.price, category: item.category, date: TODAY, paymentMethod:"Other", tags:[]});
  buylist = buylist.filter((x) => x.id !== id); save(); saveBuy(); render();
  toast("Bought! Added to your expenses", "Undo", () => {
    expenses = expenses.filter((x) => x.id !== expId); buylist.push(item); save(); saveBuy(); render();
  });
}
const sortedBuy = () => [...buylist].sort((a, b) => PRIORITIES.indexOf(a.priority) - PRIORITIES.indexOf(b.priority) || a.price - b.price);

function renderBuy() {
  const total = buylist.reduce((s, x) => s + x.price, 0);
  $("buyTotal").textContent = money.format(total);
  const high = buylist.filter((x) => x.priority === "High").length;
  $("buyNote").textContent = buylist.length
    ? `${buylist.length} item${buylist.length > 1 ? "s" : ""} to buy${high ? `, ${high} high priority` : ""}.` : "Nothing planned yet.";
  $("buyCount").hidden = !buylist.length; $("buyCount").textContent = buylist.length;

  const list = $("buyList"); list.replaceChildren();
  if (!buylist.length) {
    const box = el("div", "empty");
    const a = el("button", "btn solid", "Add an item"); a.onclick = openBuy;
    box.append(el("h3", "", "Your buy list is empty"), el("p", "", "Note down things you plan to buy, so you can save up for them."), a);
    list.appendChild(box); return;
  }
  sortedBuy().forEach((x) => {
    const row = el("div", "item"), done = el("button", "check"), t = el("div"), del = el("button", "del");
    done.setAttribute("aria-label", `Mark ${x.name} as bought`); done.title = "Mark as bought"; done.textContent = "✓"; done.onclick = () => markBought(x.id);
    const tag = el("span", "tag", x.priority); tag.dataset.p = x.priority;
    const meta = el("span", "c", x.category + " · "); meta.appendChild(tag);
    t.append(el("span", "t", x.name), meta);
    del.innerHTML = svgTrash; del.setAttribute("aria-label", `Remove ${x.name}`); del.onclick = () => removeBuyItem(x.id);
    row.append(done, t, el("span", "amt", money.format(x.price)), del); list.appendChild(row);
  });
}

/* ---------- rendering ---------- */
const svgTrash = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3"/></svg>';
const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
const dayLabel = (s) => s === TODAY ? "Today" : s === iso(new Date(Date.now() - 864e5)) ? "Yesterday"
  : new Date(s + "T00:00").toLocaleDateString("en-IN", {weekday:"short", day:"numeric", month:"short"});

function renderExpenses() {
  const scope = inScope();
  const total = scope.reduce((s, e) => s + e.amount, 0);
  const label = month ? new Date(month + "-01T00:00").toLocaleDateString("en-IN", {month:"long", year:"numeric"}) : "All time";
  $("periodLabel").textContent = label;
  $("prev").disabled = !month; $("next").disabled = !month || month >= THIS_MONTH;
  $("allToggle").textContent = month ? "Show all time" : "Back to this month";
  $("total").textContent = money.format(total);
  const budget = Number(settings.monthlyBudget) || 0;
  $("budgetCard").hidden = !month || budget <= 0;
  if (budget > 0 && month) {
    const progress = Math.min(100, total / budget * 100);
    $("budgetLabel").textContent = money.format(total) + " / " + money.format(budget);
    $("budgetProgress").style.width = progress + "%";
    $("budgetProgress").classList.toggle("over", total > budget);
    $("budgetNote").textContent = total > budget ? money.format(total - budget) + " over budget" : money.format(budget - total) + " remaining";
  }

  const by = {};
  scope.forEach((e) => by[e.category] = (by[e.category] || 0) + e.amount);
  const rows = Object.entries(by).sort((a, b) => b[1] - a[1]);
  $("note").textContent = scope.length
    ? `${scope.length} expense${scope.length > 1 ? "s" : ""}, mostly on ${rows[0][0].toLowerCase()}.` : "Nothing spent yet.";

  const split = $("split"), legend = $("legend");
  split.replaceChildren(); legend.replaceChildren();
  rows.forEach(([c, v]) => {
    const seg = el("button"); seg.style.cssText = `flex:${v} 1 0;background:${CATS[c]}`; seg.title = `${c}: ${money.format(v)}`;
    seg.setAttribute("aria-label", `Filter by ${c}`); seg.onclick = () => setCat(c); split.appendChild(seg);
    const li = el("li"), b = el("button"); b.setAttribute("aria-pressed", catFilter === c);
    const dot = el("span", "dot"); dot.style.background = CATS[c];
    b.append(dot, el("span", "", c), el("span", "pct", Math.round(v / total * 100) + "%"), el("span", "amt", money.format(v)));
    b.onclick = () => setCat(c); li.appendChild(b); legend.appendChild(li);
  });
  $("clearCat").hidden = !catFilter; $("clearCat").textContent = catFilter ? `${catFilter}  ✕` : "";

  const list = $("list"), items = visible(); list.replaceChildren();
  if (!items.length) {
    const box = el("div", "empty");
    box.append(el("h3", "", expenses.length ? "No matching expenses" : "No expenses yet"),
      el("p", "", expenses.length ? "Try another month, category or search." : "Add your first expense to see where your money goes."));
    if (!expenses.length) {
      const a = el("button", "btn solid", "Add expense"); a.onclick = openAdd;
      const s = el("button", "btn ghost", "Load sample data"); s.onclick = sample; box.append(a, s);
    }
    list.appendChild(box); return;
  }
  let last = "";
  items.forEach((e) => {
    if (e.date !== last) { last = e.date; const sum = items.filter((x) => x.date === e.date).reduce((s, x) => s + x.amount, 0);
      const h = el("div", "day"); h.append(el("span", "", dayLabel(e.date)), el("span", "", money.format(sum))); list.appendChild(h); }
    const row = el("div", "item"), dot = el("span", "dot"), t = el("div"), del = el("button", "del");
    dot.style.background = CATS[e.category];
    const metadata = [e.category, e.paymentMethod || "Other", ...(e.tags || []).map((tag) => `#${tag}`)].join(" · ");
    t.append(el("span", "t", e.title), el("span", "c", metadata));
    del.innerHTML = svgTrash; del.setAttribute("aria-label", `Delete ${e.title}`); del.onclick = () => { removeExpense(e.id); render(); };
    row.append(dot, t, el("span", "amt", money.format(e.amount)), del); list.appendChild(row);
  });
}
function render() { renderExpenses(); renderBuy(); syncTab(); }
function setTab(t) { tab = t; render(); }
function syncTab() {
  const buy = tab === "buy", settingsTab = tab === "settings";
  $("expView").hidden = buy || settingsTab; $("buyView").hidden = !buy; $("settingsView").hidden = !settingsTab;
  $("tabExp").setAttribute("aria-selected", tab === "exp"); $("tabBuy").setAttribute("aria-selected", buy); $("tabSettings").setAttribute("aria-selected", settingsTab);
  $("exportBtn").hidden = buy || settingsTab;
  $("openAdd").hidden = settingsTab; $("fab").hidden = settingsTab;
  $("openAdd").textContent = buy ? "Add to buy list" : "Add expense";
  $("fab").setAttribute("aria-label", buy ? "Add to buy list" : "Add expense");
}
function setCat(c) { catFilter = catFilter === c ? null : c; render(); }
function shift(n) { const [y, m] = month.split("-").map(Number); const d = new Date(y, m - 1 + n, 1);
  month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; catFilter = null; render(); }

/* ---------- dialog, toast, events ---------- */
function toast(msg, action, fn) {
  const t = $("toast"); t.replaceChildren(el("span", "", msg));
  if (action) { const b = el("button", "", action); b.onclick = () => { fn(); t.classList.remove("show"); }; t.appendChild(b); }
  t.classList.add("show"); clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove("show"), 4000);
}
function openAdd() { $("form").reset(); $("date").value = TODAY; $("err").textContent = ""; $("cats").querySelector("input").checked = true; $("paymentMethod").value = settings.paymentMethod; $("dlg").showModal(); $("title").focus(); }

function openBuy() { $("buyForm").reset(); $("buyErr").textContent = ""; $("buyPri").querySelector("input[value=Medium]").checked = true;
  $("buyCats").querySelector("input").checked = true; $("buyDlg").showModal(); $("buyName").focus(); }
const openCurrent = () => tab === "buy" ? openBuy() : openAdd();

$("buyPri").innerHTML = PRIORITIES.map((p, i) =>
  `<label><input type="radio" name="pri" value="${p}"${i === 1 ? " checked" : ""}><span>${p}</span></label>`).join("");
$("buyCats").innerHTML = Object.entries(CATS).map(([c, col], i) =>
  `<label><input type="radio" name="bcat" value="${c}"${i ? "" : " checked"}><span><i class="dot" style="background:${col}"></i>${c}</span></label>`).join("");
$("buyForm").addEventListener("submit", (ev) => {
  ev.preventDefault();
  const name = $("buyName").value.trim(), price = parseFloat($("buyPrice").value);
  const err = !name ? "Enter what you want to buy." : !(price > 0) ? "Enter an estimated cost greater than zero." : "";
  $("buyErr").textContent = err; if (err) return;
  addBuyItem(name, Math.round(price * 100) / 100, document.querySelector("input[name=pri]:checked").value,
    document.querySelector("input[name=bcat]:checked").value);
  $("buyDlg").close(); render(); toast("Added to buy list");
});
$("buyCancel").onclick = () => $("buyDlg").close();
$("buyDlg").addEventListener("click", (e) => { if (e.target === $("buyDlg")) $("buyDlg").close(); });
$("tabExp").onclick = () => setTab("exp"); $("tabBuy").onclick = () => setTab("buy");
$("tabSettings").onclick = () => setTab("settings");
["themeSetting", "currencySetting", "paymentSetting", "budgetSetting"].forEach((id) => {
  $(id).addEventListener("change", () => {
    if (id === "budgetSetting" && Number($(id).value) < 0) { $(id).value = 0; }
    settings.theme = $("themeSetting").value;
    settings.currency = $("currencySetting").value;
    settings.paymentMethod = $("paymentSetting").value;
    settings.monthlyBudget = Math.max(0, Number($("budgetSetting").value) || 0);
    saveSettings();
    document.documentElement.dataset.theme = settings.theme;
    money = makeMoneyFormatter();
    $("settingsSaved").textContent = "Settings saved on this device.";
    render();
  });
});
$("backupBtn").onclick = () => {
  const backup = {version:1, exportedAt:new Date().toISOString(), expenses, buylist, settings};
  const url = URL.createObjectURL(new Blob([JSON.stringify(backup, null, 2)], {type:"application/json"}));
  const link = Object.assign(document.createElement("a"), {href:url, download:"expense-tracker-backup.json"});
  link.click(); URL.revokeObjectURL(url);
};

$("cats").innerHTML = Object.entries(CATS).map(([c, col], i) =>
  `<label><input type="radio" name="cat" value="${c}"${i ? "" : " checked"}><span><i class="dot" style="background:${col}"></i>${c}</span></label>`).join("");
$("form").addEventListener("submit", (ev) => {
  ev.preventDefault();
  const title = $("title").value.trim(), amount = parseFloat($("amount").value), date = $("date").value;
  const err = !title ? "Enter what the expense was for." : !(amount > 0) ? "Enter an amount greater than zero." : !date ? "Choose a date." : "";
  $("err").textContent = err; if (err) return;
  const tags = [...new Set($("tags").value.split(",").map((tag) => tag.trim()).filter(Boolean))];
  addExpense(title, Math.round(amount * 100) / 100, document.querySelector("input[name=cat]:checked").value, date, $("paymentMethod").value, tags);
  month = date.slice(0, 7) > THIS_MONTH ? month : (month ? date.slice(0, 7) : null);
  $("dlg").close(); render(); toast("Expense added");
});
$("cancel").onclick = () => $("dlg").close();
$("dlg").addEventListener("click", (e) => { if (e.target === $("dlg")) $("dlg").close(); });
["openAdd", "fab"].forEach((id) => $(id).onclick = openCurrent);
$("prev").onclick = () => shift(-1); $("next").onclick = () => shift(1);
$("allToggle").onclick = () => { month = month ? null : THIS_MONTH; catFilter = null; render(); };
$("clearCat").onclick = () => setCat(catFilter);
$("search").addEventListener("input", render);
$("exportBtn").onclick = exportCSV;
document.documentElement.dataset.theme = settings.theme;
$("themeSetting").value = settings.theme;
$("currencySetting").value = settings.currency;
$("paymentSetting").value = settings.paymentMethod;
$("budgetSetting").value = settings.monthlyBudget || "";
render();
