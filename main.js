const placeholderText = "альтернативное название";
var mainContainer = null;
var changeObserver = null;

function saveToSync(id, value) {
    browser.storage.sync.set({ [id]: value }, onSyncError);
}

function removeFromSync(id) {
    browser.storage.sync.remove(id);
}

function onSyncError(error) {
    if (error) {
        console.warn(`myshowsAT Error: ${error}`);
    }
}

function loadFromSync(subtitle) {
    let subtitleTextFromStorage = browser.storage.sync.get(subtitle.id);

    subtitleTextFromStorage.then((res) => {
        if (typeof res[subtitle.id] !== 'undefined') {
            subtitle.textContent = res[subtitle.id];
            subtitle.style.color = 'black';
        }
    }, onSyncError);
}

function createInput(textElement) {
    var input = document.createElement("input");
    input.setAttribute("value", "");

    input.onkeydown = function (e) {
        if (e.key == "Enter") {
            document.activeElement.blur();
        }
    }

    input.onkeydown = function (e) {
        if (e.key == "Delete") {
            input.value = placeholderText;
            document.activeElement.blur();
        }
    }

    textElement.replaceWith(input);
    return input;
}

function editData(event) {
    var textElement = event.target;
    var input = createInput(textElement);

    const save = function () {
        const textElementNew = document.createElement(textElement.tagName.toLowerCase());
        textElementNew.onclick = editData;

        var newText = input.value;

        if (newText == placeholderText) {
            textElement.textContent = placeholderText;
            textElement.style.color = 'gray';
            input.replaceWith(textElement);
            removeFromSync(textElement.id);
            return;
        }

        if (newText == "") {

            input.replaceWith(textElement);
            return;
        }

        textElementNew.textContent = newText;
        input.replaceWith(textElementNew);
        saveToSync(textElement.id, newText);
    }

    input.addEventListener('blur', save, {
        once: true,
    });
    input.focus();
}

function loadSubtitles() {
    var showsList = mainContainer.querySelector('.ProfileShows-list');

    if (!showsList) {
        console.log("no showsList");
        return;
    }

    var unwatchedItems = showsList.querySelectorAll('div[id^="s"]');

    if (!unwatchedItems.length) {
        console.log("no unwatchedItems");
        return;
    }

    for (var unwatchedItem of unwatchedItems) {

        var unwatchedShow = unwatchedItem.querySelector('.Unwatched-show');

        if (!unwatchedShow) {
            console.log("no unwatchedShow");
            return;
        }

        if (unwatchedItem.querySelector("subtitle")) {
            console.log("is Subtitle");
            return;
        }

        var subtitle = document.createElement("subtitle");
        subtitle.textContent = placeholderText;
        subtitle.id = unwatchedItem.id;
        subtitle.onclick = editData;
        subtitle.style.color = 'gray';

        loadFromSync(subtitle);
        unwatchedItem.firstChild.after(subtitle);
    }
}

document.addEventListener('DOMContentLoaded', (event) => {
    mainContainer = document.querySelector('#__nuxt');

    changeObserver = new MutationObserver(mutations => {
        loadSubtitles();
    });

    const config = { attributes: true, subdtree: true, childList: true };
    changeObserver.observe(mainContainer, config);
});
