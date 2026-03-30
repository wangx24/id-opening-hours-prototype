function renderSimpleWeek(schedule) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  let html = "<table>";
  html += "<tr><th>Day</th><th>Hours</th></tr>";

  days.forEach(day => {
    html += "<tr><td>" + day + "</td><td>" + (schedule[day] || "Closed") + "</td></tr>";
  });

  html += "</table>";
  return html;
}

function parseSimpleOpeningHours(value) {
  const dayMap = { Mo: "Mon", Tu: "Tue", We: "Wed", Th: "Thu", Fr: "Fri", Sa: "Sat", Su: "Sun" };
  const dayOrder = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
  const schedule = {};
  const rules = value.split(";").map(rule => rule.trim()).filter(Boolean);

  if (!rules.length) {
    return null;
  }

  for (const rule of rules) {
    const singleDayMatch = rule.match(/^(Mo|Tu|We|Th|Fr|Sa|Su)\s+(off|\d{2}:\d{2}-\d{2}:\d{2})$/);
    if (singleDayMatch) {
      const day = dayMap[singleDayMatch[1]];
      const val = singleDayMatch[2] === "off" ? "Closed" : singleDayMatch[2];
      schedule[day] = val;
      continue;
    }

    const rangeMatch = rule.match(/^(Mo|Tu|We|Th|Fr|Sa|Su)-(Mo|Tu|We|Th|Fr|Sa|Su)\s+(\d{2}:\d{2}-\d{2}:\d{2})$/);
    if (!rangeMatch) {
      return null;
    }

    const startIdx = dayOrder.indexOf(rangeMatch[1]);
    const endIdx = dayOrder.indexOf(rangeMatch[2]);
    if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) {
      return null;
    }

    const time = rangeMatch[3];
    for (let i = startIdx; i <= endIdx; i++) {
      schedule[dayMap[dayOrder[i]]] = time;
    }
  }

  return schedule;
}

function renderInterpretation(schedule) {
  const dayGroups = [
    { label: "Weekdays", days: ["Mon", "Tue", "Wed", "Thu", "Fri"] },
    { label: "Saturday", days: ["Sat"] },
    { label: "Sunday", days: ["Sun"] }
  ];

  let html = "<div><p><strong>Parsed successfully</strong></p><ul>";
  dayGroups.forEach(group => {
    const firstValue = schedule[group.days[0]] || "Closed";
    const sameAcrossGroup = group.days.every(day => (schedule[day] || "Closed") === firstValue);

    if (sameAcrossGroup) {
      html += "<li>" + group.label + ": " + firstValue + "</li>";
      return;
    }

    group.days.forEach(day => {
      html += "<li>" + day + ": " + (schedule[day] || "Closed") + "</li>";
    });
  });
  html += "</ul></div>";

  return html;
}

function renderStructuredEditor(schedule) {
  const weekdayValues = ["Mon", "Tue", "Wed", "Thu", "Fri"].map(day => schedule[day] || "Closed");
  const sameWeekdayValue = weekdayValues.every(value => value === weekdayValues[0]);
  const weekdaysValue = sameWeekdayValue && weekdayValues[0] !== "Closed" ? weekdayValues[0] : "";
  const saturdayValue = schedule.Sat && schedule.Sat !== "Closed" ? schedule.Sat : "";
  const sundayClosed = !schedule.Sun || schedule.Sun === "Closed";
  const sundayValue = sundayClosed ? "" : schedule.Sun;

  let html = "<div>";
  html += "<h3>Structured editor</h3>";
  html += "<p>Edit common fields and re-apply.</p>";
  html += "<p><label>Weekdays (Mon-Fri): <input id=\"editWeekdays\" type=\"text\" placeholder=\"09:00-18:00\" value=\"" + weekdaysValue + "\"></label></p>";
  html += "<p><label>Saturday: <input id=\"editSaturday\" type=\"text\" placeholder=\"10:00-14:00\" value=\"" + saturdayValue + "\"></label></p>";
  html += "<p><label><input id=\"editSundayClosed\" type=\"checkbox\"" + (sundayClosed ? " checked" : "") + "> Sunday closed</label></p>";
  html += "<p><label>Sunday hours: <input id=\"editSunday\" type=\"text\" placeholder=\"10:00-14:00\" value=\"" + sundayValue + "\"" + (sundayClosed ? " disabled" : "") + "></label></p>";
  html += "<p id=\"structuredEditorError\" class=\"fallback\"></p>";
  html += "<p><button id=\"applyStructuredBtn\" type=\"button\">Apply structured edit</button></p>";
  html += "</div>";

  return html;
}

function isValidSimpleTimeRange(value) {
  const match = value.match(/^(\d{2}):(\d{2})-(\d{2}):(\d{2})$/);
  if (!match) {
    return false;
  }

  const startHour = Number(match[1]);
  const startMinute = Number(match[2]);
  const endHour = Number(match[3]);
  const endMinute = Number(match[4]);

  if (startHour < 0 || startHour > 23 || endHour < 0 || endHour > 23) {
    return false;
  }
  if (startMinute < 0 || startMinute > 59 || endMinute < 0 || endMinute > 59) {
    return false;
  }

  return true;
}

function getStructuredEditorData() {
  const weekdays = document.getElementById("editWeekdays").value.trim();
  const saturday = document.getElementById("editSaturday").value.trim();
  const sundayClosed = document.getElementById("editSundayClosed").checked;
  const sunday = document.getElementById("editSunday").value.trim();
  const errors = [];

  if (weekdays && !isValidSimpleTimeRange(weekdays)) {
    errors.push("Weekdays must use HH:MM-HH:MM (00-23 for hours, 00-59 for minutes).");
  }
  if (saturday && !isValidSimpleTimeRange(saturday)) {
    errors.push("Saturday must use HH:MM-HH:MM (00-23 for hours, 00-59 for minutes).");
  }
  if (!sundayClosed && sunday && !isValidSimpleTimeRange(sunday)) {
    errors.push("Sunday must use HH:MM-HH:MM (00-23 for hours, 00-59 for minutes).");
  }

  return {
    weekdays,
    saturday,
    sundayClosed,
    sunday,
    errors
  };
}

function buildSimpleRawFromStructuredEditor(data) {
  const rules = [];

  if (data.weekdays) {
    rules.push("Mo-Fr " + data.weekdays);
  }
  if (data.saturday) {
    rules.push("Sa " + data.saturday);
  }
  if (data.sundayClosed) {
    rules.push("Su off");
  } else if (data.sunday) {
    rules.push("Su " + data.sunday);
  }

  return rules.join("; ");
}
  
  function handleParse() {
    const inputEl = document.getElementById("input");
    const messageEl = document.getElementById("message");
    const outputEl = document.getElementById("output");
  
    const value = inputEl.value.trim();
  
    console.log("Parse clicked. Input =", value);
  
    messageEl.textContent = "";
    messageEl.className = "message";
    outputEl.innerHTML = "";
  
    if (!value) {
      messageEl.textContent = "Please enter an opening_hours string.";
      return;
    }
  
    const schedule = parseSimpleOpeningHours(value);
    if (schedule) {
      messageEl.textContent = "";
      outputEl.innerHTML = renderInterpretation(schedule) + renderSimpleWeek(schedule) + renderStructuredEditor(schedule);
      return;
    }
  
    messageEl.textContent = "Complex format detected → fallback to raw text";
    messageEl.className = "message fallback";
    outputEl.innerHTML = "<p><strong>Raw text:</strong> " + value + "</p>";
  }
  
  document.getElementById("parseBtn").addEventListener("click", handleParse);
  document.getElementById("output").addEventListener("click", function(event) {
    if (event.target && event.target.id === "applyStructuredBtn") {
      const errorEl = document.getElementById("structuredEditorError");
      const inputEl = document.getElementById("input");
      const data = getStructuredEditorData();
      if (errorEl) {
        errorEl.textContent = "";
      }
      if (data.errors.length) {
        if (errorEl) {
          errorEl.textContent = data.errors[0];
        }
        return;
      }

      const updatedRaw = buildSimpleRawFromStructuredEditor(data);
      if (!updatedRaw) {
        return;
      }
      inputEl.value = updatedRaw;
      handleParse();
    }
  });

  document.getElementById("output").addEventListener("change", function(event) {
    if (event.target && event.target.id === "editSundayClosed") {
      const sundayInput = document.getElementById("editSunday");
      const isClosed = event.target.checked;
      sundayInput.disabled = isClosed;
      if (isClosed) {
        sundayInput.value = "";
      }
    }
  });