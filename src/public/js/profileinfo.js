async function getProfileInfo() {
    const response = await axios.get('/profile/me').catch((e) => {
        return e.response;
    });
    if (response.status != 200) return alert(response.data.error);
    const displayname = document.getElementById("displayname");
    const username = document.getElementById("username");
    const id = document.getElementById("accountid");
    const email = document.getElementById("email");
    const networth = document.getElementById("networth");
    const verified = document.getElementById("verified");
    displayname.innerHTML = response.data.displayname;
    username.innerHTML = response.data.username;
    id.innerHTML = response.data.id;
    email.innerHTML = response.data.email;
    networth.innerHTML = "Not implemented";
    verified.innerHTML = response.data.isverified;
}

getProfileInfo();