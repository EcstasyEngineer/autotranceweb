#ifdef GL_ES
precision highp float;
#endif

uniform float iTime;       // Uniform variable to handle time
uniform vec2 iResolution;  // Resolution of the screen
float iTimeScale = 3.8;    // How fast the spiral rotates
float spiralDensity = 50.0; // Adjusted spiral density

void main(void) {
    vec2 uv = (gl_FragCoord.xy / iResolution.xy) * 2.0 - 1.0;
    //uv.x *= iResolution.x / iResolution.y;  // Correct for aspect ratio
    if (iResolution.y > iResolution.x) {
      uv.y *= iResolution.y / iResolution.x;
    } else {
      uv.x *= iResolution.x / iResolution.y;
    }

    float radius = length(uv);  // Compute the radius from the center
    float angle = atan(uv.y, uv.x);  // Compute the angle

    // Change spiral direction every 1/3 radius using modulo
    float direction = mod(floor(radius * 3.0), 2.0);
    if (direction < 1.0) {
      angle += iTime * iTimeScale;  // Normal rotation
    } else {
      angle -= iTime * iTimeScale;  // Reverse rotation
    }

    
    // Spiral calculation
    // Creating spiral arms
    float spiral = mod(angle + radius * spiralDensity, 6.2831);  // Adjusted spiral density

    // Rainbow color mapping based on the spiral value
    float r = 0.5 + 0.5 * cos(spiral);
    float g = 0.5 + 0.5 * cos(spiral + 2.094); // 120 degrees offset
    float b = 0.5 + 0.5 * cos(spiral + 4.188); // 240 degrees offset

    gl_FragColor = vec4(r, g, b, 1.0);
}