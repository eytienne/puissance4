import 'font-awesome/css/font-awesome.css'
import 'root/public/style/pages/game.scss'
import $ from 'jquery'

console.log($);

let couleurs = ['red', 'yellow']
if (Math.random() < 0.5)
	couleurs = [couleurs[1], couleurs[0]]

const game = {
	nbCoups: 0,
	board: {
		height: 6,
		width: 7,
	},
};

const tableauDeJeu = [];

$(function () {
	for (let i = 0; i < game.board.height; i++) {
		const line = $("<tr></tr>").appendTo("table#gameTable > tbody");
		for (let j = 0; j < game.board.width; j++) {
			$("<td></td>").appendTo(line).append(`<div class="inner"></div>`);
		}
	}
})

function caseHandler(evt) {
	const winningMove = coup(evt.target.parentNode.getAttribute("col"), evt.target.parentNode.getAttribute("lig"));
	if (winningMove) {
		alert("C'est gagné pour " + (game % 2 == 0 ? player1.name : player2.name));
	}
}

function coup(c, l) {
	console.log("nb coups : " + game.nbCoups);
	c = Number(c);
	l = Number(l);
	const jetonCourant = new Image();
	jetonCourant.src = (game.nbCoups % 2 == 0 ? jetonJaune.src : jetonRouge.src);
	jetonCourant.alt = (game.nbCoups % 2 == 0 ? jetonJaune.alt : jetonRouge.alt);
	tableauDeJeu[l][c].children[0].src = jetonCourant.src;
	tableauDeJeu[l][c].children[0].alt = jetonCourant.alt;

	//gestion de la complétion en colonne
	const ret = true;
	const ligneCoulissante = l;
	while (ligneValide(ligneCoulissante - 1) &&
		tableauDeJeu[ligneCoulissante - 1][c].children[0].src == jetonCourant.src) {
		ligneCoulissante--;
	}
	const i = 1;
	for (i = 1; i < 4; ++i) {
		console.log("verif case " + c + " " + (ligneCoulissante + i));
		if (ligneValide(ligneCoulissante + i)) {
			if (ret && tableauDeJeu[ligneCoulissante + i][c].children[0].src != jetonCourant.src)
				ret = false;
		} else
			ret = false;
	}
	if (ret) {
		game.nbCoups++;
		return ret;
	}
	//gestion de la complétion en ligne
	ret = true;
	const colonneCoulissante = c;
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
		game.nbCoups++;
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
		game.nbCoups++;
		return ret;
	}
	//gestion de la complétion en diagonale décroissante pour 
	game.nbCoups++;
	return false;
}

function colonneValide(i) {
	return i >= 0 && i < 7;
}

function ligneValide(i) {
	return i >= 0 && i < 6;
}