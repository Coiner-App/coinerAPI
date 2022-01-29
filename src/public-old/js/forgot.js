const xhttp = new XMLHttpRequest();
const note = document.getElementsByClassName("note")[0];
const snote = document.getElementsByClassName("note")[1];
const maindiv = document.getElementsByClassName("forgotdiv")[0];
const initdiv = document.getElementById("init");
const sdiv = document.getElementById("codeenter");

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

async function initreset() {
  const email = await document.getElementById("username").value;
  //const password = await document.getElementById("password").value;
  if (!email) return alert("Please enter an email!")
  //if (!password) return alert("Please enter a password");
  try {
    const response = await axios.get('/auth/forgot', {
      params: {
        email: email,
      }
    }).catch((e) => {
      note.innerHTML = e.response.data.error;
      note.style.color = "#DE1212";
    });
    if (response.status == 200) {
      initdiv.style.display = "none";
      maindiv.style.height = "520px";
      sdiv.style.display = "block";
    }
    console.log(response);
  } catch (error) {
    console.error(error);
  }
}

async function finalise() {
  const code = await document.getElementById("code").value;
  const password = await document.getElementById("password").value;
  if (!code) return alert("Please enter a code");
  if (!password) return alert("Enter a password!");
  try {
    const params = new URLSearchParams();
    params.append("code", code);
    params.append("newpass", password)
    const response = await axios.post('/auth/forgot', params).catch((e) => {
      snote.innerHTML = e.response.data.error;
      snote.style.color = "#DE1212";
    });
    if (response.status == 200) {
      snote.innerHTML = "Successfully reset your password!";
      snote.style.color = "#0F9D58";
    }
  } catch (error) {
    console.error(error);
  }
}

function hascode() {
  initdiv.style.display = "none";
  maindiv.style.height = "520px";
  sdiv.style.display = "block";
}

function togglePass(icon) {
  const password = document.getElementById("password");
  // toggle the type attribute
  const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
  password.setAttribute('type', type);
  // toggle the eye / eye slash icon
  icon.classList.toggle('fa-eye-slash');
}