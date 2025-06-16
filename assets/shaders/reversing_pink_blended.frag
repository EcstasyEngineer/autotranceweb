#ifdef GL_ES
precision highp float;
#endif

uniform float iTime;
uniform vec2  iResolution;

// Spiral parameters
const float iTimeScale    = 3.25;
const float spiralDensity = 20.0;
const float numSpirals    = 3.0;
const float boundaryBuffer = 1.0 / 9.0;  // Blend region width near each boundary
const float pulseSpeed    = 1.2;         // Speed of the pulse

// Returns a rainbow color based on spiral angle
vec3 getSpiralColor(float angle, float radius)
{
    // Spiral position
    float spiral = mod(angle + radius * spiralDensity, 6.2831); // 2π ~ 6.2831
    // Rainbow color mapping
    float factor = 0.5 + 0.5 * cos(numSpirals * spiral);
    vec3 neonPink = vec3(1.0, 0.0, 0.6);
    vec3 white    = vec3(1.0);
    vec3 mixed    = mix(neonPink, white, factor);

    return mixed;
}

void main(void)
{
    // Normalize coordinates: [-1,1] in the longer axis, keep aspect ratio
    vec2 uv = (gl_FragCoord.xy / iResolution.xy) * 2.0 - 1.0;
    if (iResolution.y > iResolution.x) {
        uv.y *= iResolution.y / iResolution.x;
    } else {
        uv.x *= iResolution.x / iResolution.y;
    }

    float pulse = 0.9 + 0.1 * sin(iTime * pulseSpeed); // Oscillates between 0.9 and 1.0
    float radius = length(uv) * pulse;
    float angle  = atan(uv.y, uv.x);

    // Identify region and determine reversals
    float regionIndex = floor(radius * 3.0);
    regionIndex = clamp(regionIndex, 0.0, 2.0);
    float isReverseCurrent = mod(regionIndex, 2.0);
    float nextBoundary = (regionIndex < 2.0) ? (regionIndex + 1.0) / 3.0 : 1.0;
    float distFromBoundary = abs(radius - nextBoundary);
    float blendFactor = (distFromBoundary < boundaryBuffer) 
        ? 1.0 - distFromBoundary / boundaryBuffer 
        : 0.0;
    blendFactor = clamp(blendFactor, 0.0, 1.0);
    float isReverseNext = mod(regionIndex + 1.0, 2.0);

    // Compute spirals
    float angleNormal  = angle + iTime * iTimeScale;
    float angleReverse = angle - iTime * iTimeScale;
    vec3 colorNormal  = getSpiralColor(angleNormal,  radius);
    vec3 colorReverse = getSpiralColor(angleReverse, radius);

    // Blend colors based on region and boundary
    vec3 colorPrimary   = (isReverseCurrent < 0.5) ? colorNormal : colorReverse;
    vec3 colorSecondary = (isReverseNext    < 0.5) ? colorNormal : colorReverse;
    vec3 finalColor = (blendFactor > 0.0) 
        ? mix(colorPrimary, colorSecondary, blendFactor) 
        : colorPrimary;

    gl_FragColor = vec4(finalColor, 1.0);
}
