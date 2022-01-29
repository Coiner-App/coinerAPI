const xhttp = new XMLHttpRequest();
const note = document.getElementsByClassName("note")[0];

tsParticles
  .loadJSON("tsparticles", "../amogus.json")
  .then((container) => {
    console.log("callback - tsparticles config loaded");
  })
  .catch((error) => {
    console.error(error);
  });

function test() {
  const email = document.getElementById("username").value;
  console.log(email)
}

async function initregister() {
  const displayname = await document.getElementById("displayname").value;
  const username = await document.getElementById("username").value;
  const email = await document.getElementById("email").value;
  const password = await document.getElementById("password").value;
  if (!username) return alert("Please enter a username!")
  if (!email) return alert("Please enter an email!")
  if (!password) return alert("Please enter a password!");
  try {
    const params = new URLSearchParams();
    if (displayname) params.append("displayname", displayname)
    params.append("username", username);
    params.append("email", email);
    params.append("password", password)
    const response = await axios.post('/auth/register', params).catch((e) => {
      note.innerHTML = e.response.data.error;
      note.style.color = "#DE1212";
      return;
    });
    if (response.status == 200) {
      note.innerHTML = "An email has been sent to your inbox to verify your account.";
      note.style.color = "#0F9D58";
    }
  } catch (error) {
    console.error(error);
  }
  // xhrF("/auth", "POST", `email=${email}`).then(() => {
  //   alert(`Email should have been sent to your email ${email}. The code expires in 30 minutes.`)
  //   note.innerHTML = `Email should have been sent to your email ${email}. The code expires in 30 minutes.`;
  //   note.style.color = "green";
  // });
}

function togglePass(icon) {
  const password = document.getElementById("password");
  // toggle the type attribute
  const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
  password.setAttribute('type', type);
  // toggle the eye / eye slash icon
  icon.classList.toggle('fa-eye-slash');
}

// function xhrF(url, type = 'GET', body = null) {
//   return new Promise((resolve, reject) => {
//     const xhr = xhttp;
//     xhr.open(type, url);
//     if (body) xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
//     xhr.onload = function () {
//       if ([422, 400, 404].includes(xhr.status)) {
//         //alert("Something went wrong.\nError:\n" + JSON.parse(xhr.responseText).error);
//         note.innerHTML = JSON.parse(xhr.responseText).error;
//         note.style.color = "#DE1212";
//         reject(JSON.parse(xhr.responseText).error)
//       } else if (xhr.status == 429) {
//         note.innerHTML = JSON.parse(xhr.responseText).error;
//         note.style.color = "#DE1212";
//         reject(JSON.parse(xhr.responseText).error)
//       } else if (xhr.status == 401) {
//         reject("Unauthorized")
//         window.location.replace("http://localhost:8000/login.html");
//       } else if (xhr.status != 200 && xhr.status != 201) {
//         alert("Unhandled error happened, contact the support team.\nResponse:\n" + xhr.responseText);
//         reject(xhr.responseText)
//       }
//       resolve(xhr.responseText);
//     };
//     xhr.send(body);
//   });
// }