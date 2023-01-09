precision mediump float;
 
uniform sampler2D u_prevDiffuse;
uniform sampler2D u_currDiffuse;
uniform vec2 u_textureSize;
uniform vec2 u_mouseCoord;

// the texCoords passed in from the vertex shader.
varying vec2 v_texCoord;


// static void diffuse (float *x, float *x0, float diff, float dt, int iter, int N)
// {
//     float a = dt * diff * (N - 2) * (N - 2);
//     lin_solve(x, x0, a, 1 + 6 * a, iter, N);
// }

 
// static void lin_solve(float *x, float *x0, float a, float c, int iter, int N)
//  float cRecip = 1.0 / c;


void main() {
  float dt = 0.0005;
  float diffusion = 0.0005;
  float a = dt * diffusion * 254.0 * 254.0;
  float c = 1.0 + 6.0 * a;
  float cRecip = 1.0 / c;

  vec2 onePixel = vec2(1.0) / u_textureSize;

  // we should ignore very top, left, right, bottom rows

  gl_FragColor =
    (texture2D(u_prevDiffuse, v_texCoord)+ a * (
      texture2D(u_currDiffuse, vec2(v_texCoord.x + onePixel.x, v_texCoord.y))
      + texture2D(u_currDiffuse, vec2(v_texCoord.x - onePixel.x, v_texCoord.y))
      + texture2D(u_currDiffuse, vec2(v_texCoord.x, v_texCoord.y + onePixel.y))
      + texture2D(u_currDiffuse, vec2(v_texCoord.x, v_texCoord.y - onePixel.y))
    ) )* cRecip;
}

static void project(float *velocX, float *velocY, float *p, float *div)
p -> current/prev velocity x
div -> current/prev velocity x

velocX, velocY -> currVelocity
p, div -> prevVelocity
{
        // everything except boundary
                div[IX(i, j)] = -0.5f*(
                         velocX[IX(i+1, j)]
                        -velocX[IX(i-1, j)]
                        +velocY[IX(i  , j+1)]
                        -velocY[IX(i  , j-1)]
                    )/N;
                p[IX(i, j)] = 0;

      // in diffuse:    lin_solve(x, x0, a, 1 + 6 * a);
        // static void lin_solve(float *x, float *x0, float a, float c)

          gl_FragColor =
    (texture2D(u_prevDiffuse, v_texCoord)+ a * (
      texture2D(u_currDiffuse, vec2(v_texCoord.x + onePixel.x, v_texCoord.y))
      + texture2D(u_currDiffuse, vec2(v_texCoord.x - onePixel.x, v_texCoord.y))
      + texture2D(u_currDiffuse, vec2(v_texCoord.x, v_texCoord.y + onePixel.y))
      + texture2D(u_currDiffuse, vec2(v_texCoord.x, v_texCoord.y - onePixel.y))
    ) )* cRecip;

    
    lin_solve(p, div, 1, 6);
    
        // everything except boundary
                velocX[IX(i, j)] -= 0.5f * (  p[IX(i+1, j)]
                                                -p[IX(i-1, j)]) * N;
                velocY[IX(i, j)] -= 0.5f * (  p[IX(i, j+1)]
                                                -p[IX(i, j-1)]) * N;

}

// project(Vx0, Vy0, Vz0, Vx, Vy, 4, N);