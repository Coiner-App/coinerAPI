const xhttp = new XMLHttpRequest();
// const note = document.getElementsByClassName("note")[0]

const vars = getVars();
const email = vars["email"];
if (email) {
    document
        .getElementById("email")
        .setAttribute("value", decodeURIComponent(email));
}

let passwordShown = false
function showPassword() {
    const password = document.getElementById("password");
    passwordShown = !passwordShown;
    passwordShown
        ? password.setAttribute("type", "text")
        : password.setAttribute("type", "password");
}

function gotoResetPassword() {
    const email = document.getElementById("email").value;
    if (!email) {
        switchTo(`${Links.resetPassword}?email=${email}`);
    } else {
        switchTo(Links.resetPassword);
    }
}

async function sendResetMail() {
    const email = await document.getElementById("email").value;
    if (!email) {
        alert("E-Mail cannot be empty!");
        return;
    }
    const response = await axios.get("/auth/forgot", {
        params: {
            email: email,
        },
    }).catch((e) => {
        return e.response;
    });
    if (response.status != 200) return alert(response.data.error);
    document.getElementById("resetform-1").style.display = "none";
    document.getElementById("resetform-2").style.display = "";
}

function confirmResetCode() {
    const code = document.getElementById("code").value;
    if (!code) {
        alert("Code cannot be empty!");
        return;
    }
    document.getElementById("resetform-2").style.display = "none";
    document.getElementById("resetform-3").style.display = "";
}

async function confirmNewPassword() {
    const code = document.getElementById("code").value;
    const password = document.getElementById("password").value;
    if (!password) {
        alert("Password cannot be empty!");
        return;
    }
    const params = new URLSearchParams();
    params.append("code", code);
    params.append("newpass", password)
    const response = await axios.post("/auth/forgot", params).catch((e) => {
        return e.response;
    });
    if (response.status != 200) {
        alert(response.data.error);
        document.getElementById("resetform-3").style.display = "none";
        document.getElementById("resetform-2").style.display = "";
        return;
    }
    document.getElementById("resetform-3").style.display = "none";
    document.getElementById("resetform-4").style.display = "";
}

async function initLogin() {
    const email = await document.getElementById("email").value;
    const password = await document.getElementById("password").value;
    if (!email) return alert("Please enter an email!");
    if (!password) return alert("Please enter a password!");
    try {
        document.getElementById("signup-errornote").style.display = "none";
        const params = new URLSearchParams();
        params.append("email", email);
        params.append("password", password);
        const response = await axios
            .post("/auth/login", params)
            .catch(() => {
                document.getElementById("signup-errornote").style.display = "block";
            });
        if (response.status == 200) window.location = Links.baseUrl;
        console.log(response);
    } catch (error) {
        document.getElementById("signup-errornote").style.display = "block";
        console.error(error);
    }
}


async function initRegister() {
    const signupnote = document.getElementById("signup-errornote");
    const displayname = await document.getElementById("displayname").value;
    const username = await document.getElementById("username").value;
    const email = await document.getElementById("email").value;
    const password = await document.getElementById("password").value;
    if (!username) return alert("Please enter a username!")
    if (!email) return alert("Please enter an email!")
    if (!password) return alert("Please enter a password!");
    try {
        signupnote.style.display = "";
        const params = new URLSearchParams();
        if (displayname) params.append("displayname", displayname)
        params.append("username", username);
        params.append("email", email);
        params.append("password", password)
        const response = await axios.post('/auth/register', params).catch((e) => {
            signupnote.style.display = "block";
            signupnote.innerHTML = e.response.data.error;
            return e.response;
        });
        if (response.status == 200) {
            await alert("An email has been sent to your inbox for verification.");
            window.location = Links.logIn;
            return;
        }
    } catch (error) {
        console.error(error);
    }
}

async function logOut() {
    await axios.get("/profile/logout");
    window.location = Links.baseUrl;
}