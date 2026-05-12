const calendarGrid = document.getElementById("calendarGrid");

      const highestPriority = events[dateKey][0].priority;
      dot.classList.add(`priority-${highestPriority}`);

      dayBox.appendChild(dot);
    }

    dayBox.addEventListener("click", () => openModal(dateKey));

    calendarGrid.appendChild(dayBox);
  }
}

function openModal(dateKey) {
  const events = getEvents();
  const dayEvents = events[dateKey];

  if (!dayEvents) return;

  modalBody.innerHTML = `<h2>${dateKey}</h2>`;

  dayEvents.forEach(event => {
    modalBody.innerHTML += `
      <div class="event-card">
        <div class="event-title">${event.title}</div>
        <div class="event-type">Type: ${event.type}</div>
        <div class="event-priority">Priority: ${event.priority.toUpperCase()}</div>
        <div class="event-notes">${event.notes}</div>
      </div>
    `;
  });

  modal.classList.remove("hidden");
}

closeModal.onclick = () => {
  modal.classList.add("hidden");
};

window.onclick = (e) => {
  if (e.target === modal) {
    modal.classList.add("hidden");
  }
};

prevMonth.onclick = () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
};

nextMonth.onclick = () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
};

renderCalendar();
