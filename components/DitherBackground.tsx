"use client";

import { useEffect, useRef } from "react";

interface DitherBackgroundProps {
  className?: string;
  color1?: [number, number, number];
  color2?: [number, number, number];
  speed?: number;
  gridSize?: number;
}

export function DitherBackground({
  className = "",
  color1 = [0, 20, 40],
  color2 = [0, 80, 160],
  speed = 0.4,
  gridSize = 4,
}: DitherBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl");
    if (!gl) return;

    const vertSrc = `
      attribute vec2 a_pos;
      void main() {
        gl_Position = vec4(a_pos, 0.0, 1.0);
      }
    `;

    const fragSrc = `
      precision mediump float;
      uniform vec2 u_res;
      uniform float u_time;
      uniform vec3 u_color1;
      uniform vec3 u_color2;
      uniform float u_grid;

      float bayer4(vec2 p) {
        int x = int(mod(p.x, 4.0));
        int y = int(mod(p.y, 4.0));
        float m[16];
        m[0]  =  0.0; m[1]  =  8.0; m[2]  =  2.0; m[3]  = 10.0;
        m[4]  = 12.0; m[5]  =  4.0; m[6]  = 14.0; m[7]  =  6.0;
        m[8]  =  3.0; m[9]  = 11.0; m[10] =  1.0; m[11] =  9.0;
        m[12] = 15.0; m[13] =  7.0; m[14] = 13.0; m[15] =  5.0;
        int idx = y * 4 + x;
        float val = 0.0;
        if (idx == 0)  val = m[0];
        else if (idx == 1)  val = m[1];
        else if (idx == 2)  val = m[2];
        else if (idx == 3)  val = m[3];
        else if (idx == 4)  val = m[4];
        else if (idx == 5)  val = m[5];
        else if (idx == 6)  val = m[6];
        else if (idx == 7)  val = m[7];
        else if (idx == 8)  val = m[8];
        else if (idx == 9)  val = m[9];
        else if (idx == 10) val = m[10];
        else if (idx == 11) val = m[11];
        else if (idx == 12) val = m[12];
        else if (idx == 13) val = m[13];
        else if (idx == 14) val = m[14];
        else val = m[15];
        return val / 16.0;
      }

      float noise(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_res;
        vec2 cell = floor(gl_FragCoord.xy / u_grid);

        // animated gradient
        float wave1 = sin(uv.x * 3.0 + u_time * 0.7) * 0.5 + 0.5;
        float wave2 = cos(uv.y * 2.5 - u_time * 0.5) * 0.5 + 0.5;
        float wave3 = sin((uv.x + uv.y) * 2.0 + u_time * 0.3) * 0.5 + 0.5;
        float brightness = (wave1 * 0.4 + wave2 * 0.35 + wave3 * 0.25);

        // dither threshold from bayer matrix
        float threshold = bayer4(gl_FragCoord.xy / u_grid);
        float dithered = step(threshold, brightness);

        vec3 color = mix(u_color1 / 255.0, u_color2 / 255.0, dithered);
        gl_FragColor = vec4(color, 1.0);
      }
    `;

    function compileShader(type: number, src: string) {
      const s = gl!.createShader(type)!;
      gl!.shaderSource(s, src);
      gl!.compileShader(s);
      return s;
    }

    const prog = gl.createProgram()!;
    gl.attachShader(prog, compileShader(gl.VERTEX_SHADER, vertSrc));
    gl.attachShader(prog, compileShader(gl.FRAGMENT_SHADER, fragSrc));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);

    const aPos = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uRes   = gl.getUniformLocation(prog, "u_res");
    const uTime  = gl.getUniformLocation(prog, "u_time");
    const uC1    = gl.getUniformLocation(prog, "u_color1");
    const uC2    = gl.getUniformLocation(prog, "u_color2");
    const uGrid  = gl.getUniformLocation(prog, "u_grid");

    gl.uniform3fv(uC1, color1);
    gl.uniform3fv(uC2, color2);
    gl.uniform1f(uGrid, gridSize);

    function resize() {
      const w = canvas!.clientWidth;
      const h = canvas!.clientHeight;
      canvas!.width = w;
      canvas!.height = h;
      gl!.viewport(0, 0, w, h);
      gl!.uniform2f(uRes, w, h);
    }

    resize();
    window.addEventListener("resize", resize);

    let start = performance.now();
    function render(now: number) {
      gl!.uniform1f(uTime, (now - start) * 0.001 * speed);
      gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
      rafRef.current = requestAnimationFrame(render);
    }
    rafRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [color1, color2, speed, gridSize]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full ${className}`}
    />
  );
}