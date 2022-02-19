var slider_pos = 0;
alert("Bitte verwende dein Gerät im Querformat!");
document.getElementById("sc0").style.setProperty("opacity", 1);
document.body.addEventListener('click', e => {
    var target = e.target;
    document.getElementById("sc"+slider_pos).style.setProperty("opacity", 0);
    if (target.classList.contains('stats-slide-next-btn')) {
        slider_pos++;
    } else if (target.classList.contains('stats-slide-prev-btn')) {
        slider_pos--;
    }
    console.log(slider_pos);
    document.getElementById("sc"+slider_pos).style.setProperty("opacity", 1);
    document.getElementById("stats-slider").style.setProperty("--pos", slider_pos);

}, false);

document.getElementById("split-btn").addEventListener('click', e => {location.href = window.location.origin.concat("/split/")}, false)
document.getElementById("write-btn").addEventListener('click', e => {location.href = window.location.origin.concat("/write/")}, false)