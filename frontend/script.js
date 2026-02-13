const API = "http://localhost:3000/api";
let savedPassword = ""; // store password after verification

function createNote() {
  fetch(`${API}/notes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ note: document.getElementById("note").value })
  })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        document.getElementById("result").innerText = data.error;
        return;
      }

      const fullUrl = window.location.origin + data.url;

      document.getElementById("result").innerHTML = `
        <div class="mt-4 text-center space-y-2">
          <p class="font-semibold text-gray-700">URL</p>

          <p id="generatedUrl"
             class="text-sm text-blue-600 break-all bg-gray-100 p-2 rounded">
            ${fullUrl}
          </p>

          <button
            id="copyBtn"
            onclick="copyUrl()"
            class="bg-blue-600 text-white px-4 py-2 rounded-lg
                   hover:bg-blue-700 active:scale-95 transition">
            Copy URL
          </button>

          <p class="text-sm text-gray-700">
            <strong>Password:</strong> ${data.password}
          </p>
        </div>
      `;
    });
}

function copyUrl() {
  const urlText = document.getElementById("generatedUrl").innerText;
  const btn = document.getElementById("copyBtn");

  navigator.clipboard.writeText(urlText)
    .then(() => {
      btn.innerText = "Copied";
      btn.classList.remove("bg-blue-600", "hover:bg-blue-700");
      btn.classList.add("bg-green-600");
    })
    .catch(() => {
      btn.innerText = "Failed";
      btn.classList.add("bg-red-600");
    });
}



function viewNote() {
  const id = new URLSearchParams(window.location.search).get("id");
  const password = document.getElementById("password").value;

  fetch(`${API}/notes/${id}/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password })
  })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        noteText.innerText = data.error;
        return;
      }

      savedPassword = password;          // SAVE PASSWORD
      noteText.innerText = data.note;
    });
}

function summarize() {
  const id = new URLSearchParams(window.location.search).get("id");
  summary.innerText = "Summarizing...";

  fetch(`${API}/notes/${id}/summarize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      password: savedPassword           // SEND PASSWORD
    })
  })
    .then(res => res.json())
    .then(data => {
      summary.innerText = data.summary || data.error;
    })
    .catch(err => {
      console.error(err);
      summary.innerText = "Something went wrong";
    });
}
