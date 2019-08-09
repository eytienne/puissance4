
interface ICoords {
	y: number
	x: number
}
class Coords implements ICoords {
	y: number
	x: number
	constructor(y: number, x: number) {
		this.y = y;
		this.x = x;
	}
}

interface ISegment {
	beg: Coords
	end: Coords
	length(): number
}

class Segment implements ISegment {
	beg: Coords
	end: Coords

	constructor(beg: Coords, end: Coords) {
		this.beg = beg;
		this.end = end;
	}

	length(): number {
		return Math.sqrt(Math.pow(this.beg.y - this.end.y, 2) + Math.pow(this.beg.x - this.end.x, 2));
	}
}
const seg = new Segment(new Coords(1, 1), new Coords(2, 2));
console.log("res : ", seg.length());