function renderSimpleWeek(time) {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    let html = "<table>";
    html += "<tr><th>Day</th><th>Hours</th></tr>";
  
    days.forEach(day => {
      const value = (day === "Sat" || day === "Sun") ? "Closed" : time;
      html += "<tr><td>" + day + "</td><td>" + value + "</td></tr>";
    });
  
    html += "</table>";
    return html;
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
  
    if (value === "Mo-Fr 09:00-18:00") {
      messageEl.textContent = "Parsed simple weekday schedule.";
      outputEl.innerHTML = renderSimpleWeek("09:00-18:00");
      return;
    }
  
    messageEl.textContent = "Complex format detected → fallback to raw text";
    messageEl.className = "message fallback";
    outputEl.innerHTML = "<p><strong>Raw text:</strong> " + value + "</p>";
  }
  
  document.getElementById("parseBtn").addEventListener("click", handleParse);