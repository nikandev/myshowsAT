const placeholderText = "альтернативное название";
const mainContainer = document.querySelector('#__nuxt');
var changeObserver;

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
            subtitle.innerHTML = res[subtitle.id];
            subtitle.style.color = 'black';
        }
    }, onSyncError);
}

function createInput(textElement)
{
    var input = document.createElement("input");
    input.setAttribute("value", "");
    
    input.onkeydown = function(e){
        if(e.key == "Enter"){
            document.activeElement.blur();
        }
    }

    input.onkeydown = function(e){
        if(e.key == "Delete"){
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

        if (newText == placeholderText)
        {
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
    var observedElement = mainContainer.querySelector('.ProfileShows-list');

    if (!observedElement) {
        return;
    }

    var shows = observedElement.querySelectorAll('div[id^="s"]');

    if (!shows.length) {
        return;
    }


    for (var show of shows) {
        if (show.querySelector("subtitle")) {
            return;
        }

        var subtitle = document.createElement("subtitle");
        subtitle.id = show.id;
        subtitle.style.color = 'gray';
        subtitle.innerHTML = placeholderText;
        subtitle.onclick = editData;

        loadFromSync(subtitle);
        show.firstChild.after(subtitle);
    }
}

const pageChanged = (mutationList, observer) => {
    loadSubtitles();
};

function initChangeObserver() {
    changeObserver = new MutationObserver(pageChanged);
    const config = { childList: true };
    changeObserver.observe(mainContainer, config);
};
initChangeObserver();
loadSubtitles();

