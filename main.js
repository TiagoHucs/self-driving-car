const canvas = document.getElementById('myCanvas');
canvas.width = 200;

const ctx = canvas.getContext('2d');
const road = new Road(canvas.width / 2, canvas.width * 0.9);

let cars = generateCars(500);
let bestCar = cars[0];

let traffic = generateTraffic(20);

animate();

function saveBrain() {
    localStorage.setItem("bestBrain", JSON.stringify(bestCar.brain));
}

function getBrain() {
    return JSON.parse(localStorage.getItem("bestBrain"));
}

function discard() {
    localStorage.removeItem("bestBrain");
}

function animate() {
    for (let i = 0; i < traffic.length; i++) {
        traffic[i].update(road.borders, []);
    }

    for (let i = 0; i < cars.length; i++) {
        cars[i].update(road.borders, traffic);
        if (cars[i].y < bestCar.y) {
            console.log('novo melhor carro');
            bestCar = cars[i];
        }
    }

    canvas.height = window.innerHeight;

    ctx.save();
    ctx.translate(0, -bestCar.y + canvas.height * 0.5)

    road.draw(ctx);

    for (let i = 0; i < traffic.length; i++) {
        traffic[i].draw(ctx, 'red');
    }

    for (let i = 0; i < cars.length; i++) {
        cars[i].draw(ctx, 'blue', cars[i] === bestCar);
    }

    ctx.restore();

    informations();

    requestAnimationFrame(animate);
}

function generateCars(n) {
    let cars = [];
    let bestBrain = getBrain();
    for (let i = 0; i < n; i++) {
        car = new Car(road.getLaneCenter(1), 100, 30, 50, 'AI');
        car.brain = bestBrain;
        if (i != 0) {
            mutateCar(car);
        }
        cars.push(car);
    }
    return cars;
}

function generateTraffic(n) {
    let carsTraffic = [];
    for (let i = 0; i < n; i++) {
        let distance = (i + 1) * 200;
        let lane = Math.floor(Math.random() * 3);
        carsTraffic.push(new Car(road.getLaneCenter(lane), -distance, 30, 50, 'DUMMY', 2));
        lane = Math.floor(Math.random() * 3);
        carsTraffic.push(new Car(road.getLaneCenter(lane), -distance, 30, 50, 'DUMMY', 2));
    }
    return carsTraffic;
}

function mutateCar(car) {
    if (localStorage.getItem("bestBrain")) {
        car.brain = getBrain();
        NeuralNetwork.mutate(car.brain, 0.1);
    }
}

function informations() {
    document.getElementById('message').innerHTML = 'population: ' + cars.filter(
        (car) => car.damaged == false
    ).length
}