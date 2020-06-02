import { Collisions, Polygon } from "./node_modules/collisions/src/Collisions.mjs";

let myRobot;
let myGameArea;
let otherGamePiece;

const FIELD_DIMENSIONS = {
  width: 26 + 11.25 / 12,
  length: 52 + 5.25 / 12,
  ppf: 20
};
const GAME_PIECES = [
  {
    x: 140.0 / 12, y: 85.25 / 12, angle: 0,
    elements: [
      {
        color: "#fff",
        points: [[0, 0], [56.0 / 12, 0], [56.0 / 12, 12 + 9.5/12], [0, 12 + 9.5/12]]
      },
      {
        color: "#eee",
        points: [[2.5/12, 2.5/12], [53.5/12, 2.5/12], [53.5/12, 12.5], [2.5/12, 12.5]]
      },
      {
        color: "#666",
        points: [[4.0 / 12, 4.75 / 12], [4 + 4.0/12, 4.75 / 12], [4 + 4.0/12, 3 + 4.75/12], [4.0 / 12, 3 + 4.75/12]]
      },
      {
        color: "#666",
        points: [[4.0 / 12, 9 + 4.75/12], [4 + 4.0/12, 9 + 4.75/12], [4 + 4.0/12, 12 + 4.75/12], [4.0/12, 12 + 4.75/12]]
      },
      {
        color: "#ddd",
        points: [[1 + 8.5/12, 3 + 4.75/12], [2 + 11.5/12, 3 + 4.75/12], [2 + 11.5/12, 9 + 4.75/12], [1 + 8.5/12, 9 + 4.75/12]]
      }
    ]
  },
  {
    x: FIELD_DIMENSIONS.length - 196.0 / 12, y: 85.25 / 12, angle: 0,
    elements: [
      {
        color: "#fff",
        points: [[0, 0], [56.0 / 12, 0], [56.0 / 12, 12 + 9.5/12], [0, 12 + 9.5/12]]
      },
      {
        color: "#eee",
        points: [[2.5/12, 2.5/12], [53.5/12, 2.5/12], [53.5/12, 12.5], [2.5/12, 12.5]]
      },
      {
        color: "#666",
        points: [[4.0 / 12, 4.75 / 12], [4 + 4.0/12, 4.75 / 12], [4 + 4.0/12, 3 + 4.75/12], [4.0 / 12, 3 + 4.75/12]]
      },
      {
        color: "#666",
        points: [[4.0 / 12, 9 + 4.75/12], [4 + 4.0/12, 9 + 4.75/12], [4 + 4.0/12, 12 + 4.75/12], [4.0/12, 12 + 4.75/12]]
      },
      {
        color: "#ddd",
        points: [[1 + 8.5/12, 3 + 4.75/12], [2 + 11.5/12, 3 + 4.75/12], [2 + 11.5/12, 9 + 4.75/12], [1 + 8.5/12, 9 + 4.75/12]]
      }
    ]
  },
  {
    x: 261.47 / 12, y: 95.25 / 12, angle: 0, driveOver: true,
    elements: [
      {
        color: "red",
        points: [[0, 0], [0, 10 + 9.5/12], [4.5, 10 + 9.5/12], [4.5, 0]]
      }
    ]
  },
  {
    x: 261.47 / 12 + 4.5 + 1.25, y: 95.25 / 12, angle: 0, driveOver: true,
    elements: [
      {
        color: "blue",
        points: [[0, 0], [0, 10 + 9.5/12], [4.5, 10 + 9.5/12], [4.5, 0]]
      }
    ]
  },
  {
    x: 299.65 / 12, y: 71.57 / 12, angle: 0,
    elements: [
      {
        color: "#ddd",
        points: [[2.625, 3], [2.625, 12], [1.375, 12], [1.375, 3]]
      }
    ]
  },
  {
    x: 299.65 / 12, y: 71.57 / 12, angle: 0,
    elements: [
      {
        color: "#666",
        points: [[0, 0], [4, 0], [4, 3], [0, 3]]
      }
    ]
  },
  {
    x: 299.65 / 12, y: 71.57 / 12, angle: 0,
    elements: [
      {
        color: "#666",
        points: [[0, 12], [4, 12], [4, 15], [0, 15]]
      }
    ]
  }
];

const FRAME_INTERVAL = 20;
const ACCELERATION = 0.5;
const BUMPER = 7;
const DRIVES = {
  tank: {
    speedY: {
      speed: 1,
      friction: 1
    },
    speedX: {
      speed: 0,
      friction: 1
    },
    keyMap: {
      KeyW: { x: 0, y: -1, theta: 0 },
      KeyS: { x: 0, y: 1, theta: 0 },
      KeyA: { x: 0, y: 0, theta: -1 },
      KeyD: { x: 0, y: 0, theta: 1 }
    },
    orientation: "robot"
  },
  swerve: {
    speedX: {
      speed: 1,
      friction: 0.9
    },
    speedY: {
      speed: 1,
      friction: 0.9
    },
    keyMap: {
      KeyW: { x: 0, y: -1, theta: 0 },
      KeyS: { x: 0, y: 1, theta: 0 },
      KeyA: { x: -1, y: 0, theta: 0 },
      KeyD: { x: 1, y: 0, theta: 0 },
      ArrowRight: { x: 0, y: 0, theta: 1 },
      ArrowLeft: { x: 0, y: 0, theta: -1 }
    },
    orientation: "field"
  },
  mecanum: {
    speedX: {
      speed: 0.25,
      friction: 0.8
    },
    speedY: {
      speed: 1,
      friction: 0.8
    },
    keyMap: {
      KeyW: { x: 0, y: -1, theta: 0 },
      KeyS: { x: 0, y: 1, theta: 0 },
      KeyA: { x: -1, y: 0, theta: 0 },
      KeyD: { x: 1, y: 0, theta: 0 },
      ArrowRight: { x: 0, y: 0, theta: 1 },
      ArrowLeft: { x: 0, y: 0, theta: -1 }
    },
    orientation: "robot"
  },
};

function startGame() {
  myRobot = new MyRobot(28.0, 32.0, "red", 20, 10, 10.0, "swerve");
  otherGamePiece = new GameObject(10, 10, 0, [{ color: "black", points: [[-5,  5], [5, 5], [5, -5], [-5, -5]]}]);
  let gamePieces = GAME_PIECES.map(({ x, y, angle, elements, driveOver }) => new GameObject(x, y, angle, elements, false, !driveOver));
  myGameArea = new Field(FIELD_DIMENSIONS.length, FIELD_DIMENSIONS.width, [...gamePieces, myRobot], FRAME_INTERVAL);
  myGameArea.start();
  document.addEventListener("keydown", (e) => myGameArea.addKey(e.code));
  document.addEventListener("keyup", (e) => myGameArea.removeKey(e.code));
}

class Field {
  canvas;
  context;
  system;
  width = 0;
  height = 0;
  frameInterval = 0;
  elements = [];
  collisionElement;

  constructor(length, width, elements, frameInterval) {
    this.width = length * FIELD_DIMENSIONS.ppf;
    this.height = width * FIELD_DIMENSIONS.ppf;
    this.frameInterval = frameInterval;
    this.elements = elements;
    this.canvas = document.createElement("canvas");
    this.setCollisionElement();
    this.system = new Collisions();
    this.system.insert(
      ...(elements.filter((element) => element.doesCollide()).map((element) => element.getCollisionElement())),
      ...this.collisionElement
    );

    this.getContext = this.getContext.bind(this);
    this.updateGameArea = this.updateGameArea.bind(this);
    this.addKey = this.addKey.bind(this);
    this.removeKey = this.removeKey.bind(this);
  }

  start() {
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.context = this.canvas.getContext("2d");
    document.body.insertBefore(this.canvas, document.body.childNodes[0]);
    this.interval = setInterval(this.updateGameArea, FRAME_INTERVAL);
  }

  clear() {
    this.context.clearRect(0, 0, this.width, this.height);
  }

  getContext() {
    return this.context;
  }

  addKey(keyCode) {
    for (let gameObj of this.elements) {
      if (gameObj.hasKeyResponse()) {
        gameObj.addKey(keyCode);
      }
    }
  }

  removeKey(keyCode) {
    for (let gameObj of this.elements) {
      if (gameObj.hasKeyResponse()) {
        gameObj.removeKey(keyCode);
      }
    }
  }

  updateGameArea() {
    this.clear();
    for (let gameObj of this.elements) {
      gameObj.newPos();
    }
    this.system.update();
    for (let gameObj of this.elements) {
      gameObj.update(this.context);
    }
  }

  setCollisionElement() {
    this.collisionElement = [
      new Polygon(0, 0, [[0, 0], [this.width, 0]]),
      new Polygon(0, 0, [[this.width, 0], [this.width, this.height]]),
      new Polygon(0, 0, [[this.width, this.height], [0, this.height]]),
      new Polygon(0, 0, [[0, this.height], [0, 0]])
    ];
  }
}

class GameObject {
  x = 0;
  y = 0;
  speedX = 0;
  speedY = 0;
  fixed = true;
  angle = 0;
  elements = [];
  keyResponse = false;
  collisionElement;
  collision = true;

  constructor(x, y, angle, elements, keyResponse, collision = true) {
    let xPx = x * FIELD_DIMENSIONS.ppf;
    let yPx = y * FIELD_DIMENSIONS.ppf;
    this.x = xPx;
    this.y = yPx;
    this.angle = angle;
    this.elements = elements.map((element) => ({
      ...element,
      points: element.points.map((point) => [point[0] * FIELD_DIMENSIONS.ppf, point[1] * FIELD_DIMENSIONS.ppf])
    }));
    this.keyResponse = keyResponse;
    this.collisionElement = new Polygon(xPx, yPx, this.elements[0].points);
    this.collision = collision;
  }

  newPos() {}

  // elements = [{ color: "#xxxxxx", points: [[x, y], [x, y]]}, ...]
  update(ctx) {
    if (this.elements.length === 0) {
      return;
    }
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    for (let element of this.elements) {
      ctx.fillStyle = element.color;
      ctx.beginPath();
      ctx.moveTo(element.points[0][0], element.points[0][1]);
      for (let i = 1; i < element.points.length; i++) {
        let [ x, y ] = element.points[i];
        ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  };

  hasKeyResponse() {
    return this.keyResponse;
  }

  getCollisionElement() {
    return this.collisionElement;
  }

  setCoords(x, y) {
    this.x = x;
    this.y = y;
    this.collisionElement.x = x;
    this.collisionElement.y = y;
  }

  setAngle(angle) {
    this.angle = angle;
    this.collisionElement.angle = angle;
  }

  doesCollide() {
    return this.collision;
  }
}

class Robot extends GameObject {
  alliance = "red";
  maxSpeed = 0;
  drive = DRIVES.tank;
  directions = { x: 0, y: 0, theta: 0 };
  speedTheta = 0;

  constructor(width, height, alliance, x, y, maxSpeed, drive, keyResponse) {
    super(x, y, 0, [
      {
        color: alliance,
        points: [
          [ (width + BUMPER) / -24.0, (height + BUMPER) / -24.0 ],
          [ (width + BUMPER) / 24.0, (height + BUMPER) / -24.0 ],
          [ (width + BUMPER) / 24.0, (height + BUMPER) / 24.0 ],
          [ (width + BUMPER) / -24.0, (height + BUMPER) / 24.0 ]
        ]
      }, {
        color: "#ccc",
        points: [
          [ width / -24.0, height / -24.0 ],
          [ width / 24.0, height / -24.0 ],
          [ width / 24.0, height / 24.0 ],
          [ width / -24.0, height / 24.0 ]
        ]
      }, {
        color: "#f1f1f1",
        points: [
          [ width / -36.0, (height - 1) / -24.0 ],
          [ width / 36.0, (height - 1) / -24.0 ],
          [ width / 36.0, (height + BUMPER + 2) / -24.0 ],
          [ width / -36.0, (height + BUMPER + 2) / -24.0 ]
        ]
      },
    ], keyResponse, true);
    this.alliance = alliance;
    this.maxSpeed = maxSpeed;
    this.drive = DRIVES[drive];
    this.fixed = false;

    this.setSpeedX = this.setSpeedX.bind(this);
    this.setSpeedY = this.setSpeedY.bind(this);
    this.setSpeedTheta = this.setSpeedTheta.bind(this);
  }

  setSpeedX(speed) {
    this.speedX = speed;
  };

  setSpeedY(speed) {
    this.speedY = speed;
  };

  setSpeedTheta(speed) {
    this.speedTheta = speed;
  };

  getSpeed(direction, speed, setSpeed, maxSpeed) {
    if (direction === 0) {
      if (Math.abs(speed) > 0.01) {
        setSpeed(speed - Math.sign(speed) * FRAME_INTERVAL / (1000.0 * ACCELERATION));
      } else {
        setSpeed(0);
      }
    } else if (Math.abs(speed) < maxSpeed) {
      setSpeed(speed + direction * FRAME_INTERVAL / (1000.0 * ACCELERATION));
    }
  }

  newPos() {
    this.getSpeed(this.directions.x, this.speedX, this.setSpeedX, this.drive.speedX.speed);
    this.getSpeed(this.directions.y, this.speedY, this.setSpeedY, this.drive.speedY.speed);
    this.getSpeed(this.directions.theta, this.speedTheta, this.setSpeedTheta, 1);
    this.setAngle(this.angle + this.speedTheta * 0.75 / (Math.PI * 2));
    let { x, y } = this.drive.orientation === "field" ?
      { x: this.speedX, y: this.speedY } :
      rotatedCoords(this.speedX, this.speedY, this.angle);
    this.setCoords(this.x + x * this.maxSpeed, this.y + y * this.maxSpeed);
  }
}

class MyRobot extends Robot {
  result;

  constructor(width, height, alliance, x, y, maxSpeed, drive) {
    super(width, height, alliance, x, y, maxSpeed, drive, true);
    this.result = this.collisionElement.createResult();
    this.addKey = this.addKey.bind(this);
    this.removeKey = this.removeKey.bind(this);
  }

  addKey(keyCode) {
    if (!this.drive.keyMap[keyCode]) {
      return;
    }
    if (this.directions.y !== this.drive.keyMap[keyCode].y) {
      this.directions.y += this.drive.keyMap[keyCode].y;
    }
    if (this.directions.x !== this.drive.keyMap[keyCode].x) {
      this.directions.x += this.drive.keyMap[keyCode].x;
    }
    if (this.directions.theta !== this.drive.keyMap[keyCode].theta) {
      this.directions.theta += this.drive.keyMap[keyCode].theta;
    }
  };

  removeKey(keyCode) {
    if (!this.drive.keyMap[keyCode]) {
      return;
    }
    if (this.directions.y !== -this.drive.keyMap[keyCode].y) {
      this.directions.y -= this.drive.keyMap[keyCode].y;
    }
    if (this.directions.x !== -this.drive.keyMap[keyCode].x) {
      this.directions.x -= this.drive.keyMap[keyCode].x;
    }
    if (this.directions.theta !== -this.drive.keyMap[keyCode].theta) {
      this.directions.theta -= this.drive.keyMap[keyCode].theta;
    }
  }

  update(ctx) {
    this.handleCollisions();
    super.update(ctx);
  }

  handleCollisions() {
    let polygon = this.collisionElement;
    let potentials = polygon.potentials();
    for (let body of potentials) {
      if (polygon.collides(body, this.result)) {
        this.setCoords(
          this.x - this.result.overlap * this.result.overlap_x,
          this.y - this.result.overlap * this.result.overlap_y
        );
      }
    }
  }
}

function getAngle(mousePos, x, y) {
  return Math.atan((y - mousePos.y) / (x + 1.0 - mousePos.x)) + Math.PI / 2;
}

function getMousePos(gameArea, e) {
  let rect = gameArea.canvas.getBoundingClientRect();
  gameArea.mousePos = {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
}

function inToPx(inches) {
  return inches / 12.0 * FIELD_DIMENSIONS.ppf;
}

function rotatedCoords(x, y, angle) {
  return {
    x: x * Math.cos(angle) - y * Math.sin(angle),
    y: x * Math.sin(angle) + y * Math.cos(angle)
  }
}

window.onload = function() {
  startGame();
};