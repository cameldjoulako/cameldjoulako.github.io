/*
    Principe:
    Il est très simple. Je me donne un cadre(Div par exemple) avec une largeur et un hauteur.
    Je fait une subdivision de cette div sur forme de cahier quadriller. 
    Maintenant j'ai plusieurs blocs , 
    je peut représenter mon serpent par une succession de bloc et ma pomme est un bloc arrondi placé a une position aléatoire. 
    La tete duserpent étant le premier élément de son corps
 */

/*Definition d'une fonction qui va se lancer au demarrage*/
window.onload = function(){
    var canvasWidth = 700;
    var canvasHeight = 400;

    var blockSize = 9; //represente une portion du cadre
    var ctxs; //contexte de la zone score et autres fonctionnalité a ajouté
    var ctx; // contexte du Canvas principal du jeux

    var delay = 60;
    var xCoord = 0;
    var yCoord = 0;
    var isPause = false;
    var stateP = true;

    //variable pour creation d'un serpent
    var snakee;

    //variable pour creation de la pomme
    var applee; 

    // nombre de block suivant la largeur
    var widthInBlocks = canvasWidth/blockSize;

    // nombre de block suivant la hauteur
    var heightInBlocks = canvasHeight/blockSize;

    //score du jeux
    var score;

    var timeOut;
    
    init();
    
    //creation d'une fonction d'initialisation de la surface du jeux surface du jeu
    function init(){
        //creation d'un élement canvas dans le page pour le dessin
        var canvas = document.createElement('canvas');
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        canvas.style.border = "9px solid #1A3399";
        canvas.style.margin = "20px auto";
        canvas.style.display = "flex";
        canvas.style.backgroundColor = "#ddd";

        /*Canvas du score*/

        var canvasScore = document.createElement('canvas');
        canvasScore.width = canvasWidth;
        canvasScore.height = 35;
        canvasScore.style.border = "1px solid #1A3399";
        canvasScore.style.margin = "auto";
        canvasScore.style.display = "flex";
        canvasScore.style.backgroundColor = "#ddd";
         //Attachons notre élément canvasCore créer a la page html
        document.body.appendChild(canvasScore);

         //recupération du context du canvasScore pour dessiner en 2d et ajouter des elts
        ctxs = canvas.getContext('2d');



        //Attachons notre élément canvas créer a la page html
        document.body.appendChild(canvas);

        //recupération du context du canvas pour dessiner en 2d
        ctx = canvas.getContext('2d');

        //init du serpent creer : serpent du debut
        snakee = new Snake([[6,4],[5,4],[4,4],[3,4],[2,4]],"right");

        //creation de la pomme a consomé par le serpent
        applee = new Apple([20,22]);

        score = 0;

        //Rafraichissement du canvas
        refreshCanvas();
    }
    
    /*fonction de Rafraissichement du canvas pour faire avancer le canvas(zone de dessin) grace a des delais*/
    function refreshCanvas(){
        //on le fait avancer tous les 98mili second si pas de pause en cour
        if (!isPause) {
            snakee.advance();
        }
        
        /*On vérifi si lorsqu'on avence on a une collision*/
        if (snakee.checkCollision()){
            //jeux terminer
            gameOver();
        } else {
            //on vérifie si serpent a mangé la pomme passé en parametre
            if (snakee.isEatingApple(applee)){
                score++;
                snakee.ateApple = true;// le serpent a mangé une pomme

                /*Quand le serpent mange la pomme, on donne une nouvelle position a la pome
                 et on vérie si cette position est sur le sepent:
                 si c'est le cas on donne une nouvelle*/
                do {
                    applee.setNewPosition(); 
                } while(applee.isOnSnake(snakee));
            }

            /*
            Je dessigne a chaque fois un nouveau rectangle a une position donnée
            a chaque fois je met le rectangle a une nouvelle position
         */ 
            ctx.clearRect(0,0,canvasWidth,canvasHeight);

            //dessin de la zone du score
            drawScore();

            //on dessine le serpent
            snakee.draw();

            //on dessine la pomme a croqué car A chaque fois que le canvas est rafraichir, on doit dessigner la pomme*/
            applee.draw();

            timeOut = setTimeout(refreshCanvas,delay);
         }
    }

    function pause(){
        isPause = true;
        console.log("pause");
    }

    function play(){
        isPause = false;
        console.log("Play Game");
    }

    /*fONCTION QUI GERE*/
    function gameOver(){
        /*recuperation des parametres existant du Canvas*/
        ctx.save();

        ctx.font = "bold 20px sans-serif";
        ctx.fillStyle = "#000";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.strokeStyle = "white";
        ctx.lineWidth = 5;
        var centreX = canvasWidth / 2;
        var centreY = canvasHeight / 2;
        ctx.strokeText("Game Over", centreX, centreY - 180);
        ctx.fillText("Game Over", centreX, centreY - 180);
        ctx.font = "bold 30px sans-serif";
        ctx.strokeText("Appuyer sur la touche Espace pour rejouer", centreX, centreY - 120);
        ctx.fillText("Appuyer sur la touche Espace pour rejouer", centreX, centreY - 120);
        ctx.restore();
    }
    
    function restart(){
        snakee = new Snake([[6,4],[5,4],[4,4],[3,4],[2,4]],"down");
        applee = new Apple([10,10]);
        score = 0;

        //on efface l'ancien timeOut avant de lancer un nouveau refresh
        clearTimeout(timeOut);
        refreshCanvas();
    }

    
    function drawScore(){
        ctxs.save();
        ctxs.font = "bold 40px sans-serif";
        ctxs.fillStyle = "red";
        ctxs.textAlign = "center";
        ctxs.textBaseline = "middle";
        ctxs.fillText(score.toString(), 675, 35);
        ctxs.restore();
    }
    
    /*Function qui dessine un block prenant en parametre le  context et la position du block*/
    function drawBlock(ctx, position){
        var x = position[0]*blockSize;
        var y = position[1]*blockSize;
        ctx.fillRect(x,y,blockSize,blockSize);
    }
    
    /*Construction dune fonction constructeur pour la construction du serpent*/
    function Snake(body, direction){
        this.body = body;
        this.direction = direction;
        this.ateApple = false; // le serpent a manger une pomme : faux au debut du jeu
        
        /*fonction pour dessiner le corp de notre serpent
            le corp du serpent etant un ensemble de petit block comme une feuille de cahier quadrier
            chaque bloc ayant un x et un y et chaque block du serpent sera un tableau de 2 valeurs
            1ere = x
            2e = y
        */
        this.draw = function(){
            //sauvegarve du contenu du canvas existant
            ctx.save();

            //couleur du serpent
            ctx.fillStyle="#000000";

            //dessin du serpent
            for (var i=0 ; i < this.body.length ; i++){

                /* Appel de la Fonction drawblock qui est charger de dessiner un block :
                 on lui donne en parametre le contexte du canvas sur 
                 lequel il va dessiner et la position sur du block à dessiner*/
                drawBlock(ctx,this.body[i]);
            }

            ctx.restore();// on a dessiner sur le context et on le remmetre comme il était avant
        };
        
        /*méthode pour faire avancer le serpent*/
        this.advance = function(){

            //copie de la position suivant la tete
            var nextPosition = this.body[0].slice();

            //on change de  position suivant la direction
            switch(this.direction){
                case "left":
                    nextPosition[0] -= 1;
                    break;
                case "right":
                    nextPosition[0] += 1;
                    break;
                case "down":
                    nextPosition[1] += 1;
                    break;
                case "up":
                    nextPosition[1] -= 1;
                    break;
                default:
                    throw("invalid direction");
            }

            /*ajout au debut du corps du serpent du nextPposition*/
            this.body.unshift(nextPosition);

            /*Quand le serpent a manger une pomme*/
            if (!this.ateApple)
                //on eleve le dernier element
                this.body.pop();
            else
                this.ateApple = false;
        };
        

        this.setDirection = function(newDirection){
            var allowedDirections;
            switch(this.direction){
                case "left":
                case "right":
                    allowedDirections=["up","down"];
                    break;
                case "down":
                case "up":
                    allowedDirections=["left","right"];
                    break;  
               default:
                    throw("invalid direction");
            }

            /*vérification et autorisation de la direction a prendre par le serpent*/
            if (allowedDirections.indexOf(newDirection) > -1){
                this.direction = newDirection;
            }
        };
        
        /*Fonction qui vérifie si le serpent sort du Canvas et ou s'il se renferme sur lui meme*/
        this.checkCollision = function(){
            /*
                Je note ici deux maniere de perdre:
                1- le serpent coince le mur
                2- le serpent se mange

                pour savoir que le serpent fait une collision, j'ai vérifie si le x de sa tete = a un x d'un bloc definir hors du cadre
             */
            
            //collision avec le mur
            var wallCollision = false;

            //Le serpent passe lui meme sur son corps
            var snakeCollision = false;

            //recuperation de la tete du serpent
            var head = this.body[0];

            //reste du corps du serpent sauf sa tete
            var rest = this.body.slice(1);//copie sauf la val 0

            //Recupération de la tete du serpent de maniere  précise: position de longeur et largeur
            var snakeX = head[0];
            var snakeY = head[1];

            //position min de la tete
            var minX = 0;
            var minY = 0;

            //Max que peut atteindre la tete de serpent
            var maxX = widthInBlocks - 1;
            var maxY = heightInBlocks - 1;

            //collision mur gauche ou droite : recuperation
            var isNotBetweenHorizontalWalls = snakeX < minX || snakeX > maxX;

            //le serpent : collision mur du haut ou bas : recuperation
            var isNotBetweenVerticalWalls = snakeY < minY || snakeY > maxY;
            
            //on vérifie ou se trouve le serpent et on active les collision
            if (isNotBetweenHorizontalWalls || isNotBetweenVerticalWalls)
                wallCollision = true;
            
            //pour la collision du serpent sur lui meme, je vérifie juste si une partir de son corps(rest) en un moment donnée est
            //egale a sa tete.
            for (var i=0 ; i<rest.length ; i++){
                if (snakeX === rest[i][0] && snakeY === rest[i][1])
                    snakeCollision = true;
            }
            
            return wallCollision || snakeCollision;        
        };
        

        /*méthode qui vas se charger de vérifier si le serpent est entrain de manger la pomme et
         prend comme parametre les coordonées d'une pome : sa position*/
        this.isEatingApple = function(appleToEat){
            var head = this.body[0];/*on recupere la tete*/

            /*on vérifie si le x(appleToEat.position[0]) de la tete = corps en place 0 de meme etre sur le*/
            if (head[0] === appleToEat.position[0] && head[1] === appleToEat.position[1])
                return true;
            else
                return false;
        }
        
    }
    
    /*Function construction de la pomme que va manger le serpent
     Elle a besoin d'un bloc*/
    function Apple(position){
        //position sur le canvas
        this.position = position;
        
        //fonction pour designer la pome
        this.draw = function(){
            /*sauvegarve du contenu du canvas: juste pour ce souvenir des anciens parametres du context:
                par exemple pour dessiner la pomme, on voudra quelle soit de couleur verte ou rouge, or sans mettre le ctx.save() alors 
                tous les elements du canvas seront desormait vert
            */
          ctx.save();
          ctx.fillStyle = "#33cc33";
          ctx.beginPath();

           /*position x du rond :  */
          var radius = blockSize/2;
          var x = this.position[0]*blockSize + radius;
          var y = this.position[1]*blockSize + radius;

           /*fonction de dessin du cercle avec canvas*/
          ctx.arc(x, y, radius, 0, Math.PI*2, true);

          //remplissage du cercle designer
          ctx.fill();
          ctx.restore();
        };
        
        //Méthode pour donner une nouvelle position a la pome : random()
        this.setNewPosition = function(){
            var newX = Math.round(Math.random()*(widthInBlocks-1));
            var newY = Math.round(Math.random()*(heightInBlocks-1));
            this.position = [newX,newY];//on definir la prochaine prosition 
        }; 
        

        /*Methode qui permetra de vérifier si la position de la pomme généré est sur l'un des blocks du serpent*/
        this.isOnSnake = function(snakeToCheck){
            var isOnSnake = false; //non par defaut

            for (var i=0 ; i < snakeToCheck.body.length ; i++){

                //on verifie si le x de la pomme est sur le serpent et son y aussi
                if(this.position[0] === snakeToCheck.body[i][0] && this.position[1] === snakeToCheck.body[i][1]){
                    isOnSnake = true;     
                }
            }
            return isOnSnake;
        };

    }
    
    //lorsque les touches de  direction et P sont appuiyés:
    document.onkeydown = function handleKeyDown(e){
        var key = e.keyCode;
        var newDirection;
        switch(key){
            case 37:
                newDirection = "left";
                break;
            case 38:
                newDirection = "up";
                break;
            case 39:
                newDirection = "right";
                break;
            case 40:
                newDirection = "down";
                break;
            case 32:
                restart();
                return;
            case 80:
                if(stateP===true){
                    pause();
                    stateP=false;
                }else{
                    play();
                    stateP = true;
                }

                break;   
            default:
                return;
        }
        snakee.setDirection(newDirection);
    };
}

