
var qrType = document.getElementById("qrType");
var inputArea = document.getElementById("inputArea");
var errorMsg = document.getElementById("errorMsg");
var canvas = document.getElementById("qrCanvas");
var downloadBtn = document.getElementById("downloadBtn");
var recentList = document.getElementById("recentList");

function updateInputArea() {
  var type = qrType.value;
  var html = "";

  if (type === "url") {
    html = '<label for="urlInput">Website URL:</label>' +
           '<input type="text" id="urlInput" placeholder="https://example.com">';
  } else if (type === "text") {
    html = '<label for="textInput">Text:</label>' +
           '<input type="text" id="textInput" placeholder="Enter any text">';
  } else if (type === "email") {
    html = '<label for="emailInput">Email address:</label>' +
           '<input type="text" id="emailInput" placeholder="someone@example.com">' +
           '<label for="subjectInput">Subject (optional):</label>' +
           '<input type="text" id="subjectInput">';
  } else if (type === "phone") {
    html = '<label for="phoneInput">Phone number:</label>' +
           '<input type="text" id="phoneInput" placeholder="+91 9876543210">';
  } else if (type === "wifi") {
    html = '<label for="ssidInput">Wi-Fi Name (SSID):</label>' +
           '<input type="text" id="ssidInput">' +
           '<label for="wifiPassInput">Password:</label>' +
           '<input type="text" id="wifiPassInput">';
  }

  inputArea.innerHTML = html;
}

qrType.addEventListener("change", updateInputArea);

function buildQRData() {
  var type = qrType.value;

  if (type === "url") {
    var url = document.getElementById("urlInput").value.trim();
    if (url === "") return null;
    if (url.indexOf("http") !== 0) {
      url = "https://" + url;
    }
    return url;
  }

  if (type === "text") {
    var text = document.getElementById("textInput").value.trim();
    if (text === "") return null;
    return text;
  }

  if (type === "email") {
    var email = document.getElementById("emailInput").value.trim();
    var subject = document.getElementById("subjectInput").value.trim();
    if (email === "") return null;
    if (email.indexOf("@") === -1) {
      errorMsg.textContent = "Please enter a valid email address";
      return null;
    }
    var data = "mailto:" + email;
    if (subject !== "") {
      data += "?subject=" + encodeURIComponent(subject);
    }
    return data;
  }

  if (type === "phone") {
    var phone = document.getElementById("phoneInput").value.trim();
    if (phone === "") return null;
    if (phone.replace(/\D/g, "").length < 7) {
      errorMsg.textContent = "Please enter a valid phone number";
      return null;
    }
    return "tel:" + phone.replace(/\s/g, "");
  }

  if (type === "wifi") {
    var ssid = document.getElementById("ssidInput").value.trim();
    var pass = document.getElementById("wifiPassInput").value.trim();
    if (ssid === "") return null;
    return "WIFI:T:WPA;S:" + ssid + ";P:" + pass + ";;";
  }

  return null;
}

function getFieldValues(type) {
  if (type === "url") {
    return { url: document.getElementById("urlInput").value };
  }
  if (type === "text") {
    return { text: document.getElementById("textInput").value };
  }
  if (type === "email") {
    return {
      email: document.getElementById("emailInput").value,
      subject: document.getElementById("subjectInput").value
    };
  }
  if (type === "phone") {
    return { phone: document.getElementById("phoneInput").value };
  }
  if (type === "wifi") {
    return {
      ssid: document.getElementById("ssidInput").value,
      pass: document.getElementById("wifiPassInput").value
    };
  }
  return {};
}

function setFieldValues(type, fields) {
  if (type === "url") {
    document.getElementById("urlInput").value = fields.url || "";
  } else if (type === "text") {
    document.getElementById("textInput").value = fields.text || "";
  } else if (type === "email") {
    document.getElementById("emailInput").value = fields.email || "";
    document.getElementById("subjectInput").value = fields.subject || "";
  } else if (type === "phone") {
    document.getElementById("phoneInput").value = fields.phone || "";
  } else if (type === "wifi") {
    document.getElementById("ssidInput").value = fields.ssid || "";
    document.getElementById("wifiPassInput").value = fields.pass || "";
  }
}

function generateQR() {
  errorMsg.textContent = "";

  var type = qrType.value;
  var data = buildQRData();

  if (data === null) {
    if (errorMsg.textContent === "") {
      errorMsg.textContent = "Please fill in the required field(s)";
    }
    downloadBtn.disabled = true;
    return;
  }

  var size = parseInt(document.getElementById("qrSize").value);
  var fg = document.getElementById("fgColor").value;
  var bg = document.getElementById("bgColor").value;
  var ecLevel = document.getElementById("ecLevel").value;

  var qr;
  try {
    qr = qrcode(0, ecLevel);
    qr.addData(data);
    qr.make();
  } catch (e) {
    errorMsg.textContent = "This content is too long to fit in a QR code, try shortening it.";
    return;
  }

  drawQR(qr, size, fg, bg);
  downloadBtn.disabled = false;

  var fields = getFieldValues(type);
  saveToRecent(canvas.toDataURL("image/png"), data, type, fields, size, fg, bg, ecLevel);
}

// draw the qr code onto the canvas
function drawQR(qr, size, fg, bg) {
  var count = qr.getModuleCount();
  var cellSize = size / count;

  canvas.width = size;
  canvas.height = size;

  var ctx = canvas.getContext("2d");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = fg;

  for (var row = 0; row < count; row++) {
    for (var col = 0; col < count; col++) {
      if (qr.isDark(row, col)) {
        ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
      }
    }
  }
}

function downloadQR() {
  var link = document.createElement("a");
  link.download = "qrcode.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
}

//recents

var typeLabels = {
  url: "URL",
  text: "Text",
  email: "Email",
  phone: "Phone",
  wifi: "Wi-Fi"
};

function describeSettings(item) {
  return typeLabels[item.type] + " - " + item.size + "px, EC: " + item.ecLevel;
}

function saveToRecent(imgData, data, type, fields, size, fg, bg, ecLevel) {
  var recent = JSON.parse(localStorage.getItem("recentQR")) || [];

  recent = recent.filter(function (item) {
    return !(item.data === data && item.size === size && item.fg === fg &&
             item.bg === bg && item.ecLevel === ecLevel);
  });

  recent.unshift({
    img: imgData,
    data: data,
    type: type,
    fields: fields,
    size: size,
    fg: fg,
    bg: bg,
    ecLevel: ecLevel
  });

  if (recent.length > 8) {
    recent = recent.slice(0, 8);
  }

  localStorage.setItem("recentQR", JSON.stringify(recent));
  loadRecent();
}

function loadRecent() {
  var recent = JSON.parse(localStorage.getItem("recentQR")) || [];
  recentList.innerHTML = "";

  for (var i = 0; i < recent.length; i++) {
    var item = recent[i];

    var card = document.createElement("div");
    card.className = "recentItem";
    card.title = "Click to reuse this QR code";

    var img = document.createElement("img");
    img.src = item.img;

    var caption = document.createElement("p");
    caption.className = "recentCaption";
    caption.textContent = describeSettings(item);

    card.appendChild(img);
    card.appendChild(caption);

    //recent details
    card.addEventListener("click", (function (item) {
      return function () { restoreRecent(item); };
    })(item));

    recentList.appendChild(card);
  }
}

function restoreRecent(item) {
  qrType.value = item.type;
  updateInputArea();
  setFieldValues(item.type, item.fields);

  document.getElementById("qrSize").value = item.size;
  document.getElementById("fgColor").value = item.fg;
  document.getElementById("bgColor").value = item.bg;
  document.getElementById("ecLevel").value = item.ecLevel;

  generateQR();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function clearRecent() {
  localStorage.removeItem("recentQR");
  loadRecent();
}

updateInputArea();
loadRecent();
