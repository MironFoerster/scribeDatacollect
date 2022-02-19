var slider_pos = 0;
alert("Bitte verwende dein Gerät im Querformat!");
document.getElementById("sc0").style.setProperty("opacity", 1);
document.body.addEventListener('click', e => {
    var target = e.target;
    document.getElementById("sc"+slider_pos).style.setProperty("opacity", 0);
    if (target.classList.contains('intro-slide-next-btn')) {
        slider_pos++;
    } else if (target.classList.contains('intro-slide-prev-btn')) {
        slider_pos--;
    }
    document.getElementById("sc"+slider_pos).style.setProperty("opacity", 1);
    document.getElementById("intro-slider").style.setProperty("--pos", slider_pos);

}, false);

document.getElementById("login-btn").addEventListener('click', e => {
    fetch(window.location.origin.concat("/login/"), {
        method: "POST",
        headers: {
            "X-CSRFToken": getCookie("csrftoken"),
            "ContentType": "application/json"},
        body: JSON.stringify({"username": document.getElementById("login-input").value}),
    }).then(response => response.json())
    .then(login_info => {
        if (login_info.succ) {
            location.href = window.location.origin.concat("/stats/");
        }else {
            alert('Der Name "' + document.getElementById("login-input").value + '" existiert nicht!');
        }
    })
}, false)

const getCookie = (name) => { // kopiert von: https://docs.djangoproject.com/en/3.1/ref/csrf/#acquiring-the-token-if-csrf-use-sessions-and-csrf-cookie-httponly-are-false
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}