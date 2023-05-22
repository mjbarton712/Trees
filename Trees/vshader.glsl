#version 300 es

in vec4 vPosition;
in vec4 vNormal;
in vec4 vAmbientDiffuseColor;
in vec4 vSpecularColor;
in float vSpecularExponent;

out vec4 fAmbientDiffuseColor;
out vec4 fSpecularColor;
out float fSpecularExponent;
out vec3 fL;
out vec3 fH;
out vec3 fN;

uniform mat4 model_view;
uniform mat4 projection;
uniform vec4 light_position;

void main()
{
    fAmbientDiffuseColor = vAmbientDiffuseColor;
    fSpecularColor = vSpecularColor;
    fSpecularExponent = vSpecularExponent;

    vec4 veyepos = model_view * vPosition;

    vec3 L = normalize(light_position.xyz - veyepos.xyz);
    fL = L;
    vec3 V = normalize(-veyepos.xyz);

    vec3 H = normalize(L + V);
    fH = H;
    vec3 N = normalize((model_view * vNormal).xyz);
    fN = N;

    gl_Position = projection * veyepos;
}