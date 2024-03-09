export class Controller {
  constructor() {
    this.mod = document.querySelector('#mod');

    this.dots = document.querySelector('#dotsContainer');
    this.lines = document.querySelector('#linesContainer');
    this.faces = document.querySelector('#facesContainer');

    this.inputLC = document.querySelector('#inputLC');
    this.inputDot = document.querySelector('#inputDot');
    this.inputLine = document.querySelector('#inputLine');
    this.inputFace = document.querySelector('#inputFace');

    this.btnX = document.querySelector('#x-axis');
    this.btnY = document.querySelector('#y-axis');
    this.btnZ = document.querySelector('#z-axis');
    this.btnW = document.querySelector('#w-axis');
    this.btnLeft = document.querySelector('#left');
    this.btnRight = document.querySelector('#right');

    this.proj = 'orth';

    this.maxScale = 0;

    this.centerLine = 0;
    this.dotObject = {};
    this.lineObject = [];
    this.faceObject = [];

    this.onLeft = false;
    this.onRight = false;

    this.axis = [false, false, false, false];
    this.rorate = [0, 0, 0, 0, 0, 0]; // xy, xz, xw, yz, yw, wz

    this.mod.addEventListener('click', () => {
      this.proj = this.proj === 'pers' ? 'orth' : 'pers';
    });

    this.inputLC.addEventListener('change', this.inputCenterLine.bind(this));
    this.inputDot.addEventListener('change', this.inputDotVar.bind(this));
    this.inputLine.addEventListener('change', this.inputLineVar.bind(this));
    this.inputFace.addEventListener('change', this.inputFaceVar.bind(this));

    this.btnX.addEventListener('click', () => this.selectAxis('x'));
    this.btnY.addEventListener('click', () => this.selectAxis('y'));
    this.btnZ.addEventListener('click', () => this.selectAxis('z'));
    this.btnW.addEventListener('click', () => this.selectAxis('w'));
    this.btnLeft.addEventListener('mousedown', () => {
      this.onLeft = true;
      this.btnLeft.style.backgroundColor = '#25afff';
    });
    this.btnLeft.addEventListener('mouseup', () => {
      this.onLeft = false;
      this.btnLeft.style.backgroundColor = '#cfcfcf';
    });
    this.btnRight.addEventListener('mousedown', () => {
      this.onRight = true;
      this.btnRight.style.backgroundColor = '#25afff';
    });
    this.btnRight.addEventListener('mouseup', () => {
      this.onRight = false;
      this.btnRight.style.backgroundColor = '#cfcfcf';
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'x') {
        this.axis[0] = true;
        this.btnX.style.backgroundColor = '#25afff';
      }
      if (e.key === 'y') {
        this.axis[1] = true;
        this.btnY.style.backgroundColor = '#25afff';
      }
      if (e.key === 'z') {
        this.axis[2] = true;
        this.btnZ.style.backgroundColor = '#25afff';
      }
      if (e.key === 'w') {
        this.axis[3] = true;
        this.btnW.style.backgroundColor = '#25afff';
      }
      if (e.key === 'ArrowLeft') {
        this.onLeft = true;
        this.btnLeft.style.backgroundColor = '#25afff';
      }
      if (e.key === 'ArrowRight') {
        this.onRight = true;
        this.btnRight.style.backgroundColor = '#25afff';
      }
    });
    window.addEventListener('keyup', (e) => {
      if (e.key === 'x') {
        this.axis[0] = false;
        this.btnX.style.backgroundColor = '#cfcfcf';
      }
      if (e.key === 'y') {
        this.axis[1] = false;
        this.btnY.style.backgroundColor = '#cfcfcf';
      }
      if (e.key === 'z') {
        this.axis[2] = false;
        this.btnZ.style.backgroundColor = '#cfcfcf';
      }
      if (e.key === 'w') {
        this.axis[3] = false;
        this.btnW.style.backgroundColor = '#cfcfcf';
      }
      if (e.key === 'ArrowLeft') {
        this.onLeft = false;
        this.btnLeft.style.backgroundColor = '#cfcfcf';
      }
      if (e.key === 'ArrowRight') {
        this.onRight = false;
        this.btnRight.style.backgroundColor = '#cfcfcf';
      }
    });

    requestAnimationFrame(this.rorateAngle.bind(this));
  }

  inputCenterLine() {
    const input = this.inputLC.value;
    const pattern = /^\d+(\.\d+)?$/;

    if (pattern.test(input)) {
      const tempLC = parseFloat(input);

      if (this.maxScale <= tempLC) {
        this.centerLine = tempLC;
      } else {
        alert('center line의 크기 >= 원점과 점의 최대 거리 (두 값이 같을 경우 문제가 생길 수 있어 비권장)');
      }
    } else {
      alert('입력 형식 : 양수인 실수 ex) 3.1');
    }
  }

  inputDotVar() {
    let input = this.inputDot.value.split(' ').join('');
    const pattern = /^[\w]+\((-)?\d+(\.\d+)?,(-)?\d+(\.\d+)?,(-)?\d+(\.\d+)?,(-)?\d+(\.\d+)?\)$/;

    if (pattern.test(input)) {
      input = input.slice(0, -1).split('(');

      if (!this.dotObject[input[0]]) {
        this.dotObject[input[0]] = input[1].split(',').map((i) => parseFloat(i));
        this.inputDot.value = '';

        const div = document.createElement('div');
        const divDot = document.createElement('div');
        const divDel = document.createElement('div');
        div.className = 'infoContainer';
        divDot.className = 'info';
        divDot.innerText = input[0] + '(' + input[1] + ')';
        divDel.className = 'del';
        divDel.innerText = 'Del';
        this.dots.appendChild(div);
        div.appendChild(divDot);
        div.appendChild(divDel);

        const scale = Math.sqrt(
          this.dotObject[input[0]][0] ** 2 +
            this.dotObject[input[0]][1] ** 2 +
            this.dotObject[input[0]][2] ** 2 +
            this.dotObject[input[0]][3] ** 2
        );

        if (this.maxScale < scale) {
          this.centerLine = this.maxScale === 0 ? scale : (this.centerLine * scale) / this.maxScale;
          this.maxScale = scale;
        }

        divDel.addEventListener('click', () => {
          div.remove();
          delete this.dotObject[input[0]];
        });
      } else {
        alert('변수이름 중복');
      }
    } else {
      alert('입력 형식 : 변수이름(x,y,z,w) \n ex) a(0,0,0,0)');
    }
  }

  inputLineVar() {
    let input = this.inputLine.value.split(' ').join('');
    const pattern = /^\([\w]+,[\w]+\)$/;

    if (pattern.test(input)) {
      input = input.slice(1, input.length - 1).split(',');

      if (this.dotObject[input[0]] && this.dotObject[input[1]]) {
        const index = this.lineObject.length;
        this.lineObject.push(input);
        this.inputLine.value = '';

        const div = document.createElement('div');
        const divLine = document.createElement('div');
        const divDel = document.createElement('div');
        div.className = 'infoContainer';
        divLine.className = 'info';
        divLine.innerText = '(' + input[0] + ',' + input[1] + ')';
        divDel.className = 'del';
        divDel.innerText = 'Del';
        this.lines.appendChild(div);
        div.appendChild(divLine);
        div.appendChild(divDel);

        divDel.addEventListener('click', () => {
          div.remove();
          this.lineObject.splice(index, 1);
        });
      } else {
        alert('존재하지 않는 변수이름');
      }
    } else {
      alert('입력 형식 : (변수이름, 변수이름) \n ex) (a,b)');
    }
  }

  inputFaceVar() {
    const input = this.inputFace.value.split(' ').join('');
    const pattern = /^\(([\w]+,){2,}[\w]+\)$/;

    if (pattern.test(input)) {
      const dots = input.slice(1, input.length - 1).split(',');

      let check = true;
      for (let i = 0; i < dots.length; i++) {
        if (!this.dotObject[dots[i]]) {
          check = false;
          break;
        }
      }

      if (check) {
        const index = this.faceObject.length;
        this.faceObject.push(dots);
        this.inputFace.value = '';

        const div = document.createElement('div');
        const divFace = document.createElement('div');
        const divDel = document.createElement('div');
        div.className = 'infoContainer';
        divFace.className = 'info';
        divFace.innerText = input;
        divDel.className = 'del';
        divDel.innerText = 'Del';
        this.faces.appendChild(div);
        div.appendChild(divFace);
        div.appendChild(divDel);

        divDel.addEventListener('click', () => {
          div.remove();
          this.faceObject.splice(index, 1);
        });
      } else {
        alert('존재하지 않는 변수이름');
      }
    } else {
      alert('입력 형식 : (변수이름, 변수이름, ..., 변수이름) \n ex) (a,b,c)');
    }
  }

  selectAxis(char) {
    if (char === 'x') {
      this.axis[0] = this.axis[0] ? false : 1;
      this.btnX.style.backgroundColor = '#25afff';
    }
    if (char === 'y') {
      this.axis[1] = this.axis[1] ? false : 1;
      this.btnY.style.backgroundColor = '#25afff';
    }
    if (char === 'z') {
      this.axis[2] = this.axis[2] ? false : 1;
      this.btnZ.style.backgroundColor = '#25afff';
    }
    if (char === 'w') {
      this.axis[3] = this.axis[3] ? false : 1;
      this.btnW.style.backgroundColor = '#25afff';
    }
  }

  rorateAngle() {
    let sign = 0;
    if (this.onLeft) sign = 1;
    else if (this.onRight) sign = -1;
    if (this.axis[0] && this.axis[1]) this.rorate[0] += 0.005 * sign;
    if (this.axis[0] && this.axis[2]) this.rorate[1] += 0.005 * sign;
    if (this.axis[0] && this.axis[3]) this.rorate[2] += 0.005 * sign;
    if (this.axis[1] && this.axis[2]) this.rorate[3] += 0.005 * sign;
    if (this.axis[1] && this.axis[3]) this.rorate[4] += 0.005 * sign;
    if (this.axis[2] && this.axis[3]) this.rorate[5] += 0.005 * sign;

    requestAnimationFrame(this.rorateAngle.bind(this));
  }
}
