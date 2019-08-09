import 'font-awesome/css/font-awesome.css'
import 'root/public/style/pages/game.scss'
import $ from 'jquery'

window.$ = $;

$(function () {
	var gb = new GameBoard('table#gameTable > tbody:not(#token)');
});

class GameBoard {

	nbCoups = 0
	dimensions = {
		height: 6,
		width: 7,
	}

	constructor(selector) {
		console.log('init')

		this.colors = ['red', 'yellow'];
		if (Math.random() < 0.5)
			this.colors = ['yellow', 'red']

		const tbody = this.tbody = $(selector);

		this.matrix = [];
		tbody.empty();
		for (let j = 0; j < this.dimensions.height; j++) {
			const line = $('<tr></tr>').appendTo(tbody);
			this.matrix.push([]);
			for (let i = 0; i < this.dimensions.width; i++) {
				const cell = $('<td></td>').appendTo(line).append(`<button class="inner"></button>`);
				this.matrix[j][i] = cell;
			}
		}
		const model = $(tbody.children('tr > td')[0]);
		tbody.parent().children('tbody#token').css({
			height: model.height(),
			width: model.width()
		});

		const moveHandler = (e) => {
			const target = $(e.currentTarget);
			++this.nbCoups;
			target.addClass('occupied').attr('data-color', (this.nbCoups % 2 === 1 ? this.colors[0] : this.colors[1]))
			const position = {
				x: target.parent().children().index(target),
				y: target.parent().parent().children().index(target.parent())
			}
			const move = this.cellInfos(position);
			if (Object.values(move).reduce((max, e) => e > max ? e : max, 1) >= 4) {
				tbody.off('click', 'td', moveHandler);
				alert(`Le joueur ${(this.nbCoups % 2 === 1 ? this.colors[0] : this.colors[1]) === 'red' ? 'rouge' : 'jaune'} a gagné`);
				new GameBoard(tbody.get(0));
			}
		}

		tbody.on('click', 'td', moveHandler);
	}

	cellInfos({ x, y }) {
		const tbody = this.tbody;
		const currentColor = this.matrix[y][x].attr('data-color')
		const infos = {};

		/* letters after x : 'l' for lower and 'u' for upper */

		/* horizontal check */
		let xl = x, xu = x;

		while (xl - 1 >= 0 && this.matrix[y][xl - 1].attr('data-color') === currentColor)
			--xl;
		while (xu + 1 < this.dimensions.width && this.matrix[y][xu + 1].attr('data-color') === currentColor)
			++xu;
		infos.horizontal = xu - xl + 1;

		/* vertical check */
		let yl = y, yu = y;
		while (yl - 1 >= 0 && this.matrix[yl - 1][x].attr('data-color') === currentColor)
			--yl;
		while (yu + 1 < this.dimensions.height && this.matrix[yu + 1][x].attr('data-color') === currentColor)
			++yu;
		infos.vertical = yu - yl + 1;

		/* descendant diagonal check */
		let lc = { x: x, y: y },
			uc = { x: x, y: y };
		while ((lc.x - 1) >= 0 && (lc.y - 1) >= 0 && this.matrix[lc.y - 1][lc.x - 1].attr('data-color') === currentColor)
			--lc.x && --lc.y
		while ((uc.x + 1) < this.dimensions.width && (uc.y + 1) < this.dimensions.height && this.matrix[uc.y + 1][uc.x + 1].attr('data-color') === currentColor)
			++uc.x && ++uc.y
		infos.descendant = uc.x - lc.x + 1;

		/* ascendant diagonal check */
		lc = { x: x, y: y };
		uc = { x: x, y: y };
		while ((lc.x - 1) >= 0 && (lc.y + 1) < this.dimensions.height && this.matrix[lc.y + 1][lc.x - 1].attr('data-color') === currentColor)
			--lc.x && ++lc.y
		while ((uc.x + 1) < this.dimensions.width && (uc.y - 1) >= 0 && this.matrix[uc.y - 1][uc.x + 1].attr('data-color') === currentColor)
			++uc.x && --uc.y
		infos.ascendant = uc.x - lc.x + 1;

		console.log({ x: x, y: y })
		console.log(currentColor)
		console.log(infos)
		return infos
	}

}