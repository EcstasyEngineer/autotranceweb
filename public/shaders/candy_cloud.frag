#ifdef GL_ES
precision highp float;
#endif

uniform float iTime;
uniform vec2 iResolution;

// HSV to RGB conversion function
vec3 hsv(float h, float s, float v){
    vec3 rgb = clamp(abs(mod(h * 6.0 + vec3(0, 4, 2), 6.0) - 3.0) - 1.0, 0.0, 1.0);
    rgb = mix(vec3(1.0), rgb, s);
    return rgb * v;
}

// Noise & fbm functions
float rand(vec2 n) {
    return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

float noise(vec2 p){
    vec2 ip = floor(p);
    vec2 u = fract(p);
    u = u * u * (3.0 - 2.0 * u);

    float res = mix(
        mix(rand(ip), rand(ip + vec2(1.0, 0.0)), u.x),
        mix(rand(ip + vec2(0.0, 1.0)), rand(ip + vec2(1.0, 1.0)), u.x),
        u.y
    );
    return res;
}

const mat2 mtx = mat2(0.80, 0.60, -0.60, 0.80);

float fbm(vec2 p)
{
    float f = 0.0;
    f += 0.500000 * noise(p + 0.0 * iTime); 
    p = mtx * p * 2.02;

    f += 0.250000 * noise(p + 1.0 * iTime); 
    p = mtx * p * 2.03;

    f += 0.125000 * noise(p + 2.0 * iTime); 
    p = mtx * p * 2.01;

    f += 0.062500 * noise(p + 3.0 * iTime); 
    p = mtx * p * 2.04;

    f += 0.031250 * noise(p + 4.0 * iTime);
    return f / 0.96875;
}

float pattern(vec2 p){
    return fbm(p);
}

// Color mapping using HSV
vec3 colormap(float t) {
    float hue = t;
    float saturation = 0.6;
    float value = 1.0;
    return hsv(hue, saturation, value);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord){
    // Normalize coordinates
    vec2 uv = fragCoord / iResolution.xy;

    // Center the coordinates
    vec2 p = uv - 0.5;

    // Adjust for aspect ratio
    p.x *= iResolution.x / iResolution.y;

    // Compute the pattern
    float t = pattern(p * 3.0 - vec2(iTime * 0.1, iTime * 0.1));

    // Apply color mapping
    vec3 color = colormap(t);

    fragColor = vec4(color, 1.0);
}

void main(void){
    vec4 color;
    mainImage(color, gl_FragCoord.xy);
    gl_FragColor = color;
}
