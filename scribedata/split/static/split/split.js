const submitData = (e) => {
    //check if rejected
    if (e.currentTarget.id === "reject-btn") {
        reject = true;
    } else {
        reject = false;
        // check if data is valid for submit
        if (window.submit_data.length === window.task_data.text.split(" ").length) {
            fetch(window.location.origin.concat("/data/"), {
            method: "POST",
            headers: {
                "X-CSRFToken": getCookie("csrftoken"),
                "ContentType": "application/json"},
            body: JSON.stringify({"index": window.task_index, "data": window.submit_data, "reject": reject}),
            }).then(response => response.json())
            .then(current_task_data => receiveData(current_task))
        } else {
            alert("Der Submit ist nicht vollständig! Korrigiere oder Überspringe!");
        }
    }
}

const receiveData = (current_task) => {
    window.task_index = current_task.index;
    window.task_data = current_task.data;
    window.task_person = current_task.data.person
    console.log(current_task.msg);
    window.submit_data = [current_task.data]

    // initialize split-line
    var unsplit = document.createElement("div");
    unsplit.id = "unsplit";
    var unsplit_labels = document.createElement("div");
    unsplit_labels.id = "unsplit-labels";
    unsplit.appendChild(unsplit_labels);
    for (var label of window.task_data.text.split(" "))
        var unsplit_label = document.createElement("div");
        unsplit_label.classList.add("unsplit-label");
        unsplit_labels.appendChild(unsplit_label);
    var hw_cvs = document.createElement("canvas");
    hw_cvs.classList.add("hw_cvs");
    hw_cvs.id = "unsplit_cvs";
    unsplit.appendChild(hw_cvs);
    redraw_canvas(hw_cvs, window.task_data.strokes);
    var split_line = document.getElementById("split-line")
    split_line.appendChild(unsplit);
}

const splitNextWordAt = (x_coord) => {
    var unsplit = window.submit_data.pop();
    var new_unsplit_text = unsplit.text.split(" ");
    var word_text = new_unsplit_text.shift();
    new_unsplit_text = " ".join(new_unsplit_text);
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
}

const undoPrevSplit = (e) => {
    var unsplit = window.submit_data.pop();
    var del_word = window.submit_data.pop();
    var new_unsplit_text = unsplit.text.split(" ");
    var new_unsplit_text = new_unsplit_text.unshift(del_word.text);
    new_unsplit_text = " ".join(new_unsplit_text);

    // get max x coordinate of del_word strokes
    var max_x = -Infinity;
    for (var point of del_word.strokes) {
        max_x = Math.max(max_x, point.x);
    }
    var new_unsplit_strokes = [];
    for (var point of unsplit.strokes) {
        point.x += max_x;
        new_unsplit_strokes.push(point);
    }
    new_unsplit_strokes.unshift(...del_word.strokes);
    window.submit_data.push({'strokes': new_unsplit_strokes, 'text': new_unsplit_text, 'person': window.task_person});
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
    // not needed as it only would set touch_trace to [] what will alredy be done when prev touch ends
    window.touch_trace = [];
}

const moveOnCvs = (e) => {
    touch = e.changedTouches[0];
    cvs_element = document.getElementById("unsplit-cvs");
    const cvsRect = cvs_element.getBoundingClientRect();
    // Berechnet die Position des Touchs auf dem canvas-Element
    // unter Berücksichtigung von canvas-Offset, CSS-Skalierung und canvas-Breite von 1000 Einheiten
    window.touch_trace.push({'x': (touch.pageX - cvsRect.left) * (cvs_element.width/parseInt(window.getComputedStyle(cvs_elem).width)), 'y': (touch.pageY - cvsRect.top) * (cvs_element.height/parseInt(window.getComputedStyle(cvs_elem).height))});
    drawTouchTrace();
}

const touchEnd = (e) => {
    if (window.touch_trace.length > 0) {
        // calculate the x coordinate to cut at
        sum = 0;
        for (var point in window.touch_trace) {
            sum += point.x;
            // possibly implement a better x-coord finding algo, but this will do for now
            // must cut exactly at the rightmost point of the word!!!
        }
        x_coord = sum / window.touch_trace.length;
        splitNextWordAt(x_coord);
    } else {
        // touch didnt move over the unsplit-cvs; do nothing
    }
}

const redraw_canvas = (cvs_element, strokes) => {
    var ctx = cvs_element.get_context("2d");
    // clear context
    ctx.clearRect(0, 0, cvs_element.width, cvs_element.height);
    // update the width of the cvs_element
    var max_x = -Infinity;
    for (var point of strokes) {
        max_x = Math.max(max_x, point.x);
    }
    cvs_element.width = max_x + 5;
    // draw new strokes
    ctx.beginPath();
    ctx.lineCap = 'round'; ///nice trick! makes partpaths with only one point appear as a point on the canvas
    ctx.strokeStyle = "black";
    ctx.lineJoin = 'round';

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

const updateSplitLine = () => {
    var split_line = document.getElementById("split-line")
    if (split_line.children.length < window.submit_data.length) {  // add word
        // update unsplit_labels
        var unsplit_labels = document.getElementById("unsplit-labels");

        var new_unsplit_label = documet.createElement("div");
        new_unsplit_label.innerHTML = window.submit_data[window.submit_data.length-1].text.split(" ")[0];

        var old_first_unsplit_label = unsplit_labels.firstChild;
        unsplit_labels.insertBefore(new_unsplit_label, old_first_unsplit_label);

        // update unsplit_text hw_cvs
        var new_strokes = window.submit_data[window.submit_data.length-1].strokes;
        redraw_canvas(unsplit_text.querySelector(".hw_cvs"), new_strokes);

        // create new_last_word element and insert into split-line
        var new_last_word = document.createElement("div");
        new_last_word.classList.add("word");
        split_line.insertBefore(new_last_word, split_line.lastChild);
        // create label element and append it to new_last_word
        var label = document.createElement("div");
        label.innerHTML = window.submit_data[window.submit_data.length-2].text;
        new_last_word.appendChild(label);
        // create hw_cvs element and append it to new_last_word
        var hw_cvs = document.createElement("canvas");
        redraw_canvas(hw_cvs, window.submit_data[window.submit_data.length-2].strokes);
        new_last_word.appendChild(hw_cvs);  // is hw_cvs already updated here?
    } else if (split_line.children.length > window.submit_data.length) {  // remove word
        // update unsplit_text label
        var unsplit_text = split_line.lastElementChild;
        var new_label = window.submit_data[window.submit_data.length-1].text;
        unsplit_text.querySelector(".label").innerHTML = new_label;
        // update unsplit_text hw_cvs
        var new_strokes = window.submit_data[window.submit_data.length-1].strokes;
        redraw_canvas(unsplit_text.querySelector(".hw_cvs"), new_strokes);

        // remove last_word from split_line
        var last_word = split_line.chlidren[split_line.chlidren.length-2]
        last_word.remove();
    } else {
        // everything up to date; do nothing
    }
}

document.body.addEventListener("load", e => {
    fetch(window.location.origin.concat("/data/"), {
        method: "POST",
        headers: {
            "X-CSRFToken": getCookie("csrftoken"),
            "ContentType": "application/json"},
        body: JSON.stringify({}),
    }).then(response => response.json())
    .then(current_task => receiveData(current_task))
}, false)



document.body.addEventListener("touchstart", touchStart, false);
document.getElementById("unsplit-cvs").addEventListener("touchmove", moveOnCvs, false);
document.body.addEventListener("touchend", touchEnd, false);
document.getElementById("undo-btn").addEventListener("click", undoPrevSplit, false);
document.getElementById("reject-btn").addEventListener("click", submitData, false);
document.getElementById("submit-btn").addEventListener("click", submitData, false);



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