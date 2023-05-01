function onWindowClose() {
    Neutralino.app.exit();
}

async function downloadGame() {
    const data = await fetch('https://raw.githubusercontent.com/ADIBzTER/borang/master/public/ads.txt')
    alert(await data.text());
    // Neutralino.os.execCommand('..\\HoloCure.exe');
}

function launchGame() {
    Neutralino.os.execCommand('..\\HoloCure.exe');
}

Neutralino.init();
Neutralino.events.on("windowClose", onWindowClose);
