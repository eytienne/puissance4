import 'font-awesome/css/font-awesome.css'
import 'root/public/style/pages/game.scss'
import * as $ from 'jquery'

(window as any).$ = $;

$(function () {
	var gb = new GameBoard('table#gameTable > tbody:not(#token)');
});

interface Coords {
	y: number
	x: number
}
interface ISegment {
	beg: Coords
	end: Coords
}

class GameBoard {
	private nbCoups = 0;
	private dimensions = {
		height: 6,
		width: 7,
	};
	readonly alignedToWin = 4;
	private colors = Math.random() < 0.5 ? ['red', 'yellow'] : ['yellow', 'red'];
	private tbody: JQuery<HTMLElement>;
	private matrix: JQuery<HTMLTableCellElement>[][] = [];

	constructor(selector: string) {
		const tbody = this.tbody = $(selector);
		tbody.empty();
		for (let j = 0; j < this.dimensions.height; j++) {
			const line = $('<tr></tr>').appendTo(tbody);
			this.matrix.push([]);
			for (let i = 0; i < this.dimensions.width; i++) {
				const cell = ($('<td></td>') as JQuery<HTMLTableCellElement>).appendTo(line).append(`<button class="inner"></button>`);
				this.matrix[j][i] = cell;
			}
		}
		const model = $(tbody.children('tr > td')[0]);
		tbody.parent().children('tbody#token').css({
			height: model.height(),
			width: model.width()
		});

		const moveHandler: JQuery.EventHandlerBase<any, JQuery.ClickEvent> = (e) => {
			const target = $(e.currentTarget) as JQuery<HTMLElement>;
			++this.nbCoups;
			const position: Coords = {
				x: target.parent().children().index(target),
				y: target.parent().parent().children().index(target.parent())
			}
			while (position.y + 1 < this.dimensions.height && this.matrix[position.y + 1][position.x].is(':not(.occupied)'))
				++position.y

			this.matrix[position.y][position.x].addClass('occupied').attr('data-color', (this.nbCoups % 2 === 1 ? this.colors[0] : this.colors[1]))

			const move = this.cellInfos(position);

			const best: [number, { direction: string, segment: ISegment }] = move.reduce((buf, e) => {
				const len = (e.direction === 'vertical' ? e.segment.end.y - e.segment.beg.y + 1 : e.segment.end.x - e.segment.beg.x + 1);
				return len > buf[0] ? [len, e] : buf;
			}, [1, null]);
			console.log(best);

			if (best[0] >= this.alignedToWin) {
				tbody.off('click', 'td', moveHandler);
				let toBlink: JQuery<HTMLTableCellElement>[] = [];
				switch ((best[1] as { direction: string }).direction) {
					case 'horizontal':
						toBlink = this.matrix[position.y].slice(best[1].segment.beg.x, best[1].segment.end.x + 1)
						break;
					case 'vertical':
						this.matrix.slice(best[1].segment.beg.y, best[1].segment.end.y + 1).map(line => line[position.x])
						break;
					case 'descendant':
						for (let y = best[1].segment.beg.y, x = best[1].segment.beg.x;
							y <= best[1].segment.end.y && x <= best[1].segment.end.x;
							++y, ++x) {
							toBlink.push(this.matrix[y][x]);
						}
						break;
					case 'ascendant':
						for (let y = best[1].segment.beg.y, x = best[1].segment.beg.x;
							y >= best[1].segment.end.y && x <= best[1].segment.end.x;
							--y, ++x) {
							toBlink.push(this.matrix[y][x])
						}
						break;
					default:
						throw new Error("Invalid direction !");
				}
				toBlink.forEach(function (e: JQuery<HTMLTableCellElement>) {
					e.children(".inner").addClass('blink');
					setTimeout(function () {
						e.children(".inner").removeClass('blink')
					}, 2000);
				});
				setTimeout(function () {
					alert(`Le joueur ${(this.nbCoups % 2 === 1 ? this.colors[0] : this.colors[1]) === 'red' ? 'rouge' : 'jaune'} a gagné`);
					// new GameBoard(tbody.get(0));
				}.bind(this), 2000);
			}
		}

		tbody.on('click', 'td:not(.occupied)', moveHandler);
	}

	private cellInfos({ x, y }: { x: number, y: number }) {
		const tbody = this.tbody;
		const currentColor = this.matrix[y][x].attr('data-color')
		const infos: { direction: string, segment: ISegment }[] = [];

		/* letters after x : 'l' for lower and 'u' for upper */

		/* horizontal check */
		let xl = x, xu = x;

		while (xl - 1 >= 0 && this.matrix[y][xl - 1].attr('data-color') === currentColor)
			--xl;
		while (xu + 1 < this.dimensions.width && this.matrix[y][xu + 1].attr('data-color') === currentColor)
			++xu;
		infos.push({
			direction: 'horizontal',
			segment: {
				beg: { y: y, x: xl },
				end: { y: y, x: xu },
			}
		});

		/* vertical check */
		let yl = y, yu = y;
		while (yl - 1 >= 0 && this.matrix[yl - 1][x].attr('data-color') === currentColor)
			--yl;
		while (yu + 1 < this.dimensions.height && this.matrix[yu + 1][x].attr('data-color') === currentColor)
			++yu;
		infos.push({
			direction: 'vertical',
			segment: {
				beg: { y: yl, x: x },
				end: { y: yu, x: x },
			}
		});

		/* descendant diagonal check */
		let lc = { x: x, y: y },
			uc = { x: x, y: y };
		while ((lc.x - 1) >= 0 && (lc.y - 1) >= 0 && this.matrix[lc.y - 1][lc.x - 1].attr('data-color') === currentColor)
			--lc.x && --lc.y
		while ((uc.x + 1) < this.dimensions.width && (uc.y + 1) < this.dimensions.height && this.matrix[uc.y + 1][uc.x + 1].attr('data-color') === currentColor)
			++uc.x && ++uc.y
		infos.push({
			direction: 'descendant',
			segment: {
				beg: lc,
				end: uc
			}
		});

		/* ascendant diagonal check */
		lc = { x: x, y: y };
		uc = { x: x, y: y };
		while ((lc.x - 1) >= 0 && (lc.y + 1) < this.dimensions.height && this.matrix[lc.y + 1][lc.x - 1].attr('data-color') === currentColor)
			--lc.x && ++lc.y
		while ((uc.x + 1) < this.dimensions.width && (uc.y - 1) >= 0 && this.matrix[uc.y - 1][uc.x + 1].attr('data-color') === currentColor)
			++uc.x && --uc.y
		infos.push({
			direction: 'ascendant',
			segment: {
				beg: lc,
				end: uc
			}
		});

		console.log({ x: x, y: y })
		console.log(currentColor)
		console.log(infos);
		return infos;
	}
}