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

async function initlogin() {
  const email = await document.getElementById("username").value;
  const password = await document.getElementById("password").value;
  if (!email) return alert("Please enter an email!")
  if (!password) return alert("Please enter a password");
  try {
    const params = new URLSearchParams();
    params.append("email", email);
    params.append("password", password)
    const response = await axios.post('/auth/login', params).catch((e) => {
      note.innerHTML = e.response.data.error;
      note.style.color = "#DE1212";
    });
    if (response.status == 200) window.location = "https://localhost:8000/";
    console.log(response);
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