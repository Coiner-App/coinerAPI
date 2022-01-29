var signedIn = false

class Links {
    // static baseUrl = "https://coinerapp.com/"
    static baseUrl = "http://localhost:8000/"
    static download = this.baseUrl + "download.html"
    static profile = this.baseUrl + "profile.html"
    static signUp = this.baseUrl + "signup.html"
    static logIn = this.baseUrl + "login.html"
    static resetPassword = this.baseUrl + "resetpassword.html"
    static serverdllast = this.baseUrl + "downloads/latest?platform="
}

function switchTo(url) {
    window.location.href = url
}

function getVars() {
    let vars = [], hash
    const hashes = window.location.href
        .slice(window.location.href.indexOf("?") + 1)
        .split("&")
    hashes.forEach((e) => {
        hash = e.split("=")
        vars[hash[0]] = hash[1]
    })
    const split = window.location.href.split("?")
    if (split[1])
        window.history.pushState("page","Coiner",
            window.location.href.split("?")[0])
    return vars
}