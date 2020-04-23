const app = new PIXI.Application(
    {
        width: 800,
        height: 600,
        backgroundColor: 0xAAAAAA
    }
);

document.body.appendChild(app.view);

class listenKeys {
    constructor() {
        this.keys = {};
        this.listenKeys();
    }

    listenKeys() {
        const keysPressed = e => {
            console.log(e.keyCode);
        };

        const keysReleased = e => {
        };

        window.onkeydown = keysPressed;
        window.onkeyup = keysReleased;
    }
}

const listener = new listenKeys();

// Listen for animate update
app.ticker.add(delta => {
    listener.listenKeys()
});