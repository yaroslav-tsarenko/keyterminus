import { Camera, Geometry, Mesh, Program, Renderer, Texture, Transform } from "ogl";
import { ATLAS, ATLAS_COLS, createAtlas, type GlyphAtlas, type GlyphFont } from "./atlas";
import { HALF_FRAGMENT, HALF_VERTEX, HOUSING_FRAGMENT, HOUSING_VERTEX, LEAF_FRAGMENT, LEAF_VERTEX } from "./shaders";

export type Rgb = [number, number, number];

export interface BoardPalette {
  face: Rgb;
  faceTop: Rgb;
  hinge: Rgb;
  ink: Rgb;
  remark: Rgb;
  lift: Rgb;
  board: Rgb;
  edge: Rgb;
  housing: boolean;
}

export interface CellFrame {
  rect: [number, number, number, number];
  top: number;
  bottom: number;
  front: number;
  back: number;
  angle: number;
  leaf: boolean;
  tone: number;
  light: number;
  shade: number;
}

export interface BoardView {
  width: number;
  height: number;
  housing: [number, number, number, number];
  housingRadius: number;
  hinge: number;
  glyphHeight: number;
  pitch: number;
  yaw: number;
}

export interface BoardScene {
  atlas: GlyphAtlas;
  refreshAtlas: () => void;
  resize: (width: number, height: number) => void;
  render: (view: BoardView, cells: CellFrame[]) => void;
  dpr: () => number;
  setDpr: (dpr: number) => void;
  dispose: () => void;
}

const SOFTWARE = /swiftshader|llvmpipe|software|basic render/i;
const QUAD_HALF = new Float32Array([-0.5, 0, 0.5, 0, 0.5, 1, -0.5, 1]);
const QUAD_FULL = new Float32Array([-0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5]);
const QUAD_INDEX = new Uint16Array([0, 1, 2, 0, 2, 3]);

export function isSoftwareRenderer(gl: WebGLRenderingContext | WebGL2RenderingContext): boolean {
  const info = gl.getExtension("WEBGL_debug_renderer_info");
  const name = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : String(gl.getParameter(gl.RENDERER));
  return SOFTWARE.test(name);
}

export function createBoardScene(
  canvas: HTMLCanvasElement,
  options: { dpr: number; palette: BoardPalette; font: GlyphFont; seed: Iterable<string>; forced: boolean; onLost: () => void },
): BoardScene | null {
  let renderer: Renderer;
  try {
    renderer = new Renderer({ canvas, dpr: options.dpr, alpha: true, premultipliedAlpha: true, antialias: true, depth: false, powerPreference: "default" });
  } catch {
    return null;
  }
  const gl = renderer.gl;
  if (!gl || (!options.forced && isSoftwareRenderer(gl))) {
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
    return null;
  }
  gl.clearColor(0, 0, 0, 0);

  const onLost = (event: Event) => {
    event.preventDefault();
    options.onLost();
  };
  canvas.addEventListener("webglcontextlost", onLost);

  const atlas = createAtlas(options.font, options.seed);
  const texture = new Texture(gl, { image: atlas.canvas, flipY: false, generateMipmaps: true, minFilter: gl.LINEAR_MIPMAP_LINEAR, magFilter: gl.LINEAR, premultiplyAlpha: false });

  const camera = new Camera(gl, { near: 10, far: 20000 });
  const scene = new Transform();
  const board = new Transform();
  board.setParent(scene);

  const p = options.palette;
  const shared = {
    uAtlas: { value: texture },
    uGrid: { value: [ATLAS_COLS, ATLAS.height / ATLAS.cellH] },
    uCellAspect: { value: ATLAS.cellW / ATLAS.cellH },
    uFace: { value: p.face },
    uFaceTop: { value: p.faceTop },
    uHingeColor: { value: p.hinge },
    uInk: { value: p.ink },
    uRemark: { value: p.remark },
    uLift: { value: p.lift },
    uRadius: { value: 2 },
    uHinge: { value: 1 },
    uGlyphH: { value: 31 },
  };
  const programOptions = { transparent: true, depthTest: false, depthWrite: false, cullFace: false as const };

  const housingUniforms = {
    uRect: { value: [0, 0, 1, 1] },
    uBoard: { value: p.board },
    uEdge: { value: p.edge },
    uRadius: { value: 10 },
    uEdgeWidth: { value: 1 },
    uAlpha: { value: p.housing ? 1 : 0 },
  };
  const housing = new Mesh(gl, {
    geometry: new Geometry(gl, { position: { size: 2, data: QUAD_FULL }, index: { data: QUAD_INDEX } }),
    program: new Program(gl, { vertex: HOUSING_VERTEX, fragment: HOUSING_FRAGMENT, uniforms: housingUniforms, ...programOptions }),
    frustumCulled: false,
  });
  housing.setParent(board);

  const halfProgram = (part: number) => new Program(gl, { vertex: HALF_VERTEX, fragment: HALF_FRAGMENT, uniforms: { ...shared, uPart: { value: part } }, ...programOptions });
  const leafProgram = new Program(gl, { vertex: LEAF_VERTEX, fragment: LEAF_FRAGMENT, uniforms: shared, ...programOptions });
  const bottomProgram = halfProgram(1);
  const topProgram = halfProgram(0);

  let capacity = 0;
  let meshes: { bottom: Mesh; top: Mesh; leaf: Mesh } | null = null;
  let arrays: { rectB: Float32Array; rectT: Float32Array; rectL: Float32Array; bottom: Float32Array; top: Float32Array; leaf: Float32Array; leafState: Float32Array } | null = null;

  const instanced = (data: Float32Array) => ({ size: 4, data, instanced: 1, usage: gl.DYNAMIC_DRAW });

  const build = (count: number) => {
    if (meshes) {
      meshes.bottom.setParent(null);
      meshes.top.setParent(null);
      meshes.leaf.setParent(null);
      meshes.bottom.geometry.remove();
      meshes.top.geometry.remove();
      meshes.leaf.geometry.remove();
    }
    capacity = Math.max(8, count);
    const n = capacity * 4;
    arrays = {
      rectB: new Float32Array(n),
      rectT: new Float32Array(n),
      rectL: new Float32Array(n),
      bottom: new Float32Array(n),
      top: new Float32Array(n),
      leaf: new Float32Array(n),
      leafState: new Float32Array(n),
    };
    const quad = () => ({ position: { size: 2, data: QUAD_HALF }, index: { data: QUAD_INDEX } });
    const bottom = new Mesh(gl, { geometry: new Geometry(gl, { ...quad(), aRect: instanced(arrays.rectB), aCell: instanced(arrays.bottom) }), program: bottomProgram, frustumCulled: false });
    const top = new Mesh(gl, { geometry: new Geometry(gl, { ...quad(), aRect: instanced(arrays.rectT), aCell: instanced(arrays.top) }), program: topProgram, frustumCulled: false });
    const leaf = new Mesh(gl, { geometry: new Geometry(gl, { ...quad(), aRect: instanced(arrays.rectL), aLeaf: instanced(arrays.leaf), aLeafState: instanced(arrays.leafState) }), program: leafProgram, frustumCulled: false });
    bottom.setParent(board);
    top.setParent(board);
    leaf.setParent(board);
    meshes = { bottom, top, leaf };
  };

  let width = 1;
  let height = 1;
  const resize = (w: number, h: number) => {
    width = Math.max(1, w);
    height = Math.max(1, h);
    renderer.setSize(width, height);
    const distance = Math.max(1200, width * 1.25);
    camera.perspective({ fov: (2 * Math.atan(height / 2 / distance) * 180) / Math.PI, aspect: width / height, near: 10, far: distance * 4 });
    camera.position.set(0, 0, distance);
    camera.lookAt([0, 0, 0]);
  };

  const render = (view: BoardView, cells: CellFrame[]) => {
    if (view.width !== width || view.height !== height) resize(view.width, view.height);
    if (!meshes || cells.length > capacity || cells.length < capacity / 4) build(cells.length);
    const a = arrays!;
    const m = meshes!;
    housingUniforms.uRect.value = view.housing;
    housingUniforms.uRadius.value = view.housingRadius;
    shared.uHinge.value = view.hinge;
    shared.uGlyphH.value = view.glyphHeight;
    cells.forEach((c, i) => {
      const o = i * 4;
      a.rectB.set(c.rect, o);
      a.rectT.set(c.rect, o);
      a.rectL.set(c.rect, o);
      a.bottom[o] = c.bottom;
      a.bottom[o + 1] = c.tone;
      a.bottom[o + 2] = c.light;
      a.bottom[o + 3] = c.shade;
      a.top[o] = c.top;
      a.top[o + 1] = c.tone;
      a.top[o + 2] = c.light;
      a.top[o + 3] = 0;
      a.leaf[o] = c.front;
      a.leaf[o + 1] = c.back;
      a.leaf[o + 2] = c.angle;
      a.leaf[o + 3] = c.tone;
      a.leafState[o] = c.light;
      a.leafState[o + 1] = c.leaf ? 1 : 0;
    });
    for (const mesh of [m.bottom, m.top, m.leaf]) {
      const attrs = mesh.geometry.attributes;
      for (const key of Object.keys(attrs)) if (key !== "position" && key !== "index") attrs[key].needsUpdate = true;
      mesh.geometry.setInstancedCount(cells.length);
    }
    board.rotation.x = view.pitch;
    board.rotation.y = view.yaw;
    renderer.render({ scene, camera, sort: false, frustumCull: false });
  };

  return {
    atlas,
    refreshAtlas: () => {
      texture.needsUpdate = true;
    },
    resize,
    render,
    dpr: () => renderer.dpr,
    setDpr: (dpr: number) => {
      renderer.dpr = dpr;
      resize(width, height);
    },
    dispose: () => {
      canvas.removeEventListener("webglcontextlost", onLost);
      meshes?.bottom.geometry.remove();
      meshes?.top.geometry.remove();
      meshes?.leaf.geometry.remove();
      housing.geometry.remove();
      for (const program of [bottomProgram, topProgram, leafProgram, housing.program]) program.remove();
      if (texture.texture) gl.deleteTexture(texture.texture);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    },
  };
}
