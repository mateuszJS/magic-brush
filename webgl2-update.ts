/*
  https://webgl2fundamentals.org/webgl/lessons/webgl2-whats-new.html

  - you don't need to pass uniform with texture size to the shader
  you can just use:
  vec2 size = textureSize(sampler, lod)

  - to read precise value in texture you can use:
  vec4 values = texelFetch(sampler, ivec2Position, lod);
  so you can access by pixels/texel coords, not just by calculating a value between 0.0 and 1.0

  - many new textures formats!

  - 3D textures, so you can treat 3d textures as collections of normal textures(like slices).
  It's cool because it give for the shader access to HUGE numbers of 2d textures.
  You can select the slice in your shader:
  vec4 color = texture(someSampler2DArray, vec3(u, v, slice));

  - has inverse and transpose functions to inverse the matrix

  - if you have a lot of uniforms, it's faster to use uniform buffer

  - textures can be integer. You can perform bit manipulations!

  - WebGL2 allows your vertex shader to write its results back to a buffer.

  - Depth Textures
  Depth textures were optional in WebGL1 and a PITA to work around. Now they're standard. They're commonly used for computing shadow maps.
  =====In the context of our game, so we can just render y prop instead of sorting an array?

  - Setting gl_FragDepth
  You can write your own custom values to the depth buffer / z-buffer.

  - Standard Derivatives
  These are now standard. Common uses include computing normals in the shaders instead of passing them in.
  ==== I have no clue

  - Instanced Drawing
  This is now standard. Common uses include drawing lots of trees, bushes, or grass quickly.
  ====== This sounds like super important for our game

  - Multiple Draw Buffers
  You are now able to draw to multiple buffers at once from a shader. This is commonly used for various deferred rendering techniques.

  - Multi-Sampled renderbuffers
  In WebGL1 the canvas itself could be anti-aliased with the GPU's built in multi-sample system, but there was no support for user controlled multi-sampling. In WebGL2 you can now make multi-sampled renderbuffers.

  - Floating point textures are always available
  Floating point textures are used for many special effects and calculations. In WebGL1 they were optional. In WebGL2 they just exist.
  Note: Unfortunately they are still restricted in that filtering and rendering to float point textures is still optional. See OES_texture_float_linear and EXT_color_buffer_float.
*/
