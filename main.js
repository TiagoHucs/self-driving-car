const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 200;

const road = new Road(canvas.width / 2, canvas.width * 0.9);
const trafficDistance = 220;

let cars = createCars(500);
let bestCar = cars[0];
let traffic = createTraffic(10);

animate();

function animate() {
    updateTraffic();
    updateCars();

    canvas.height = window.innerHeight;

    ctx.save();
    ctx.translate(0, -bestCar.y + canvas.height * 0.5);

    drawScene();

    ctx.restore();

    filterObjects();

    updateUI();

    requestAnimationFrame(animate);

    if(cars.length < 1 || traffic.length < 1 || bestCar.y < -5000){
        //saveBrain();
        reloadPage();
    }
}

// === Lógica de atualização ===

function updateCars() {
    for (const car of cars) {
        car.update(road.borders, traffic);
        if (car.y < bestCar.y) bestCar = car;
    }
}

function updateTraffic() {
    for (const car of traffic) {
        car.update(road.borders, []);
    }
}

function filterObjects() {
    cars = cars.filter(car => !car.damaged && car.y < bestCar.y + 200);
    traffic = traffic.filter(car => car.y < bestCar.y + 300);
}

// === Criação de carros ===

function createCars(n) {
    const cars = [];
    const bestBrain = getBrain();

    for (let i = 0; i < n; i++) {
        const car = new Car(road.getLaneCenter(1), 100, 30, 50, 'AI');
        if (bestBrain) car.brain = JSON.parse(JSON.stringify(bestBrain));
        if (i !== 0) mutateCar(car);
        cars.push(car);
    }
    return cars;
}

function createTraffic(n) {
    const list = [];
    for (let i = 1; i <= n; i++) {
        for (let j = 0; j < 2; j++) {
            const lane = Math.floor(Math.random() * 3);
            list.push(
                new Car(
                    road.getLaneCenter(lane),
                    bestCar.y + i * -trafficDistance,
                    30, 50, 'DUMMY', 2
                )
            );
        }
    }
    return list;
}

// === Lógica de mutação e armazenamento ===

function mutateCar(car) {
    if (getBrain()) {
        NeuralNetwork.mutate(car.brain, 0.05);
    }
}

function saveBrain() {
    localStorage.setItem("bestBrain", JSON.stringify(bestCar.brain));
}

function getBrain() {
    const brain = localStorage.getItem("bestBrain");
    return brain ? JSON.parse(brain) : null;
}

function discard() {
    localStorage.removeItem("bestBrain");
}

function reloadPage() {
    location.reload();
}

// === UI / Desenho ===

function drawScene() {
    road.draw(ctx);

    for (const car of traffic) {
        car.draw(ctx, 'red');
    }

    for (const car of cars) {
        car.draw(ctx, 'blue', car === bestCar);
    }
}

function updateUI() {
    document.getElementById('population').textContent =
        'population: ' + cars.filter(car => !car.damaged).length;

    document.getElementById('distance').textContent =
        'distance: ' + Math.trunc(bestCar.y);

    document.getElementById('traffic').textContent =
        'traffic: ' + traffic.length;
}
