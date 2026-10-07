const HEAD = `precision highp float;\n`;

const GLYPH = `
uniform sampler2D uAtlas;
uniform vec2 uGrid;
uniform float uCellAspect;
float glyph(float g, vec2 local, float h) {
  vec2 uv = vec2(local.x / (h * uCellAspect) + 0.5, 0.5 - local.y / h);
  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) return 0.0;
  float col = mod(g, uGrid.x);
  float row = floor(g / uGrid.x);
  return texture2D(uAtlas, (vec2(col, row) + uv) / uGrid).a;
}
float box(vec2 p, vec2 hs, float r) {
  vec2 q = abs(p) - hs + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}
`;

const TILE = `
uniform vec3 uFace;
uniform vec3 uFaceTop;
uniform vec3 uHingeColor;
uniform vec3 uInk;
uniform vec3 uRemark;
uniform vec3 uLift;
uniform float uRadius;
uniform float uHinge;
uniform float uGlyphH;
vec4 tile(vec2 local, vec2 size, float g, float tone, float light, float shade, bool upper) {
  float d = box(local, size * 0.5, uRadius);
  float cover = clamp(0.5 - d, 0.0, 1.0);
  vec3 face = upper ? uFaceTop : uFace;
  face = mix(face, uLift, light * 0.55);
  vec3 ink = mix(uInk, uRemark, tone);
  vec3 c = mix(face, ink, glyph(g, local, uGlyphH));
  float hinge = 1.0 - step(uHinge * 0.5, abs(local.y));
  c = mix(c, uHingeColor, hinge);
  float lip = step(local.y, -size.y * 0.5 + 1.0);
  c *= 1.0 - lip * 0.35;
  c *= 1.0 - shade;
  return vec4(c * cover, cover);
}
`;

export const HALF_VERTEX = `
attribute vec2 position;
attribute vec4 aRect;
attribute vec4 aCell;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform float uPart;
varying vec2 vLocal;
varying vec2 vSize;
varying vec4 vCell;
void main() {
  float y = uPart < 0.5 ? position.y : -position.y;
  vec2 local = vec2(position.x * aRect.z, y * aRect.w * 0.5);
  vLocal = local;
  vSize = aRect.zw;
  vCell = aCell;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(aRect.xy + local, 0.0, 1.0);
}
`;

export const HALF_FRAGMENT = `${HEAD}${GLYPH}${TILE}
uniform float uPart;
varying vec2 vLocal;
varying vec2 vSize;
varying vec4 vCell;
void main() {
  gl_FragColor = tile(vLocal, vSize, vCell.x, vCell.y, vCell.z, vCell.w, uPart < 0.5);
}
`;

export const LEAF_VERTEX = `
attribute vec2 position;
attribute vec4 aRect;
attribute vec4 aLeaf;
attribute vec4 aLeafState;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
varying vec2 vLocal;
varying vec2 vSize;
varying vec4 vLeaf;
varying vec4 vState;
void main() {
  float hy = position.y * aRect.w * 0.5;
  float a = aLeaf.z;
  vLocal = vec2(position.x * aRect.z, hy);
  vSize = aRect.zw;
  vLeaf = aLeaf;
  vState = aLeafState;
  vec3 p = vec3(aRect.x + vLocal.x, aRect.y + hy * cos(a), hy * sin(a) + 0.5);
  gl_Position = aLeafState.y < 0.5 ? vec4(2.0, 2.0, 2.0, 1.0) : projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}
`;

export const LEAF_FRAGMENT = `${HEAD}${GLYPH}${TILE}
varying vec2 vLocal;
varying vec2 vSize;
varying vec4 vLeaf;
varying vec4 vState;
void main() {
  float c = cos(vLeaf.z);
  bool front = c >= 0.0;
  vec2 local = front ? vLocal : vec2(vLocal.x, -vLocal.y);
  vec4 col = tile(local, vSize, front ? vLeaf.x : vLeaf.y, vLeaf.w, vState.x, 0.0, front);
  col.rgb *= mix(0.58, 1.0, abs(c));
  gl_FragColor = col;
}
`;

export const HOUSING_VERTEX = `
attribute vec2 position;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform vec4 uRect;
varying vec2 vLocal;
void main() {
  vLocal = position * uRect.zw;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(uRect.xy + vLocal, -0.5, 1.0);
}
`;

export const HOUSING_FRAGMENT = `${HEAD}
uniform vec4 uRect;
uniform vec3 uBoard;
uniform vec3 uEdge;
uniform float uRadius;
uniform float uEdgeWidth;
uniform float uAlpha;
varying vec2 vLocal;
float box(vec2 p, vec2 hs, float r) {
  vec2 q = abs(p) - hs + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}
void main() {
  float d = box(vLocal, uRect.zw * 0.5, uRadius);
  float cover = clamp(0.5 - d, 0.0, 1.0);
  float edge = clamp(0.5 - d, 0.0, 1.0) - clamp(0.5 - (d + uEdgeWidth), 0.0, 1.0);
  vec3 c = mix(uBoard, uEdge, edge);
  gl_FragColor = vec4(c, 1.0) * cover * uAlpha;
}
`;
