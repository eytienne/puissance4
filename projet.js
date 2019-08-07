/* La détermination au hasard de la couleur des joueurs */

var welcome = 'Bienvenue sur le Puissance 4!';
alert(welcome);

var player1 = {
	name: 'Joueur 1',
	couleur: 'jaune',
};

var player2 = {
	name: 'Joueur 2',
	couleur: 'rouge',
};

player1.name = prompt('Entrer votre nom, joueur 1!');
if (player1.name === '') {
	player1.name = 'Joueur 1';
}

player2.name = prompt('Entrer votre nom, joueur 2!');
if (player2.name === '') {
	player2.name = 'Joueur 2';
}

var couleur = Math.random();
if (couleur < 0.5) {
	var nomPlayerUn = player1.name;
	player1.name = player2.name;
	player2.name = nomPlayerUn;
}

alert(player1.name + ' joue en ' + player1.couleur + ' et ' + player2.name + ' joue en ' + player2.couleur + '. Les jaunes commencent.')

/* Nos objets modèles pour faciliter et clarifier l'attribution des attricuts src et alt par la suite */

var jetonVide = new Image();
jetonVide.src = 'Images/jetonvide.png';
jetonVide.alt = 'Case vide';

var jetonJaune = new Image();
jetonJaune.src = 'Images/jetonjaune.png';
jetonJaune.alt = 'Case jaune';

var jetonRouge = new Image();
jetonRouge.src = 'Images/jetonrouge.png';
jetonRouge.alt = 'Case rouge';



var partieDeJeu = {
	name: 'Partie',
	nbCoups: 0,
};

/* Le début de la sélection des différents éléments correspondant à toutes les colonnes puis plus loin cellules de la grille de jeu */


/*
var para = document.getElementsByTagName('table');
var num = 1;
para.addEventListener("click",alenb());
num = 2;
para.click();
num = 3;
para.click();
function alenb(){
	alert(num);
}
*/

var tableauDeJeu = [];

var num_ligne = 0;
for (eLigne of document.getElementsByTagName('table')[0].children[0].children) {
	var ligne = [];
	var num_colonne = 0;
	for (eColonne of eLigne.children) {
		//console.log(caseJeu);
		eColonne.setAttribute("col", num_colonne);
		eColonne.setAttribute("lig", num_ligne);
		ligne.push(eColonne);
		caseJeu = eColonne.children[0];
		caseJeu.addEventListener("click", caseHandler);
		++num_colonne;
	}
	tableauDeJeu.push(ligne);
	++num_ligne;
}

// console.log("case du milieu haut");
// console.log(tableauDeJeu[2][3]);


function caseHandler(evt) {
	//console.log(evt.target.parentNode);
	var coupGagnant = coup(evt.target.parentNode.getAttribute("col"), evt.target.parentNode.getAttribute("lig"));
	if (coupGagnant) {
		alert("C'est gagné pour " + (partieDeJeu % 2 == 0 ? player1.name : player2.name));
	}
}


/* Voilà la variable très importante qui forme le coeur du jeu! */

function coup(c, l) {
	console.log("nb coups : " + partieDeJeu.nbCoups);
	c = Number(c);
	l = Number(l);
	var jetonCourant = new Image();
	jetonCourant.src = (partieDeJeu.nbCoups % 2 == 0 ? jetonJaune.src : jetonRouge.src);
	jetonCourant.alt = (partieDeJeu.nbCoups % 2 == 0 ? jetonJaune.alt : jetonRouge.alt);
	tableauDeJeu[l][c].children[0].src = jetonCourant.src;
	tableauDeJeu[l][c].children[0].alt = jetonCourant.alt;

	//gestion de la complétion en colonne
	var ret = true;
	var ligneCoulissante = l;
	while (ligneValide(ligneCoulissante - 1) &&
		tableauDeJeu[ligneCoulissante - 1][c].children[0].src == jetonCourant.src) {
		ligneCoulissante--;
	}
	var i = 1;
	for (i = 1; i < 4; ++i) {
		console.log("verif case " + c + " " + (ligneCoulissante + i));
		if (ligneValide(ligneCoulissante + i)) {
			if (ret && tableauDeJeu[ligneCoulissante + i][c].children[0].src != jetonCourant.src)
				ret = false;
		} else
			ret = false;
	}
	if (ret) {
		partieDeJeu.nbCoups++;
		return ret;
	}
	//gestion de la complétion en ligne
	ret = true;
	var colonneCoulissante = c;
	while (colonneValide(colonneCoulissante - 1) &&
		tableauDeJeu[l][colonneCoulissante - 1].children[0].src == jetonCourant.src) {
		colonneCoulissante--;
	}
	for (i = 1; i < 4; ++i) {
		if (colonneValide(colonneCoulissante + i)) {
			console.log("verif case " + (colonneCoulissante + i) + " " + l);
			if (ret && tableauDeJeu[l][colonneCoulissante + i].children[0].src != jetonCourant.src)
				ret = false;
		} else
			ret = false;

	}
	if (ret) {
		partieDeJeu.nbCoups++;
		return ret;
	}
	//gestion de la complétion en diagonale croissante
	ret = true;
	colonneCoulissante = c;
	ligneCoulissante = l;
	while (colonneValide(colonneCoulissante - 1) && ligneValide(ligneCoulissante - 1) &&
		tableauDeJeu[l][colonneCoulissante - 1].children[0].src == jetonCourant.src) {
		colonneCoulissante--;
		ligneCoulissante--;
	}
	for (i = 1; i < 4; ++i) {
		if (colonneValide(colonneCoulissante + i) && ligneValide(ligneCoulissante + i)) {
			console.log("verif case " + (colonneCoulissante + i) + " " + (ligneCoulissante + i));
			if (ret && tableauDeJeu[ligneCoulissante + i][colonneCoulissante + i].children[0].src != jetonCourant.src)
				ret = false;
		} else
			ret = false;
	}
	if (ret) {
		partieDeJeu.nbCoups++;
		return ret;
	}
	//gestion de la complétion en diagonale décroissante pour 
	partieDeJeu.nbCoups++;
	return false;
}

function colonneValide(i) {
	return i >= 0 && i < 7;
}

function ligneValide(i) {
	return i >= 0 && i < 6;
}