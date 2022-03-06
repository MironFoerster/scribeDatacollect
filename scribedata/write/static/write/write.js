const submitData = (e) => {
    // check if data is valid for submit
    if (window.submit_data.length === window.task_data.text.split(" ").length) {
        fetch(window.location.origin.concat("/write/data/"), {
        method: "POST",
        headers: {
            "X-CSRFToken": getCookie("csrftoken"),
            "ContentType": "application/json"},
        body: JSON.stringify({"index": window.task_index, "data": window.submit_data}),
        }).then(response => response.json())
        .then(current_task_data => receiveData(current_task_data))
    } else {
        alert("Der Submit ist nicht vollständig! Korrigiere!");
    }
}

const receiveData = (current_task) => {
    window.task_index = current_task.index;
    window.task_data = current_task.data;
    window.task_person = current_task.data.person;
    window.submit_data = [{'text': current_task.data.text, 'strokes': []}];
    window.max_x = 0;
    window.word_distance = parseInt(document.getElementById("distance-rng").value);
    window.grad_opct = document.getElementById("opacity-rng").value;

    // initialize write-line
    var unwritten_labels = document.createElement("div");
    unwritten_labels.id = "unwritten-labels";
    for (var label of window.task_data.text.split(" ")) {
        var unwritten_label = document.createElement("div");
        unwritten_label.innerHTML = label;
        unwritten_label.className = "unwritten-label";
        unwritten_labels.appendChild(unwritten_label);
    }

    var hw_cvs = document.createElement("canvas");
    hw_cvs.className = "hw-cvs";
    hw_cvs.id = "unwritten-cvs";
    //var pixels_per_char = 125;
    window.full_cvs_width = 5000;
    window.vw_per_unit = 98 / window.full_cvs_width;
    window.full_cvs_height = 800;
    hw_cvs.width = window.full_cvs_width;  //window.task_data.text.length * pixels_per_char;
    hw_cvs.height = window.full_cvs_height;
    hw_cvs.style.width = hw_cvs.width * window.vw_per_unit + "vw";
    hw_cvs.addEventListener("touchstart", Tstart, false);
    hw_cvs.addEventListener("touchmove", Tmove, false);
    hw_cvs.addEventListener("touchend", Tend, false);

    var unwritten = document.createElement("div");
    unwritten.id = "unwritten";
    unwritten.appendChild(unwritten_labels);
    unwritten.appendChild(hw_cvs);

    // initial draw
    redraw_canvas(hw_cvs, window.submit_data[0].strokes);

    document.getElementById("write-line").remove();
    var write_line = document.createElement("div");
    write_line.id = "write-line";
    document.getElementById("container").insertBefore(write_line, document.getElementById("write-control"));
    write_line.appendChild(unwritten);

    if (sessionStorage.getItem("write_tutorial") == undefined) {
        startTutorial();
    }
}

const startTutorial = () => {
    window.tut_data = [
        {text: "Willkommen beim Tutorial!<br>Lass uns die wichtigsten Funktionen dieser Seite anschauen!", left: "50vw", top: "50vh", focus_ids: []},
        {text: "Auf dieser Fläche sollst du jeweils die Wörter schreiben, die drüber stehen. Du kannst links von und auf dem roten Marker schreiben.<br>Setze rechts vom Marker an, um ein neues Word anzufangen!", left: "50vw", top: "60vh", focus_ids: ["unwritten"]},
        {text: "HINWEIS: Umlaute und s-z werden leider falsch angezeigt, lassen sich aber leicht herleiten!", left: "50vw", top: "60vh", focus_ids: ["unwritten"]},
        {text: "Hier kannst du kannst Fehler rückgängig machen.", left: "45vw", top: "40vh", focus_ids: ["undo-btn"]},
        {text: "Hier kannst du die Größe und Stärke des Markers nach deinen persönlichen Vorlieben anpassen.", left: "50vw", top: "40vh", focus_ids: ["settings"]},
        {text: "Wenn du alle Wörter geschrieben hast, klicke hier, um die nächste Zeile zu bekommen!", left: "55vw", top: "40vh", focus_ids: ["submit-btn"]},
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
    sessionStorage.setItem("write_tutorial", "done");
}

const cutOffNextWord = () => {
    var unwritten = window.submit_data.pop();
    var new_unwritten_text = unwritten.text.split(" ");
    var word_text = new_unwritten_text.shift();
    new_unwritten_text = new_unwritten_text.join(" ");

    var word_strokes = unwritten.strokes;
    var new_unwritten_strokes = [];

    window.submit_data.push({'strokes': word_strokes, 'text': word_text, 'person': window.task_person});
    window.submit_data.push({'strokes': new_unwritten_strokes, 'text': new_unwritten_text, 'person': window.task_person});
}

const undoPrevStroke = () => {
    if (window.submit_data.length === 1 & window.submit_data[0].strokes.length === 0) {
        alert('Rückgängig nicht möglich!');
        return;
    }

    var strokes = window.submit_data[window.submit_data.length-1].strokes;
    var eos_count = strokes.reduce((count, point) => {if(point.eos === 1){count+=1;}return count;}, initialValue=0);
    if (eos_count > 1) {
        // delete last stroke from unwritten
        window.submit_data[window.submit_data.length-1].strokes.pop();
        do {
            point = window.submit_data[window.submit_data.length-1].strokes.pop();
        } while (point.eos === 0)
        window.submit_data[window.submit_data.length-1].strokes.push(point);

        window.max_x = 0;
        for (point of window.submit_data[window.submit_data.length-1].strokes) {
            window.max_x = Math.max(window.max_x, point.x);
        }

    } else if (eos_count === 1) {
        window.submit_data[window.submit_data.length-1].strokes = [];
        window.max_x = 0;
    } else {
        // delete first stroke from unwritten and merge the last written-word into unwritten
        var old_unwritten = window.submit_data.pop();
        window.submit_data[window.submit_data.length-1].text += " " + old_unwritten.text;

        window.max_x = 0;
        for (point of window.submit_data[window.submit_data.length-1].strokes) {
            window.max_x = Math.max(window.max_x, point.x);
        }
        updateWriteLine();
    }
    redraw_canvas(document.getElementById("unwritten-cvs"), window.submit_data[window.submit_data.length-1].strokes);
}

const updateWriteLine = () => {
    var write_line = document.getElementById("write-line")
    //var redraws = [];
    if (write_line.children.length < window.submit_data.length) {  // add word
        // update unwritten-labels
        var unwritten_labels = document.getElementById("unwritten-labels");
        unwritten_labels.firstChild.remove();

        var unwritten_cvs = document.getElementById("unwritten-cvs");
        unwritten_cvs.width = unwritten_cvs.width - (window.max_x + window.word_distance/2);
        unwritten_cvs.style.width = unwritten_cvs.width * window.vw_per_unit + "vw";
        // update unwritten-cvs
        // create new_last_word element and insert into write-line
        var new_last_word = document.createElement("div");
        new_last_word.className = "written-word";
        write_line.insertBefore(new_last_word, write_line.lastChild);
        // create label element and append it to new_last_word
        var label = document.createElement("div");
        label.innerHTML = window.submit_data[window.submit_data.length-2].text;
        label.className = 'written-word-label'
        new_last_word.appendChild(label);
        // create hw_cvs element and append it to new_last_word
        var hw_cvs = document.createElement("canvas");
        hw_cvs.className = "hw-cvs";
        hw_cvs.width = window.max_x + window.word_distance/2;
        hw_cvs.height = window.full_cvs_height;
        hw_cvs.style.width = hw_cvs.width * window.vw_per_unit + "vw";
        //redraw_canvas(hw_cvs, window.submit_data[window.submit_data.length-2].strokes);
        //redraws.push({cvs: hw_cvs, strokes: window.submit_data[window.submit_data.length-2].strokes});
        new_last_word.appendChild(hw_cvs);
    } else if (write_line.children.length > window.submit_data.length) {  // remove word
        // update unwritten-labels
        var new_unwritten_label = document.createElement("div");
        new_unwritten_label.innerHTML = window.submit_data[window.submit_data.length-1].text.split(" ")[0];
        new_unwritten_label.className = "unwritten-label";
        var unwritten_labels = document.getElementById("unwritten-labels");
        unwritten_labels.insertBefore(new_unwritten_label, unwritten_labels.firstChild);

        // remove last_word from write-line
        var last_word = write_line.children[write_line.children.length-2]
        var unwritten_cvs = document.getElementById("unwritten-cvs");
        unwritten_cvs.width = unwritten_cvs.width + window.max_x + window.word_distance/2;
        unwritten_cvs.style.width = unwritten_cvs.width * window.vw_per_unit + "vw";
        last_word.remove();
    } else {}
}

const Tstart = (e) => {
    e.preventDefault();
    var touch = e.changedTouches[0];
    var cvs_element = e.currentTarget;
    window.cvsRect = cvs_element.getBoundingClientRect();
    window.cvs_style_width = parseInt(window.getComputedStyle(cvs_element).width);
    window.write_cvs_height = parseInt(window.getComputedStyle(cvs_element).height);
    var touch_pos = {'x': (touch.pageX - window.cvsRect.left) * (cvs_element.width/window.cvs_style_width), 'y': (touch.pageY - window.cvsRect.top) * (cvs_element.height/window.write_cvs_height)};

    if (touch_pos.x >= window.max_x + window.word_distance) {
        cutOffNextWord();
        touch_pos.x -= window.max_x + window.word_distance/2;
        window.submit_data[window.submit_data.length-1].strokes.push({...touch_pos, 'eos': 0});

        updateWriteLine();
        redraw_canvas(document.getElementById("write-line").children[document.getElementById("write-line").children.length-2].lastChild, window.submit_data[window.submit_data.length-2].strokes);
        window.max_x = touch_pos.x;
        redraw_canvas(document.getElementById("unwritten-cvs"), window.submit_data[window.submit_data.length-1].strokes);
    } else {
        window.max_x = Math.max(window.max_x, touch_pos.x);
        window.submit_data[window.submit_data.length-1].strokes.push({...touch_pos, 'eos': 0});
        redraw_canvas(document.getElementById("unwritten-cvs"), window.submit_data[window.submit_data.length-1].strokes);
    }
}

const Tmove = (e) => {
    e.preventDefault();
    var touch = e.changedTouches[0];
    var cvs_element = e.currentTarget;
    window.cvsRect = cvs_element.getBoundingClientRect();
    window.cvs_style_width = parseInt(window.getComputedStyle(cvs_element).width);
    window.write_cvs_height = parseInt(window.getComputedStyle(cvs_element).height);
    var touch_pos = {'x': (touch.pageX - window.cvsRect.left) * (cvs_element.width/window.cvs_style_width), 'y': (touch.pageY - window.cvsRect.top) * (cvs_element.height/window.write_cvs_height)};
    window.max_x = Math.max(window.max_x, touch_pos.x);
    window.submit_data[window.submit_data.length-1].strokes.push({...touch_pos, 'eos': 0});
    //updateWriteLine();
    redraw_canvas(document.getElementById("unwritten-cvs"), window.submit_data[window.submit_data.length-1].strokes);
}

const Tend = (e) => {
    e.preventDefault();
    var touch = e.changedTouches[0];
    var cvs_element = e.currentTarget;
    window.cvsRect = cvs_element.getBoundingClientRect();
    window.cvs_style_width = parseInt(window.getComputedStyle(cvs_element).width);
    window.write_cvs_height = parseInt(window.getComputedStyle(cvs_element).height);
    var touch_pos = {'x': (touch.pageX - window.cvsRect.left) * (cvs_element.width/window.cvs_style_width), 'y': (touch.pageY - window.cvsRect.top) * (cvs_element.height/window.write_cvs_height)};
    window.max_x = Math.max(window.max_x, touch_pos.x);
    window.submit_data[window.submit_data.length-1].strokes.push({...touch_pos, 'eos': 1});
    redraw_canvas(document.getElementById("unwritten-cvs"), window.submit_data[window.submit_data.length-1].strokes);
}

window.addEventListener("load", e => {
    fetch(window.location.origin.concat("/write/data/"), {
        method: "POST",
        headers: {
            "X-CSRFToken": getCookie("csrftoken"),
            "ContentType": "application/json"},
        body: JSON.stringify({}),
    }).then(response => response.json())
    .then(current_task => receiveData(current_task))
}, false)

const redraw_canvas = (cvs_element, strokes) => {
    var ctx = cvs_element.getContext("2d");
    // clear context
    ctx.clearRect(0, 0, cvs_element.width, cvs_element.height);

    if (cvs_element.id === "unwritten-cvs") {
        console.log(window.word_distance);
        var grad = ctx.createLinearGradient(window.max_x, 0, window.max_x + window.word_distance, 0);
        grad.addColorStop(0, 'rgba(0,0,0,0)');
        grad.addColorStop(1, 'rgba(100,0,10,'+window.grad_opct+')');
        ctx.fillStyle = grad;
        ctx.fillRect(window.max_x, 0,window.word_distance, cvs_element.height);
    }
    // draw new strokes
    if (strokes.length !== 0) {
        ctx.beginPath();
        ctx.lineCap = 'round';
        ctx.strokeStyle = "black";
        ctx.lineJoin = 'round';
        ctx.lineWidth = 30;

        ctx.moveTo(strokes[0].x, strokes[0].y);
        var prev_point = strokes[0];
        for (var point of strokes) {
            if (prev_point.eos === 1) {
                ctx.moveTo(point.x, point.y);
            } else {
                ctx.lineTo(point.x, point.y);
            }
            prev_point = point;
        }
        ctx.stroke();
    }
}

document.getElementById("undo-btn").addEventListener("click", undoPrevStroke, false);
document.getElementById("submit-btn").addEventListener("click", submitData, false);
document.getElementById("tutorial").addEventListener("click", startTutorial, false);
document.getElementById("tostats").addEventListener("click", (e)=>{location.href = window.location.origin.concat("/stats/")}, false);
document.getElementById("distance-rng").addEventListener("change", (e)=>{window.word_distance=parseInt(e.currentTarget.value);redraw_canvas(document.getElementById("unwritten-cvs"), window.submit_data[window.submit_data.length-1].strokes);}, false);
document.getElementById("opacity-rng").addEventListener("change", (e)=>{window.grad_opct=e.currentTarget.value;redraw_canvas(document.getElementById("unwritten-cvs"), window.submit_data[window.submit_data.length-1].strokes);}, false);


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
