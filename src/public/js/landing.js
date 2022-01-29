const DEBUG_IS_LOGGED_IN = false;

const isLogged = async () => {
    const response = await axios.get('/profile/me').catch((e) => {
        if (e.response.status != 200) return false;
        return true;
    });
    if (response.status != 200) return false;
    return true;
}

const landingSignupContent = function (isSignedUp) {
    if (isSignedUp) {
        return `
        <h2>You are logged in!</h2>
        <h4>Hop in and start your virtual crypto trading adventure!</h4>
        <br>
        <div class="signup-button-area">
            <button class="btn--accented" onclick="switchTo(Links.profile)">go to my profile</button>
            <a>or</a>
            <button class="btn--accented" onclick="logOut()">log out</button>
        </div>
        `
    } else {
        return `
        <h2>Sounds cool, right?</h2>
        <h4>Hop in and start your virtual crypto trading adventure! It’s free.</h4>
        <form id="signUpForm">
            <a id="signup-errornote">Error: Your E-Mail address or password is wrong!</a>
            <input type="email" name="email" id="email" placeholder="E-Mail address">
            <input type="password" name="password" id="password" placeholder="Password">
            <span style="text-align: left"><input type="checkbox" name="showpass" onclick="showPassword()"><label for="showpass">Show password</label></span>
            <span class="pill"></span>
            <div class="signup-button-area">
                <button class="btn--accented" onclick="initLogin()" type="button">login</button>
                <a>or</a>
                <button class="btn--accented" onclick="continueSignUp()" type="button">sign up</button>
            </div>
            <a class="signup-bottomline" onclick="gotoResetPassword()">Forgot password</a>
        </form>
        `
    }
}

async function setBottom() {
document.getElementById("signup-content").innerHTML =
    landingSignupContent(await isLogged())
}

function continueSignUp() {
    const email = document.getElementById("email").value
    if (!email) {
        switchTo(Links.signUp)
    } else {
        switchTo(`${Links.signUp}?email=${email}`)
    }
}

function gotoDownloads() {
    switchTo(Links.download);
}

setBottom();