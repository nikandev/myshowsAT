var list = document.querySelector('div[id^="s"]');

function editData(event) {
    var element = event.target;
    var input = document.createElement("input");
    input.setAttribute("value", element.textContent);
    element.replaceWith(input);

    const save = function () {
        const previous = document.createElement(element.tagName.toLowerCase());
        previous.onclick = editData;
        previous.textContent = input.value;
        input.replaceWith(previous);
    };

    input.addEventListener('blur', save, {
        once: true,
    });
    input.focus();
}

async function addSubTitles() {
    let shows = document.querySelectorAll('div[id^="s"]');

    for (let show of shows) {
        let subtitle = document.createElement("div");
        subtitle.innerHTML = "set subtitle";

        subtitle.onclick = editData;

        await show.firstChild.after(subtitle);
    }
}

addSubTitles();