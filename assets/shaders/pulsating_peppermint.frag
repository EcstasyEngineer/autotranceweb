#ifdef GL_ES
precision highp float;
#endif

uniform float iTime;
uniform vec2 iResolution;

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    // Normalize fragment coordinates to the range [-1, 1]
    vec2 uv = (fragCoord - 0.5 * iResolution.xy) / min(iResolution.x, iResolution.y);

    // Convert to polar coordinates
    float radius = length(uv);
    float angle = atan(uv.y, uv.x);

    // Add time-based rotation
    float timeRotation = iTime;

    // Reverse chirality at specific radii
    if (radius > 2.0 / 3.0) {
        angle = -angle; // Reverse chirality
    } else if (radius > 1.0 / 3.0) {
        angle = -angle; // Reverse chirality
    }

    // Apply rotation
    angle += timeRotation;

    // Generate spiral pattern
    float pattern = sin(10.0 * angle - 20.0 * radius);

    // Map the pattern to a color gradient
    vec3 color = mix(vec3(0.0), vec3(1.0, 0.0, 0.0), 0.5 + 0.5 * sin(pattern));

    fragColor = vec4(color, 1.0);
}

void main(void) {
    vec4 color;
    mainImage(color, gl_FragCoord.xy);
    gl_FragColor = color;
}