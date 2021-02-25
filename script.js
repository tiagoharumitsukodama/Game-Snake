"use strict";

let canvas = document.getElementById("id_canvas");
let context = canvas.getContext("2d");
let scoreHTML = document.getElementById("id_score");
let msgHTML = document.getElementById("id_message");
let image = new Image();

const SCREEN_SIZE = canvas.width;
const SIZE_DIVISION = 15;
const NUMBER_DIVISION = Math.floor(SCREEN_SIZE/SIZE_DIVISION);
image.src = "./imagem.png";


canvas.height = SCREEN_SIZE;

window.onload = function (){
    context.fillStyle = "back";
    context.fillRect(0, 0, SCREEN_SIZE, SCREEN_SIZE);
    context.drawImage(image, 50, 50);

    setTimeout(main, 2000)
}


function main(){

    let screen = new Screen(NUMBER_DIVISION,SCREEN_SIZE,SCREEN_SIZE);
    let snake = new Snake(NUMBER_DIVISION,SIZE_DIVISION);
    let food = new Food(2, 2, SIZE_DIVISION);
    let score = 0;
    let needPaintFood = true;
    let gapToCreateFood = 1000;
    let gapToRefresh = 60000/SCREEN_SIZE;


    window.addEventListener("keydown", (event) => {
        snake.setMoveDirection(event.keyCode)} );

    //loop
    let Interval = setInterval(play,parseInt(gapToRefresh));

    //main function
    function play(){

        snake.move();

            //can return -1, 0 or 1
        let status = snake.eat(food);

        if( status == -1 ){
            clearInterval(Interval);
            msgHTML.innerHTML = "GAME OVER"
        }
        if( status == 1 ){
            needPaintFood = false;
            score++
            scoreHTML.innerHTML = score.toString();

            setTimeout(() => {
                food = screen.createNewFood(snake);
                snake.growUp();
                needPaintFood = true;},
                gapToCreateFood
            );
        }

        screen.paintBackground(context);
        screen.paintFood(context, food, needPaintFood);
        screen.paintSnake(context, snake);
    }
}



// This class represent a Position.
class Position{
            /**
         * Create a object.
         * @param {Number} Px
         * @param {Number} Py
         * @param {Number} dimention
         */
        constructor(Px=0, Py=0, dimention){
            if( typeof Px!='number' || typeof Py!='number' )
                throw "The typeof some arguments isn't a Number";

            this.Px = Px;
            this.Py = Py;
            this.dimention = dimention;
}

        /**
         * Verify if both have the same positions.
         * @param {Position} OtherPosition 
         */
        isSamePosition(OtherPosition){

            if(!OtherPosition.isPosition())
                throw "May be the argument is not a Position";

            if( OtherPosition.isPosition() )
                return (OtherPosition.Px == this.Px) && (OtherPosition.Py == this.Py);
        }

        /**
         * To validate.
         */
        isPosition(){
            return true;
        }
}



// This class represent a Food.
class Food extends Position{
        /**
         * Create an object Food with its respective position
         * @param {Number} Px 
         * @param {Number} Py
         * @param {Number} dimention
         */
        constructor(Px=0, Py=0, dimention){
            super(Px, Py, dimention);
        }
}



//This class represent a Snake
class Snake{
        /**
         * Create an object Snake with its distance from wall.
         * @param {Number} sizeSquare 
         * @param {Number} dimention
         */
        constructor(sizeSquare,dimention){

            if( !Number.isInteger(sizeSquare) || sizeSquare<6 )
                throw "The typeof argument ins't a Number or the sizeSquare is smaller than necessary";
            
                let distanceToStart = parseInt(sizeSquare/2); 
                let p1 = new Position(distanceToStart   , distanceToStart, dimention);
                let p2 = new Position(distanceToStart -1, distanceToStart, dimention);
                let p3 = new Position(distanceToStart -2, distanceToStart, dimention);

                this.snakeTrail = [p1, p2, p3];
                this.Velocity = 1;
                this.Vx = 1;
                this.Vy = 0;
                this.dimention = dimention;
                this.changeDirection = false;
        }

        /**
         * Move the head of snake
         * @param {Number} keyCode 
         */
        move(){
            let positionHead = this.snakeTrail[0];
            let px = positionHead.Px;
            let py = positionHead.Py; 

            py += this.Vy;
            px += this.Vx;

            this.snakeTrail.pop();
            this.snakeTrail.unshift(new Position(px, py, this.dimention));
            this.changeDirection = false;
        }

        setMoveDirection(keyCode){

            if( this.changeDirection ) 
                return;

            //Is horizontal
            if(Math.abs(this.Vx)){
                switch(keyCode){
                    case 38: //Up
                        this.Vy = this.Velocity * (-1);
                        this.Vx = 0;
                        break;

                    case 40: //Down
                        this.Vy = this.Velocity;
                        this.Vx = 0;
                        break;
                }
            }
            //Is vertical
            else{
                switch(keyCode){
                    case 39://right
                        this.Vx = this.Velocity;
                        this.Vy = 0;
                        break;

                    case 37: //left
                        this.Vx = this.Velocity*(-1);
                        this.Vy = 0;
                        break;
                }
            }
            this.changeDirection = true;
        }

        /**
         * Check if snake eat the food or itself
         * @returns {Number} -1 if eat itself
         * @returns {Number} 1 if eat some food
         * @returns {Number} 0 if not eat
         *
         * @param {Position} foodPosition 
         */
        eat(food){
            if (!food.isPosition()) throw "The argument is not an Position";

            let [headPosition,...bodyPositions] = this.snakeTrail;

            if (headPosition.isSamePosition(food)) return 1;
            else if (bodyPositions.some( position => position.isSamePosition(headPosition) )) return -1;
            
            return 0;
        }       

        /**
         * Increase snake size.
         */
        growUp(){
            let positionHead = this.snakeTrail[0];
            this.snakeTrail.push(new Position( positionHead.Px, positionHead.Py, this.dimention ));
        }

        /**
         * To validate
         */
        isSnake(){
            return true;
        } 
}



// This class helps to print on canvas. Furthermore, apply the wall rules.
class Screen{

        /**
         * Create object Screen.
         * @param {Number} numberDivision 
         * @param {Number} screenWidth 
         * @param {Number} screenHeight 
         */
        constructor(numberDivision, screenWidth,screenHeight){
            this.screenHeight = screenHeight;
            this.screenWidth = screenWidth;
            this.numberDivision = numberDivision;
            this.sizeDivision = parseInt( screenHeight/numberDivision );
        }

        /**
         * To paint background on canvas.
         * @param {Context} context 
         */
        paintBackground(context){
            if (typeof context!='object' || context==null)
                throw "Incorrect argument";

            context.fillStyle = "black";
            context.fillRect(0, 0, this.screenWidth, this.screenHeight);
        }

        /**
         * To paint snake on canvas.
         * @param {Context} context 
         * @param {Snake} snake 
         */
        paintSnake(context,snake) {

            if (!snake.isSnake())
                throw "Incorrect argument.";

            let px, py;

            snake.snakeTrail.forEach( (position,indexOfTrail) => {
                
                //if snake crosses
                this.gameWall(snake.snakeTrail,position,indexOfTrail);

                px = position.Px*this.sizeDivision;
                py = position.Py*this.sizeDivision;

                context.fillStyle = "blue";
                context.fillRect(px,py,position.dimention,position.dimention);
            });
        }

        /**
         * To paint the food on canvas.
         * @param {Context} context 
         * @param {Food} food 
         * @param {boolean} need
         */
        paintFood(context,food,need) {

            if(!food.isPosition())
                throw "Incorrect argument";

            let px = food.Px*this.sizeDivision;
            let py = food.Py*this.sizeDivision;

            if(need){
                context.fillStyle = "red";
                context.fillRect( px, py, this.sizeDivision, this.sizeDivision );
            }
            else{
                context.fillStyle = "black";
                context.fillRect( px, py, this.sizeDivision, this.sizeDivision );
            }
        }

        /**
         * Create new food position.
         * @param {Snake} snake 
         */
        createNewFood(snake) {

            if(!snake.isSnake())
                throw "Incorrect argument";

            let Newpx = parseInt(this.numberDivision*Math.random());
            let Newpy = parseInt(this.numberDivision*Math.random());
            let Newposition = new Food(Newpx, Newpy, this.sizeDivision);

            let overLap = snake.snakeTrail.some( position => 
                position.isSamePosition(Newposition));
            
            while(overLap){
                Newpx = parseInt(this.numberDivision*Math.random());
                Newpy = parseInt(this.numberDivision*Math.random());
                Newposition.Px = Newpx;
                Newposition.Py = Newpy;

                overLap = snake.snakeTrail.some( position => 
                    position.isSamePosition(Newposition));
            }
            
            return Newposition;
        }

        /**
         * Apply the corrections if the snake crosses the wall.
         * @param {Array} snakeTrail 
         * @param {Position} position 
         * @param {Number} indexOfTrail 
         */
        gameWall(snakeTrail, position, indexOfTrail) {          

            if(position.Px >= this.numberDivision) 
                snakeTrail[indexOfTrail].Px = 0;
            if(position.Py >= this.numberDivision)
                snakeTrail[indexOfTrail].Py = 0;
            if(position.Px < 0)
                snakeTrail[indexOfTrail].Px = this.numberDivision;
            if(position.Py < 0)
                snakeTrail[indexOfTrail].Py = this.numberDivision;
        }
}
