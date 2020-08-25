# Powerful meshing algorithm for the browser

This repo is a WebAssembly port of the code found on the Nina Amenta's
website:

[http://web.cs.ucdavis.edu/~amenta/powercrust.html](http://web.cs.ucdavis.edu/~amenta/powercrust.html)

It is a fork of [https://github.com/kubkon/powercrust](https://github.com/kubkon/powercrust)

## Introduction
Convert pointclouds into 3D Meshes with an easy to use JavaScript API.

Usage:

```javascript
import powercrust from 'powercrust-wasm';

// Flat array of points with X,Y,Z values, e.g. loaded from the network (have a look at example/index.html)
const points = [1,2,3,4,5,6]
const result = await powercrust(points);
// { head: { numVertices: number; numFaces: number; } pc: number[][]; pnf: number[][]; }
console.log(result)
```
