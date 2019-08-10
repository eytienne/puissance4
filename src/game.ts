import 'font-awesome/css/font-awesome.css'
import 'root/public/style/pages/game.scss'
import * as $ from 'jquery'
import * as _ from 'lodash'

(window as any).$ = $;

$(function () {
	new GameBoard('table#gameTable > tbody:not(#token)');
	$('#againButton').click(function () {
		$('table#gameTable > tbody:not(#token)').off('click', 'td:not(.occupied)');
		new GameBoard('table#gameTable > tbody:not(#token)');
	})
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
	private matrix: JQuery<HTMLTableCellElement>[][] = [];
	private paused: boolean = false;

	constructor(selector: string) {
		const tbody = $(selector);
		tbody.empty();
		for (let j = 0; j < this.dimensions.height; j++) {
			const line = $('<tr></tr>').appendTo(tbody);
			this.matrix.push([]);
			for (let i = 0; i < this.dimensions.width; i++) {
				const cell = ($('<td></td>') as JQuery<HTMLTableCellElement>).appendTo(line).append(`<button class="inner"></button>`);
				this.matrix[j][i] = cell;
			}
		}

		const model = $(tbody.find('tr > td')[0])
		const tokenBody = tbody.parent().children('tbody#token')
		tokenBody.css({
			height: model.height(),
			width: model.width()
		})
		$(window).resize(function () {
			tokenBody.css({
				height: model.height(),
				width: model.width()
			})
		})

		const moveHandler: JQuery.EventHandlerBase<any, JQuery.ClickEvent> = async (e) => {
			console.log('step 0')
			if (this.paused)
				return
			this.paused = true;
			const target = $(e.currentTarget) as JQuery<HTMLElement>;
			++this.nbCoups;
			console.log('step 1')
			const currentColor = this.nbCoups % 2 === 1 ? this.colors[0] : this.colors[1];
			const position: Coords = {
				x: target.parent().children().index(target),
				y: target.parent().parent().children().index(target.parent())
			}
			console.log('step 2')
			while (position.y + 1 < this.dimensions.height && this.matrix[position.y + 1][position.x].is(':not(.occupied)'))
				++position.y

			const realTarget = this.matrix[position.y][position.x];
			console.log(await new Promise(function (resolve, reject) {
				console.log('step 3 : beg fall')
				tokenBody.css({
					display: 'block',
					left: realTarget[0].offsetLeft,
					top: 0,
				}).find('.inner').css('background-color', currentColor);

				console.log('step 3.1')
				const tf = _.throttle((...args) => console.log(...args), 1000);

				setTimeout(function fallAnimation() {
					// debugger
					console.log('step 3.2')
					const newTop = tokenBody[0].offsetTop + 10;
					tf('/!\\', newTop, tokenBody[0], realTarget[0])
					tokenBody.css('top', newTop);
					if (tokenBody[0].offsetTop >= realTarget[0].offsetTop) {
						console.log('step 3.3')
						tokenBody.css('display', 'none').find('.inner').css('background-color', 'transparent');
						resolve('step 4 : fall finished');
					} else {
						setTimeout(fallAnimation, 10 * (1 - Math.pow(tokenBody[0].offsetTop / tbody.height(), 2)));
					}
				}, 10);
			}));

			realTarget.addClass('occupied').attr('data-color', currentColor)

			const move = this.cellInfos(position);

			const best: [number, { direction: string, segment: ISegment }] = move.reduce((buf, e) => {
				const len = (e.direction === 'vertical' ? e.segment.end.y - e.segment.beg.y + 1 : e.segment.end.x - e.segment.beg.x + 1);
				return len > buf[0] ? [len, e] : buf;
			}, [1, null]);
			console.log(best);

			console.log('step 5')
			if (best[0] >= this.alignedToWin) {
				tbody.off('click', 'td:not(.occupied)', moveHandler);

				/* win animation */
				let toBlink: JQuery<HTMLTableCellElement>[] = [];
				switch ((best[1] as { direction: string }).direction) {
					case 'horizontal':
						toBlink = this.matrix[position.y].slice(best[1].segment.beg.x, best[1].segment.end.x + 1)
						break;
					case 'vertical':
						toBlink = this.matrix.slice(best[1].segment.beg.y, best[1].segment.end.y + 1).map(line => line[position.x])
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
				console.log(toBlink)
				toBlink.forEach(function (e: JQuery<HTMLTableCellElement>) {
					e.children(".inner").addClass('blink');
					setTimeout(function () {
						e.children(".inner").removeClass('blink')
					}, 2000);
				});

				setTimeout(function () {
					alert(`Le joueur ${currentColor === 'red' ? 'rouge' : 'jaune'} a gagné`);
				}.bind(this), 2000);
			}
			console.log('step 6')
			this.paused = false;
		}

		tbody.on('click', 'td:not(.occupied)', moveHandler);
	}

	private cellInfos({ x, y }: { x: number, y: number }) {
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

		return infos;
	}
}