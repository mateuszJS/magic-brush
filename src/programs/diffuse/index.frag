precision mediump float;
 
uniform sampler2D u_prevDiffuse;
uniform sampler2D u_currDiffuse;
uniform vec2 u_textureSize;
uniform vec2 u_mouseCoord;

// the texCoords passed in from the vertex shader.
varying vec2 v_texCoord;

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


/*
void FluidCubeStep(FluidCube *cube)
{
    int N          = cube->size;
    float visc     = cube->visc;
    float diff     = cube->diff;
    float dt       = cube->dt;
    float *Vx      = cube->Vx;
    float *Vy      = cube->Vy;
    float *Vz      = cube->Vz;
    float *Vx0     = cube->Vx0;
    float *Vy0     = cube->Vy0;
    float *Vz0     = cube->Vz0;
    float *s       = cube->s;
    float *density = cube->density;
    
    diffuse(1, Vx0, Vx, visc, dt, 4, N);
    diffuse(2, Vy0, Vy, visc, dt, 4, N);
    diffuse(3, Vz0, Vz, visc, dt, 4, N);
    
    project(Vx0, Vy0, Vz0, Vx, Vy, 4, N);
    
    advect(1, Vx, Vx0, Vx0, Vy0, Vz0, dt, N);
    advect(2, Vy, Vy0, Vx0, Vy0, Vz0, dt, N);
    advect(3, Vz, Vz0, Vx0, Vy0, Vz0, dt, N);
    
    project(Vx, Vy, Vz, Vx0, Vy0, 4, N);
    
    diffuse(0, s, density, diff, dt, 4, N);
    advect(0, density, s, Vx, Vy, Vz, dt, N);
}
*/