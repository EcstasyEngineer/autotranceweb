#ifdef GL_ES
precision highp float;
#endif

uniform float iTime;        // Time
uniform vec2 iResolution;   // Resolution
uniform vec2 uPointer;      // Pointer position (unused in this snippet)
const float iTimeScale = 1.0; // Adjust the rate of movement of circles
const float circleDensity = 36.0; // Number of "arms"
const float waveDensity = 6.0;    // Density of circles per screen radius
const float twoPi = 6.28318530718;
const float circleRadius = 0.2; // Radius of circles

void main(void)
{
    // Aspect-corrected screen coordinates [-1, 1]
    vec2 uv = (gl_FragCoord.xy / iResolution.xy) * 2.0 - 1.0;
    if (iResolution.y > iResolution.x) {
        uv.y *= iResolution.y / iResolution.x;
    } else {
        uv.x *= iResolution.x / iResolution.y;
    }

    // Polar coordinates
    float radius = length(uv);
    float angle = atan(uv.y, uv.x);
    angle = mod(angle + twoPi, twoPi); // Normalize angle to [0, 2π]

    // Compute angle of the nearest arm
    float armAngle = mod(angle * circleDensity, twoPi);

    // Calculate the coordinates of the nearest circle center, given the arm index
    float circleIndex = floor(armAngle / twoPi * circleDensity);
    float distanceFromUVtoCircleCenter = 
    length(uv - vec2(
      radius * cos(angle + twoPi * circleIndex / circleDensity), 
      radius * sin(angle + twoPi * circleIndex / circleDensity)
    ));
    
    // Color assignment based on distance to the nearest circle center
    vec3 color = vec3(0.0); // Default: black
    if (distanceFromUVtoCircleCenter < circleRadius) {
        color = vec3(1.0); // Inside a circle: white
    }

    // Set fragment color
    gl_FragColor = vec4(color, 1.0);
}