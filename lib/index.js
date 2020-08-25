import createWasmModule from './wasm/powercrust.js';


/**
 * Convert an array of points to a 3D Mesh.
 * @param {number[]} points The array should be a flat list of X,Y,Z values, like so: [x1, y1, z1, ...].
 * @param {object} options as a second paramater, you can specify an options object
 * @param {boolean|string} options.downloadOFF if set true, the result will be downloaded as an OFF file. Instead of true, you can also specify a file name
 * @returns {Promise<{head: {numVertices: number;numFaces: number;}; pc: number[][]; pnf: number[][]}>}
 */
export default function powercrust(inputArr = [0, 0, 0], { downloadOFF = false } = {}) {
  let i = 0;
  const input = inputArr.reduce((str, currVal, i) => {
    let newStr = `${str}${currVal}`;
    if ((i + 1) % 3 === 0) {
      newStr = newStr + '\n';
    } else {
      newStr = `${newStr} `
    }
    return newStr;
  }, '').trim();

  return new Promise((resolve) => {
    createWasmModule({
      async preRun(instance) {
        function stdin() {
          if (input.length > 0 && i < input.length) {
            const code = input.charCodeAt(i);
            i += 1;
            return code;
          } else {
            return null;
          }
        }

        let stdoutBuffer = "";
        function stdout(code) {
          if (code === "\n".charCodeAt(0) && stdoutBuffer !== "") {
            console.log('STDOUT', stdoutBuffer);
            stdoutBufer = "";
          } else {
            stdoutBuffer += String.fromCharCode(code);
          }
        }

        let stderrBuffer = "";
        function stderr(code) {
          if (code === "\n".charCodeAt(0) && stderrBuffer !== "") {
            console.log('STDERR', stderrBuffer);
            stderrBuffer = "";
          } else {
            stderrBuffer += String.fromCharCode(code);
          }
        }

        instance.FS.init(stdin, stdout, stderr);
      },
      postRun(instance) {
        const textDecoder = new TextDecoder('utf-8');
        const head = textDecoder.decode(instance.FS.readFile('./head'));
        const pc = textDecoder.decode(instance.FS.readFile('./pc'));
        const pnf = textDecoder.decode(instance.FS.readFile('./pnf'));

        function parseHead() {
          const [, data] = head.split('\n');
          const [numVertices, numFaces] = data.split(' ').map(str => parseFloat(str));
          return { numVertices, numFaces };
        }

        function parsePc() {
          return pc.split('\n').map(str => {
            return str.split(' ').map(numStr => parseFloat(numStr));
          })
        }

        function parsePnf() {
          return pnf.split('\n').map(str => {
            return str.split(' ').filter(Boolean).map(numStr => parseFloat(numStr));
          })
        }

        const resObj = {
          head: parseHead(),
          pc: parsePc(),
          pnf: parsePnf()
        }

        function downloadFile(filename, mime, content) {
          var a = document.createElement('a');
          a.download = filename;
          a.href = URL.createObjectURL(new Blob([content], { type: mime }));
          a.style.display = 'none';

          document.body.appendChild(a);
          a.click();
          setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(a.href);
          }, 2000);
        }
        if (downloadOFF) {
          const filename = typeof downloadOFF === 'string' ? downloadOFF : 'pc.off';
          const fileContent = new Uint8Array([
            ...instance.FS.readFile('./head'),
            ...instance.FS.readFile('./pc'),
            ...instance.FS.readFile('./pnf')
          ])
          downloadFile(filename, 'plain/text', fileContent)
        }

        resolve(resObj);

      },
      arguments: ['-m', '1000000']
    });
  })

}
