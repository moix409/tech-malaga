const events = [
  {
    id: "ai-meetup",
    title: "Málaga AI Meetup",
    category: "Inteligencia artificial",
    day: 12,
    time: "18:30",
    venue: "La Térmica, Málaga",
    format: "Presencial",
  },
  {
    id: "frontend-lab",
    title: "Frontend Lab: interfaces que importan",
    category: "Desarrollo",
    day: 15,
    time: "10:00",
    venue: "Polo Nacional de Contenidos Digitales",
    format: "Presencial",
  },
  {
    id: "design-systems",
    title: "Design Systems sin drama",
    category: "Diseño",
    day: 19,
    time: "18:00",
    venue: "Online",
    format: "Online",
  },
  {
    id: "startup-night",
    title: "Startup Night Costa del Sol",
    category: "Startups",
    day: 24,
    time: "19:00",
    venue: "Distrito Digital, Málaga",
    format: "Presencial",
  },
  {
    id: "open-source",
    title: "Open Source & Pizza",
    category: "Desarrollo",
    day: 27,
    time: "19:30",
    venue: "La Fábrica, Málaga",
    format: "Presencial",
  },
];

const root = document.documentElement;
const themeToggle = document.querySelector(".theme-toggle");
const themeLabel = document.querySelector(".theme-label");
const themeColor = document.querySelector('meta[name="theme-color"]');
const systemTheme = window.matchMedia("(prefers-color-scheme: light)");
let savedTheme = null;

try {
  savedTheme = localStorage.getItem("tech-malaga-theme");
} catch {
  savedTheme = null;
}

function setTheme(theme, remember = false) {
  const isLight = theme === "light";
  root.dataset.theme = isLight ? "light" : "dark";
  themeToggle.setAttribute("aria-pressed", String(isLight));
  themeToggle.setAttribute("aria-label", `Cambiar al tema ${isLight ? "oscuro" : "claro"}`);
  themeLabel.textContent = isLight ? "Claro" : "Oscuro";
  themeColor.content = isLight ? "#f7f5f0" : "#101a30";
  if (remember) {
    try {
      localStorage.setItem("tech-malaga-theme", isLight ? "light" : "dark");
      savedTheme = isLight ? "light" : "dark";
    } catch {
      savedTheme = isLight ? "light" : "dark";
    }
  }
}

setTheme(savedTheme || (systemTheme.matches ? "light" : "dark"));
themeToggle.addEventListener("click", () => {
  setTheme(root.dataset.theme === "dark" ? "light" : "dark", true);
});
systemTheme.addEventListener("change", (event) => {
  if (!savedTheme) setTheme(event.matches ? "light" : "dark");
});

const calendarDays = document.querySelector("#calendar-days");
const calendarMonth = document.querySelector("#calendar-month");
const eventList = document.querySelector("#event-list");
const emptyState = document.querySelector("#empty-state");
const resultsCount = document.querySelector("#results-count");
const monthNames = new Intl.DateTimeFormat("es", { month: "long" });
let displayedMonth = new Date(2026, 10, 1);
let selectedDate = null;
let selectedCategory = "Todas";

function renderCalendar() {
  const year = displayedMonth.getFullYear();
  const month = displayedMonth.getMonth();
  calendarMonth.innerHTML = `${monthNames.format(displayedMonth)} <span>${year}</span>`;
  calendarDays.replaceChildren();

  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingDays = (firstDay.getDay() + 6) % 7;
  const cells = Math.ceil((leadingDays + daysInMonth) / 7) * 7;

  for (let index = 0; index < cells; index += 1) {
    const dayNumber = index - leadingDays + 1;
    const dayDate = new Date(year, month, dayNumber);
    const isInMonth = dayNumber > 0 && dayNumber <= daysInMonth;
    const dayEvents = isInMonth && year === 2026 && month === 10
      ? events.filter((event) => event.day === dayNumber)
      : [];
    const button = document.createElement("button");
    button.type = "button";
    button.className = "calendar-day";
    button.textContent = String(dayDate.getDate());
    button.setAttribute("aria-label", new Intl.DateTimeFormat("es", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(dayDate));

    if (!isInMonth) {
      button.classList.add("is-outside");
      button.disabled = true;
      button.setAttribute("aria-hidden", "true");
    } else {
      if (dayEvents.length) {
        button.classList.add("has-event");
        button.setAttribute("aria-label", `${button.getAttribute("aria-label")}, ${dayEvents.length} eventos de ejemplo`);
      }
      if (selectedDate && selectedDate.getTime() === dayDate.getTime()) {
        button.classList.add("is-selected");
        button.setAttribute("aria-pressed", "true");
      } else {
        button.setAttribute("aria-pressed", "false");
      }
      button.addEventListener("click", () => {
        selectedDate = dayDate;
        renderCalendar();
        renderEvents();
      });
    }
    calendarDays.append(button);
  }

  calendarDays.setAttribute("aria-label", `${monthNames.format(displayedMonth)} ${year}`);
}

function renderEvents() {
  const visibleEvents = events.filter((event) => {
    const matchesCategory = selectedCategory === "Todas" || event.category === selectedCategory;
    const matchesMonth = displayedMonth.getFullYear() === 2026 && displayedMonth.getMonth() === 10;
    const matchesDate = !selectedDate
      || (selectedDate.getFullYear() === 2026
        && selectedDate.getMonth() === 10
        && event.day === selectedDate.getDate());
    return matchesMonth && matchesCategory && matchesDate;
  });

  eventList.replaceChildren();
  resultsCount.textContent = `${String(visibleEvents.length).padStart(2, "0")} ${visibleEvents.length === 1 ? "EVENTO" : "EVENTOS"}`;
  emptyState.hidden = visibleEvents.length > 0;

  visibleEvents.forEach((event) => {
    const card = document.createElement("article");
    card.className = "event-card";

    const date = document.createElement("div");
    date.className = "event-date";
    date.innerHTML = `<strong>${String(event.day).padStart(2, "0")}</strong><span>nov</span>`;

    const copy = document.createElement("div");
    copy.className = "event-card-copy";
    const category = document.createElement("p");
    category.className = "event-card-category";
    category.textContent = event.category.toUpperCase();
    const title = document.createElement("h3");
    title.textContent = event.title;
    const meta = document.createElement("p");
    meta.className = "event-card-meta";
    meta.innerHTML = `<span><span aria-hidden="true">◷</span> ${event.time}</span><span><span aria-hidden="true">⌖</span> ${event.venue}</span><span>${event.format}</span>`;
    copy.append(category, title, meta);

    const registration = document.createElement("a");
    registration.className = "text-link demo-registration";
    registration.href = "#inscripcion";
    registration.dataset.eventTitle = event.title;
    registration.innerHTML = 'Inscripción <span aria-hidden="true">↗</span>';
    card.append(date, copy, registration);
    eventList.append(card);
  });
}

document.querySelectorAll(".filter-chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    selectedCategory = chip.dataset.category;
    document.querySelectorAll(".filter-chip").forEach((item) => {
      const isActive = item === chip;
      item.classList.toggle("is-active", isActive);
      item.setAttribute("aria-pressed", String(isActive));
    });
    renderEvents();
  });
});

document.querySelector("#previous-month").addEventListener("click", () => {
  displayedMonth = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() - 1, 1);
  renderCalendar();
  renderEvents();
});
document.querySelector("#next-month").addEventListener("click", () => {
  displayedMonth = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() + 1, 1);
  renderCalendar();
  renderEvents();
});
document.querySelector("#clear-date").addEventListener("click", () => {
  selectedDate = null;
  displayedMonth = new Date(2026, 10, 1);
  renderCalendar();
  renderEvents();
});

const registrationDialog = document.querySelector("#registration-dialog");
document.addEventListener("click", (event) => {
  const link = event.target.closest(".demo-registration");
  if (!link) return;
  event.preventDefault();
  document.querySelector("#dialog-message").textContent =
    `«${link.dataset.eventTitle}» es un evento de ejemplo. No existe una inscripción real.`;
  registrationDialog.showModal();
});
document.querySelector(".dialog-ok").addEventListener("click", () => registrationDialog.close());
registrationDialog.addEventListener("click", (event) => {
  if (event.target === registrationDialog) registrationDialog.close();
});

renderCalendar();
renderEvents();
