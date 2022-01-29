getProfileData();

async function getProfileData() {
    const id = document.getElementById("id");
    const displayname = document.getElementById("dname");
    const username = document.getElementById("uname");
    const email = document.getElementById("email");
    const isprivate = document.getElementById("isprivate");
    const isverified = document.getElementById("isverified");
    const getprofile = await axios.get("/profile/me").catch((e) => {
        return alert(e.response.data.error);
    });
    const data = await getprofile.data;
    id.innerHTML = data.id;
    displayname.innerHTML = data.displayname;
    username.innerHTML = data.username;
    email.innerHTML = data.email;
    isprivate.innerHTML = data.isprivate;
    isverified.innerHTML = data.isverified;
}
