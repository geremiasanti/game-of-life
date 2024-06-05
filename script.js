class Cell {
    constructor() {
        this.htmlElement = document.createElement("div");;
        this.state = 0;
    }
}

class Grid {
    constructor(htmlElement) {
        this.cellSizePx = 30;

        let windowHeight = window.innerHeight;
        let windowWidth = window.innerWidth;

        // calc rows and cols
        this.rows = Math.floor(windowHeight / this.cellSizePx);
        this.cols = Math.floor(windowWidth / this.cellSizePx);

        // init grid
        this.grid = new Array(this.rows).fill().map(
            (_) => new Array(this.cols).fill().map(
                (_) => new Cell()
            )
        );

        // grid style (to fit cols and rows
        this.htmlElement = htmlElement; 
        this.htmlElement.style.gridTemplateRows = `repeat(${this.rows}, ${this.cellSizePx}px)`;
        this.htmlElement.style.gridTemplateColumns = `repeat(${this.cols}, ${this.cellSizePx}px)`;
    }


    draw() {
        for(let row = 0; row < this.rows; row++) {
            for(let col = 0; col < this.cols; col++) {
                this.htmlElement.appendChild(this.grid[row][col].htmlElement);  
            } 
        } 
    }

    update() {
        for(let row = 0; row < this.rows; row++) {
            for(let col = 0; col < this.cols; col++) {
                if(this.grid[row][col].state == 1) {
                    this.grid[row][col].htmlElement.style.backgroundColor = "black"; 
                }
            }
        }
    }
}

function main() {
    let grid = new Grid(document.getElementById('grid'));
    grid.grid[1][1].state = 1;
    grid.draw();
    grid.update();
}

document.addEventListener("DOMContentLoaded", function() {
    main();
});

