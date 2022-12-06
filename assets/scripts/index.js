const BASE_URL = "https://power4-api.matteochretien.com";

function getCookie(name) {
    let cookie = {};
    document.cookie.split(';').forEach(function (el) {
        let [k, v] = el.split('=');
        cookie[k.trim()] = v;
    })
    return cookie[name];
}

if (!getCookie("hostId")) {
    fetch(BASE_URL + '/generateUserId', {method: 'GET'}).then(resp => resp.text()).then(id => {
        document.cookie = `hostId=${id}; path=/`;
    })
}
