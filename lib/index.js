import createWasmModule from './wasm/powercrust.js';


export default function powercrust(input = '') {
  let i = 0;

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
        const head = instance.FS.readFile('./head');
        const pc = instance.FS.readFile('./pc');
        const pnf = instance.FS.readFile('./pnf');
        const fileContent = new Uint8Array([...head, ...pc, ...pnf]);
        resolve(fileContent);
        // function offerFileAsDownload(filename, mime, content) {
        //   var a = document.createElement('a');
        //   a.download = filename;
        //   a.href = URL.createObjectURL(new Blob([content], { type: mime }));
        //   a.style.display = 'none';

        //   document.body.appendChild(a);
        //   a.click();
        //   setTimeout(() => {
        //     document.body.removeChild(a);
        //     URL.revokeObjectURL(a.href);
        //   }, 2000);
        // }
        // offerFileAsDownload('pc.off', 'plain/text', fileContent)
      },
      arguments: ['-m', '1000000']
    });
  })

}
