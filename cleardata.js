function listenForClicks() {
    document.addEventListener("click", (e) => {

        if (e.target.type === "reset") {
            browser.storage.sync.clear();
            const content = document.querySelector('#resetContent');
            content.innerHTML = "Данные удалены. Обновите страницу.";
        }
    })
}

function reportExecuteScriptError(error) {
    console.error(`MyshowsAT error: ${error.message}`);
}

listenForClicks();