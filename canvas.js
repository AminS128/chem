
const c = document.getElementById('canvas-main')
const ctx = c.getContext('2d')

const canvas = {
    drawTimer: null,
    draw: function () {
        canvas.clearScreen();
        phys.iterate();
        phys.display();
        if (currentScenario.updateFunc) { currentScenario.updateFunc(); }
    },
    clearScreen: function () {
        // clear screen
        ctx.fillStyle = "#000000";
        ctx.fillRect(-100, -100, 6000, 6000);
    },
    drawCircle: function (x, y, r, col = "#ffffff") {
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, 6.283);
        ctx.fill();
    },
    startSim: function () {
        phys.reset();
        phys.init();
        canvas.drawTimer = setInterval(
            canvas.draw,
            (1000 / config.targetFPS)
        );

        document.getElementById('button-start-stop').innerText = 'Stop Simulation';
        document.getElementById('button-pause-resume').disabled = false;
        document.getElementById('button-pause-resume').innerText = 'Pause Sim.';
    },
    pauseSim: function () {
        if (canvas.drawTimer) {
            clearTimeout(canvas.drawTimer);
            canvas.drawTimer = null;
            document.getElementById('button-pause-resume').innerText = 'Resume Sim.';
            document.getElementById('button-start-stop').innerText = 'Restart Simulation';
        } else {
            canvas.drawTimer = setInterval(canvas.draw, (1000 / config.targetFPS));
            document.getElementById('button-pause-resume').innerText = 'Pause Sim.';
            document.getElementById('button-start-stop').innerText = 'Stop Simulation';
        }

    },
    stopSim: function () {
        clearTimeout(canvas.drawTimer);
        canvas.drawTimer = null;
        phys.reset();
        canvas.clearScreen();

        document.getElementById('button-start-stop').innerText = 'Start Simulation';
        document.getElementById('button-pause-resume').disabled = true;
    },
    toggleSim: function () {
        if (this.drawTimer == null) { this.startSim(); } else { this.stopSim(); }
    },
};
