#ifdef GL_ES
precision highp float;
#endif

uniform float iTime;
uniform vec2 iResolution;

// Spiral code from your snippet:
float num_arms = 3.0;
float rotation_speed = 4.;
float spiral_angle = 60.;
float pattern_speed = 2.;
float warp_speed = 0.;

// Functions to compute colormap
float colormap_red(float x) {
    if (x < 0.0) {
        return 54.0 / 255.0;
    } else if (x < 20049.0 / 82979.0) {
        return (829.79 * x + 54.51) / 255.0;
    } else {
        return 1.0;
    }
}
float colormap_green(float x) {
    if (x < 20049.0 / 82979.0) {
        return 0.0;
    } else if (x < 327013.0 / 810990.0) {
        return (8546482679670.0 / 10875673217.0 * x - 2064961390770.0 / 10875673217.0) / 255.0;
    } else if (x <= 1.0) {
        return (103806720.0 / 483977.0 * x + 19607415.0 / 483977.0) / 255.0;
    } else {
        return 1.0;
    }
}
float colormap_blue(float x) {
    if (x < 0.0) {
        return 54.0 / 255.0;
    } else if (x < 7249.0 / 82979.0) {
        return (829.79 * x + 54.51) / 255.0;
    } else if (x < 20049.0 / 82979.0) {
        return 127.0 / 255.0;
    } else if (x < 327013.0 / 810990.0) {
        return (792.0224934136 * x - 64.3647907356) / 255.0;
    } else {
        return 1.0;
    }
}
vec4 colormap(float x) {
    return vec4(colormap_red(x), colormap_green(x), colormap_blue(x), 1.0);
}

// Noise & fbm
float rand(vec2 n) {
    return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}
float noise(vec2 p){
    vec2 ip = floor(p);
    vec2 u = fract(p);
    u = u * u * (3.0 - 2.0 * u);

    float res = mix(
        mix(rand(ip), rand(ip+vec2(1.0,0.0)), u.x),
        mix(rand(ip+vec2(0.0,1.0)), rand(ip+vec2(1.0,1.0)), u.x),
        u.y
    );
    return res * res;
}
const mat2 mtx = mat2(0.80, 0.60, -0.60, 0.80);

float fbm(vec2 p)
{
    float f = 0.0;
    f += 0.500000 * noise(p + pattern_speed * iTime); 
    p = mtx * p * 2.02;

    f += 0.031250 * noise(p); 
    p = mtx * p * 2.01;

    f += 0.250000 * noise(p); 
    p = mtx * p * 2.03;

    f += 0.125000 * noise(p); 
    p = mtx * p * 2.01;

    f += 0.062500 * noise(p); 
    p = mtx * p * 2.04;

    f += 0.015625 * noise(p + sin(pattern_speed * iTime));
    return f / 0.96875;
}

float pattern(vec2 p){
    float radius = p.x;
    float angle = p.y;
    return fbm(vec2(radius, angle) 
             + fbm(vec2(radius, angle) 
             + fbm(vec2(radius, angle))));
}

void mainImage(out vec4 fragColor, in vec2 fragCoord){
    vec2 uv = (fragCoord - 0.5 * iResolution.xy)
             / min(iResolution.y, iResolution.x);

    float radius = length(uv);
    float angle  = num_arms * atan(uv.y, uv.x);
    angle += spiral_angle * radius;
    angle += rotation_speed * iTime;
    angle = mod(angle, 6.283185307);

    float shade = pattern(vec2(radius, angle));
    fragColor = vec4(colormap(shade).rgb, shade);
}

void main(void){
    vec4 color;
    mainImage(color, gl_FragCoord.xy);
    gl_FragColor = color;
}