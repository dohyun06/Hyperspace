export class Graph {
  constructor(data) {
    this.data = data;
    this.dots = this.data.dotObject;
    this.lines = this.data.lineObject;
    this.faces = this.data.faceObject;

    this.lc = this.data.centerLine;
    this.proj = this.data.proj;
    this.rorate = this.data.rorate; // [xy, xz, xw, yz, yw, wz]

    this.scale = 50;
  }

  resize(width, height) {
    this.centerX = width / 2;
    this.centerY = height / 2;
  }

  draw(ctx) {
    this.lc = this.data.centerLine;
    this.proj = this.data.proj;

    const iter = Object.keys(this.dots);
    let transCoord = {};

    for (let i = 0; i < iter.length; i++) {
      transCoord[iter[i]] =
        this.proj === 'pers'
          ? this.perspectiveCoord(this.rorateCoord(this.dots[iter[i]]))
          : this.orthogonalCoord(this.rorateCoord(this.dots[iter[i]]));

      ctx.beginPath();
      ctx.arc(transCoord[iter[i]][0], transCoord[iter[i]][1], 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgb(0, 0, 0)';
      ctx.fill();
    }

    for (let i = 0; i < this.lines.length; i++) {
      ctx.beginPath();
      ctx.moveTo(transCoord[this.lines[i][0]][0], transCoord[this.lines[i][0]][1]);
      ctx.lineTo(transCoord[this.lines[i][1]][0], transCoord[this.lines[i][1]][1]);
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#000000';
      ctx.stroke();
    }

    for (let i = 0; i < this.faces.length; i++) {
      ctx.beginPath();
      ctx.moveTo(transCoord[this.faces[i][0]][0], transCoord[this.faces[i][0]][1]);
      for (let j = 1; j < this.faces[i].length; j++) {
        ctx.lineTo(transCoord[this.faces[i][j]][0], transCoord[this.faces[i][j]][1]);
      }
      ctx.lineTo(transCoord[this.faces[i][0]][0], transCoord[this.faces[i][0]][1]);
      ctx.fillStyle = 'rgba(125, 190, 255, 0.15)';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#000000';
      ctx.stroke();
    }
  }

  rorateCoord(coord) {
    let x = coord[0];
    let y = coord[1];
    let z = coord[2];
    let w = coord[3];
    let tx = 0;
    let ty = 0;
    let tz = 0;
    let tw = 0;

    tx = x * Math.cos(this.rorate[0]) - y * Math.sin(this.rorate[0]);
    ty = x * Math.sin(this.rorate[0]) + y * Math.cos(this.rorate[0]);
    x = tx;
    y = ty;
    tx = x * Math.cos(this.rorate[1]) - z * Math.sin(this.rorate[1]);
    tz = x * Math.sin(this.rorate[1]) + z * Math.cos(this.rorate[1]);
    x = tx;
    z = tz;
    tx = x * Math.cos(this.rorate[2]) - w * Math.sin(this.rorate[2]);
    tw = x * Math.sin(this.rorate[2]) + w * Math.cos(this.rorate[2]);
    x = tx;
    w = tw;
    ty = y * Math.cos(this.rorate[3]) - z * Math.sin(this.rorate[3]);
    tz = y * Math.sin(this.rorate[3]) + z * Math.cos(this.rorate[3]);
    y = ty;
    z = tz;
    ty = y * Math.cos(this.rorate[4]) - w * Math.sin(this.rorate[4]);
    tw = y * Math.sin(this.rorate[4]) + w * Math.cos(this.rorate[4]);
    y = ty;
    w = tw;
    tz = z * Math.cos(this.rorate[5]) - w * Math.sin(this.rorate[5]);
    tw = z * Math.sin(this.rorate[5]) + w * Math.cos(this.rorate[5]);
    z = tz;
    w = tw;

    return [x, y, z, w];
  }

  orthogonalCoord(coord) {
    const x = coord[0];
    const y = coord[1];
    const z = coord[2];

    return [
      this.centerX + ((x * 3 ** 0.5) / 2 - (z * 3 ** 0.5) / 2) * this.scale,
      this.centerY - (y - x / 2 - z / 2) * this.scale,
    ];
  }

  perspectiveCoord(coord) {
    console.log(this.lc);
    const x = coord[0] / (1 - coord[3] / this.lc);
    const y = coord[1] / (1 - coord[3] / this.lc);
    const z = coord[2] / (1 - coord[3] / this.lc);

    return [
      this.centerX + ((x * 3 ** 0.5) / 2 - (z * 3 ** 0.5) / 2) * this.scale,
      this.centerY - (y - x / 2 - z / 2) * this.scale,
    ];
  }
}
