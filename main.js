logToConsole("Starting myshowsAT");

const placeholderText = "альтернативное название";
var mainContainer = null;
var changeObserver = null;

function logToConsole(message, type) {
    var css = "";
    paint = { // default colors
        clr: "#ffffff", bgc: "#5a3a60"
    };

    colors = {
        error: { clr: "#0d0d0d", bgc: "#e13b31" }, // red
        success: { clr: "#0d0d0d", bgc: "#25a0a1" }, // cyan
        warning: { clr: "#0d0d0d", bgc: "#f8ab4b" }, // orange
    };

    if (colors.hasOwnProperty(type)) {
        paint.clr = colors[type].clr; paint.bgc = colors[type].bgc;
    }

    css = "color: " + paint.clr +
        ";font-weight:bold; background-color: " + paint.bgc +
        ";padding: 3px 6px; border-radius: 5px;";

    console.log("MyshowsAT: %c" + message, css);
}

function saveToSync(id, value) {
    logToConsole("Saving to sync");

    browser.storage.sync.set({ [id]: value }, onSyncError);
}

function removeFromSync(id) {
    logToConsole("Removing from sync");

    browser.storage.sync.remove(id);

    logToConsole(".Unwatched-show is not a subtitle", "success");
}

function onSyncError(error) {
    if (error) {
        logToConsole(`${error}`, "error");
    }
}

function loadFromSync(subtitle) {
    logToConsole("Loading from sync");

    var subtitleTextFromStorage = browser.storage.sync.get(subtitle.id);

    subtitleTextFromStorage.then((res) => {
        if (typeof res[subtitle.id] !== 'undefined') {
            subtitle.textContent = res[subtitle.id];
            subtitle.style.color = 'black';
        }
    }, onSyncError);
}

function createInput(textElement) {
    logToConsole("Creating input");

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

    if (textElement.textContent != placeholderText) {
        input.value = textElement.textContent;
    }

    textElement.replaceWith(input);
    return input;
}

function editData(event) {
    logToConsole("Editing data");

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
    logToConsole("Loading subtitles");
    var showsList = mainContainer.querySelector('.ProfileShows-list');

    if (!showsList) {
        logToConsole("No .ProfileShows-list found", "error");
        return;
    }

    var unwatchedItems = showsList.querySelectorAll('div[id^="s"]');

    if (!unwatchedItems.length) {
        logToConsole("No unwatchedItems found", "error");
        return;
    }

    for (var unwatchedItem of unwatchedItems) {

        var unwatchedShow = unwatchedItem.querySelector('.Unwatched-show');

        if (!unwatchedShow) {
            logToConsole("No .Unwatched-show found", "error");
            return;
        }

        if (unwatchedItem.querySelector("subtitle")) {
            logToConsole(".Unwatched-show is subtitle", "warning");
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

    logToConsole("Subtitles added", "success");
}

function reactToLayoutChanged() {
    logToConsole("Change observed", "success");

    if (mainContainer.attributes[0].baseURI != "https://myshows.me/profile/") {
        logToConsole("Not at profile page", "warning");
        return;
    }

    logToConsole("Is at profile page", "success");

    loadSubtitles();
}

function startObservingLayoutWrapper() {
    logToConsole("Starting the LayoutWrapper observer");
    changeObserver = new MutationObserver(reactToLayoutChanged);
    changeObserver.observe(mainContainer, { attributes: true });
}

function reactToLastElementLoaded() {
    logToConsole("Last page element loaded", "success");

    if (mainContainer.attributes[0].baseURI != "https://myshows.me/profile/") {
        logToConsole("Not at profile page", "warning");
        startObservingLayoutWrapper();
        return;
    }

    logToConsole("Is at profile page", "success");

    startObservingLayoutWrapper();
    loadSubtitles();
};

function waitForLastElementLoaded() {
    logToConsole("Starting the last page element observer");
    changeObserver = new MutationObserver(reactToLastElementLoaded);
    changeObserver.observe(mainContainer, { childList: true });
}

function checkForMainContainer() {
    logToConsole("Searching for LayoutWrapper");
    mainContainer = document.querySelector('.LayoutWrapper');

    if (!mainContainer) {
        logToConsole("LayoutWrapper object not found", "warning");
        return;
    }

    logToConsole("LayoutWrapper found", "success");
    waitForLastElementLoaded();
}

function waitForPageLoad() {
    logToConsole("Checking page state");

    if (document.readyState === 'complete') {
        logToConsole("Page state:%c" + document.readyState, "success");
        checkForMainContainer();
        return;
    }

    logToConsole("Page state:%c" + document.readyState, "success");

    document.onreadystatechange = () => {
        if (document.readyState === 'complete') {
            logToConsole("Page state:%c" + document.readyState, "success");
            checkForMainContainer();
        }
    };
}

waitForPageLoad();
