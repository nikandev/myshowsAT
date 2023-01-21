var list = document.querySelector('div[id^="s"]');

function saveToSync(id, value) {
    browser.storage.sync.set({[id]: value}, onSyncError);
}

function onSyncError(error) {
    if (error) {
        console.log(`myshowsAT Error: ${error}`);
    }
}

function loadFromSync(subtitle) {
    let subtitleTextFromStorage = browser.storage.sync.get(subtitle.id);

    subtitleTextFromStorage.then((res) => {
        if (typeof res[subtitle.id] !== 'undefined')
        {
            subtitle.innerHTML = res[subtitle.id];
            subtitle.style.color = 'black';
        }
    }, onSyncError);
}

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
        saveToSync(element.id, input.value);
    };

    input.addEventListener('blur', save, {
        once: true,
    });
    input.focus();
}

async function addSubTitles() {
    let shows = document.querySelectorAll('div[id^="s"]');

    for (let show of shows) {
        let subtitle = document.createElement("subtitle");
        subtitle.id = show.id;
        subtitle.style.color = 'gray';
        subtitle.innerHTML = "set subtitle";
        subtitle.onclick = editData;

        loadFromSync(subtitle);
        await show.firstChild.after(subtitle);
    }
}

addSubTitles();