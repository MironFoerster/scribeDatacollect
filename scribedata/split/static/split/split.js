const submitData = (e) => {
    //check if rejected
    if (e.currentTarget.id === "reject-btn") {
        if (confirm("Willst du wirklich überspringen?")) {
                submit = true;
            } else {
                submit = false;
            }
        reject = true;
    } else {
        reject = false;
        submit = true;
    }
    if (submit) {
        // check if data is valid for submit
        if (window.submit_data.length === window.task_data.text.split(" ").length | reject) {
            fetch(window.location.origin.concat("/split/data/"), {
            method: "POST",
            headers: {
                "X-CSRFToken": getCookie("csrftoken"),
                "ContentType": "application/json"},
            body: JSON.stringify({"index": window.task_index, "data": window.submit_data, "reject": reject}),
            }).then(response => response.json())
            .then(current_task_data => receiveData(current_task_data))
        } else {
            alert("Der Submit ist nicht vollständig! Korrigiere oder Überspringe!");
        }
    }
}

const receiveData = (current_task) => {
    window.task_index = current_task.index;
    if (window.task_index == -1) {
        document.getElementById("split-line").remove();
        finished = document.createElement("div");
        finished.id = "finished";
        finished_cont = document.createElement("div");
        finished_cont.innerHTML = "<span style='font-size: 2em;'>Yippieeeeee!!!!!</span><br>Du hast alle deine Spalten-Aufgaben erledigt!<br>Mach gleich weiter mit den Schreib-Aufgaben!";

        finished_btn = document.createElement("button");
        finished_btn.className = "crazy-btn";
        finished_btn.innerHTML = "Cool!";
        finished_btn.addEventListener('click', (e)=>{location.href = window.location.origin.concat("/stats/")})

        finished.appendChild(finished_cont);
        finished.appendChild(finished_btn);

        shade = document.createElement("div");
        shade.id = "shade";
        document.body.appendChild(shade);
        document.getElementById("container").insertBefore(finished, document.getElementById("split-control"));
        return
    }
    window.task_data = current_task.data;
    window.task_person = current_task.data.person;
    window.submit_data = [current_task.data];

    document.getElementById("split-line").remove();
    split_line = document.createElement("div");
    split_line.id = "split-line";
    document.getElementById("container").insertBefore(split_line, document.getElementById("split-control"));

    // initialize split-line
    var unsplit = document.createElement("div");
    unsplit.id = "unsplit";
    var unsplit_labels = document.createElement("div");
    unsplit_labels.id = "unsplit-labels";
    unsplit.appendChild(unsplit_labels);
    for (var label of window.task_data.text.split(" ")) {
        var unsplit_label = document.createElement("div");
        unsplit_label.innerHTML = label;
        unsplit_label.className = "unsplit-label";
        unsplit_labels.appendChild(unsplit_label);
    }

    window.full_cvs_width = -Infinity;
    for (var point of window.task_data.strokes) {
        window.full_cvs_width = Math.max(window.full_cvs_width, point.x);
    }
    window.full_cvs_width += 100;
    window.full_cvs_height = -Infinity;
    for (var point of window.task_data.strokes) {
        window.full_cvs_height = Math.max(window.full_cvs_height, point.y);
    }
    window.full_cvs_height += 100;
    window.vw_per_unit = 98 / window.full_cvs_width;

    var hw_cvs = document.createElement("canvas");
    hw_cvs.className = "hw-cvs";
    hw_cvs.id = "unsplit-cvs";
    hw_cvs.width = window.full_cvs_width;
    hw_cvs.style.width = hw_cvs.width * window.vw_per_unit + "vw";
    hw_cvs.height = window.full_cvs_height;
    hw_cvs.addEventListener("touchmove", moveOnCvs, false);

    unsplit.appendChild(hw_cvs);
    redraw_canvas(hw_cvs, window.task_data.strokes);
    //var split_line = document.getElementById("split-line");
    split_line.appendChild(unsplit);


    if (sessionStorage.getItem("split_tutorial") == undefined) {
        startTutorial();
    }
}

const startTutorial = () => {
    window.tut_data = [
        {text: "Willkommen beim Tutorial!<br>Lass uns die wichtigsten Funktionen dieser Seite anschauen!", left: "50vw", top: "50vh", focus_ids: ["submit-btn"]},
        {text: "Hier werden die Handschriftzeilen angezeigt, die du in Wörter Auftrennen sollst. Ziehe einen Strich, um das nächste Wort abzutrennen!", left: "50vw", top: "20vh", focus_ids: ["unsplit"]},
        {text: "Hier kannst du Fehler rückgängig machen.", left: "45vw", top: "50vh", focus_ids: ["undo-btn"]},
        {text: "Wenn du alle Wörter getrennt hast, klicke hier, um die nächste Handschriftzeile zu bekommen!", left: "50vw", top: "50vh", focus_ids: ["submit-btn"]},
        {text: "Wenn sich eine Zeile nicht korrekt aufspalten lässt oder sehr unleserlich ist, kannst du sie Überspringen!", left: "55vw", top: "50vh", focus_ids: ["reject-btn"]},
        {text: "Glückwunsch! Jetzt bist du bereit, loszulegen!", left: "50vw", top: "50vh", focus_ids: []},
    ]
    // initialize tutorial index
    window.tut_idx = 0;
    window.tut_idx_prev = 0;
    // initialize tutorial box
    tut_box = document.createElement("div");
    tut_box.id = "tut-box";
    tut_box.style.left = window.tut_data[0].left;
    tut_box.style.top = window.tut_data[0].top;
    tut_content = document.createElement("div");
    tut_content.id = "tut-content";
    tut_content.innerHTML = window.tut_data[0].text;
    tut_next = document.createElement("button");
    tut_next.id = "tut-next";
    tut_next.className = "crazy-btn";
    tut_next.innerHTML = ">";
    tut_next.addEventListener("click", updateTutorial, false);
    tut_prev = document.createElement("button");
    tut_prev.id = "tut-prev";
    tut_prev.className = "crazy-btn";
    tut_prev.innerHTML = "<";
    tut_prev.style.opacity = "0.5";
    tut_prev.addEventListener("click", updateTutorial, false);

    tut_box.appendChild(tut_prev);
    tut_box.appendChild(tut_content);
    tut_box.appendChild(tut_next);

    shade = document.createElement("div");
    shade.id = "shade";
    document.body.appendChild(shade);
    document.body.appendChild(tut_box);
}

const updateTutorial = (e) => {
    if (event.currentTarget.id === "tut-next" & window.tut_idx < window.tut_data.length) {
        window.tut_idx += 1;
        if (window.tut_idx === window.tut_data.length) {
            finishTutorial();
            return;
        }
    } else if (event.currentTarget.id === "tut-prev" & window.tut_idx > 0) {
        window.tut_idx -= 1;
    }
    for (id of window.tut_data[window.tut_idx_prev].focus_ids) {
        elem = document.getElementById(id);
        elem.style.zIndex = 0;
    }

    tut_box = document.getElementById("tut-box")

    if (window.tut_idx === window.tut_data.length-1) {
        tut_box.children[0].style.opacity = 1;
        tut_box.children[2].innerHTML = "Los!";
    } else if (window.tut_idx === 0) {
        tut_box.children[0].style.opacity = 0.5;
        tut_box.children[2].style.opacity = 1;
    } else {
        tut_box.children[0].style.opacity = 1;
        tut_box.children[2].style.opacity = 1;
        tut_box.children[2].innerHTML = ">";
    }

    tut_box.children[1].innerHTML = window.tut_data[window.tut_idx].text;
    tut_box.style.left = window.tut_data[window.tut_idx].left;
    tut_box.style.top = window.tut_data[window.tut_idx].top;

    for (id of window.tut_data[window.tut_idx].focus_ids) {
        elem = document.getElementById(id);
        elem.style.zIndex = 2;
    }
    window.tut_idx_prev = window.tut_idx;
}

const finishTutorial = () => {
    // delete tutorial box
    document.getElementById("tut-box").remove()
    document.getElementById("shade").remove()
    sessionStorage.setItem("split_tutorial", "done");
}

const splitNextWordAt = (x_coord) => {
    var unsplit = window.submit_data.pop();
    var new_unsplit_text = unsplit.text.split(" ");
    var word_text = new_unsplit_text.shift();
    new_unsplit_text = new_unsplit_text.join(" ");
    var word_strokes = [];
    var new_unsplit_strokes = [];
    for (var point of unsplit.strokes) {
        if (point.x <= x_coord) {
            word_strokes.push(point);
        } else {
            point.x -= x_coord;
            new_unsplit_strokes.push(point);
        }
    }
    window.submit_data.push({'strokes': word_strokes, 'text': word_text, 'person': window.task_person});
    window.submit_data.push({'strokes': new_unsplit_strokes, 'text': new_unsplit_text, 'person': window.task_person});
    updateSplitLine(x_offset=x_coord);
}

const undoPrevSplit = (e) => {
    if (window.submit_data.length === 1) {
        alert('Rückgängig nicht möglich!');
        return;
    }

    var unsplit = window.submit_data.pop();
    var del_word = window.submit_data.pop();
    var new_unsplit_text = unsplit.text.split(" ");
    new_unsplit_text.unshift(del_word.text);
    new_unsplit_text = new_unsplit_text.join(" ");

    var del_cvs = document.getElementById("split-line").children[document.getElementById("split-line").children.length-2].lastChild;
    var new_unsplit_strokes = [];
    for (var point of unsplit.strokes) {
        point.x += del_cvs.width;
        new_unsplit_strokes.push(point);
    }
    new_unsplit_strokes.unshift(...del_word.strokes);
    window.submit_data.push({'strokes': new_unsplit_strokes, 'text': new_unsplit_text, 'person': window.task_person});
    updateSplitLine(x_offset=del_cvs.width);
}

const drawTouchTrace = () => {
    cvs_element = document.getElementById("unsplit-cvs");
    ctx = cvs_element.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(window.touch_trace[0].x, window.touch_trace[0].y);
    for (point of window.touch_trace) {
        ctx.lineTo(point.x, point.y);
    }
    ctx.stroke();
}

const touchStart = (e) => {
    // not needed as it only would set touch_trace to [] what will already be done when prev touch ends
    window.touch_trace = [];
}

const moveOnCvs = (e) => {
    touch = e.changedTouches[0];
    cvs_element = e.currentTarget;
    const cvsRect = cvs_element.getBoundingClientRect();
    // Berechnet die Position des Touchs auf dem canvas-Element
    // unter Berücksichtigung von canvas-Offset, CSS-Skalierung und canvas-Breite von 1000 Einheiten
    window.touch_trace.push({'x': (touch.pageX - cvsRect.left) * (cvs_element.width/parseInt(window.getComputedStyle(cvs_element).width)), 'y': (touch.pageY - cvsRect.top) * (cvs_element.height/parseInt(window.getComputedStyle(cvs_element).height))});
    drawTouchTrace();
}

const touchEnd = (e) => {
    if (window.touch_trace.length > 0) {
        // calculate the x coordinate to cut at
        sum = 0;
        // find average x of touch trace
        for (var point of window.touch_trace) {
            sum += point.x;
        }
        avg_trace_x = sum / window.touch_trace.length;

        next_left_point_x = -Infinity;
        next_right_point_x = +Infinity;
        for (var point of window.submit_data[window.submit_data.length-1].strokes) {
            if (point.x <= avg_trace_x) {
                next_left_point_x = Math.max(next_left_point_x, point.x);
            }
            if (point.x > avg_trace_x) {
                next_right_point_x = Math.min(next_right_point_x, point.x);
            }
        }
        if (next_right_point_x-next_left_point_x >= 50) {
            if (next_left_point_x === -Infinity || next_right_point_x === Infinity) {
                alert('Kein Wort abgeschnitten!')
                redraw_canvas(document.getElementById("unsplit-cvs"), window.submit_data[window.submit_data.length-1].strokes)
            } else {
                splitNextWordAt(next_left_point_x + (next_right_point_x-next_left_point_x)/2);
            }
        } else {
            alert('Linie würde zerschnitten!');
            redraw_canvas(document.getElementById("unsplit-cvs"), window.submit_data[window.submit_data.length-1].strokes)
        }
    } else {
        // touch didn't move over the unsplit-cvs; do nothing
    }
}

const redraw_canvas = (cvs_element, strokes) => {
    var ctx = cvs_element.getContext("2d");
    // clear context
    ctx.clearRect(0, 0, cvs_element.width, cvs_element.height);

    // draw new strokes
    ctx.beginPath();
    ctx.lineCap = 'round';
    ctx.strokeStyle = "black";
    ctx.lineJoin = 'round';
    ctx.lineWidth = 30;

    ctx.moveTo(strokes[0].x, strokes[0].y);
    var prev_point = strokes[0];
    for (var point of strokes) {
        if (prev_point.eos) {
            ctx.moveTo(point.x, point.y);
        } else {
            ctx.lineTo(point.x, point.y);
        }
        prev_point = point;
    }
    ctx.stroke();
}

const updateSplitLine = (x_offset) => {
    var split_line = document.getElementById("split-line")
    if (split_line.children.length < window.submit_data.length) {  // add word
        // update unsplit_labels
        var unsplit_labels = document.getElementById("unsplit-labels");
        unsplit_labels.firstChild.remove();

        // update unsplit-cvs
        var unsplit_cvs = document.getElementById("unsplit-cvs");
        unsplit_cvs.width = unsplit_cvs.width - x_offset;
        unsplit_cvs.style.width = unsplit_cvs.width * window.vw_per_unit + "vw";
        redraw_canvas(unsplit_cvs, window.submit_data[window.submit_data.length-1].strokes);

        // create new_last_word element and insert into split-line
        var new_last_word = document.createElement("div");
        new_last_word.className = "split-word";
        split_line.insertBefore(new_last_word, split_line.lastChild);
        // create label element and append it to new_last_word
        var label = document.createElement("div");
        label.innerHTML = window.submit_data[window.submit_data.length-2].text;
        label.className = 'split-word-label'
        new_last_word.appendChild(label);
        // create hw_cvs element and append it to new_last_word
        var hw_cvs = document.createElement("canvas");
        hw_cvs.className = "hw-cvs";
        hw_cvs.width = x_offset;
        hw_cvs.style.width = hw_cvs.width * window.vw_per_unit + "vw";
        hw_cvs.height = window.full_cvs_height;
        redraw_canvas(hw_cvs, window.submit_data[window.submit_data.length-2].strokes);
        new_last_word.appendChild(hw_cvs);
    } else if (split_line.children.length > window.submit_data.length) {  // remove word
        // update unsplit-labels
        var new_unsplit_label = document.createElement("div");
        new_unsplit_label.innerHTML = window.submit_data[window.submit_data.length-1].text.split(" ")[0];
        new_unsplit_label.className = "unsplit-label";
        var unsplit_labels = document.getElementById("unsplit-labels");
        unsplit_labels.insertBefore(new_unsplit_label, unsplit_labels.firstChild);
        // update unsplit-cvs
         var unsplit_cvs = document.getElementById("unsplit-cvs");
        unsplit_cvs.width = unsplit_cvs.width + x_offset;
        unsplit_cvs.style.width = unsplit_cvs.width * window.vw_per_unit + "vw";
        redraw_canvas(unsplit_cvs, window.submit_data[window.submit_data.length-1].strokes);

        // remove last_word from split_line
        var last_word = split_line.children[split_line.children.length-2]
        last_word.remove();
    } else {
        // everything up to date; do nothing
    }
}

window.addEventListener("load", e => {
    fetch(window.location.origin.concat("/split/data/"), {
        method: "POST",
        headers: {
            "X-CSRFToken": getCookie("csrftoken"),
            "ContentType": "application/json"},
        body: JSON.stringify({}),
    }).then(response => response.json())
    .then(current_task => receiveData(current_task))
}, false)

document.body.addEventListener("touchstart", touchStart, false);
document.body.addEventListener("touchend", touchEnd, false);
document.getElementById("undo-btn").addEventListener("click", undoPrevSplit, false);
document.getElementById("reject-btn").addEventListener("click", submitData, false);
document.getElementById("submit-btn").addEventListener("click", submitData, false);
document.getElementById("tutorial").addEventListener("click", startTutorial, false);
document.getElementById("tostats").addEventListener("click", ()=>{location.href = window.location.origin.concat("/stats/")}, false);
document.body.addEventListener("click", (e)=>{e.preventDefault();})


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