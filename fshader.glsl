#version 300 es

precision mediump float;
in vec4 fAmbientDiffuseColor;
in vec4 fSpecularColor;
in float fSpecularExponent;

in vec3 fL;
in vec3 fH;
in vec3 fN;

out vec4 color;

uniform vec4 light_color;
uniform vec4 ambient_light;

void main()
{
    vec3 fNL = normalize(fL);
    vec3 fNH = normalize(fH);
    vec3 fNN = normalize(fN);

    vec4 fNAmbientDiffuseColor = normalize(fAmbientDiffuseColor);
    vec4 fNSpecularColor = normalize(fSpecularColor);

    vec4 ambient = fNAmbientDiffuseColor * ambient_light;

    vec4 diffuse = max(0.0, dot(fNL,fNN)) * fNAmbientDiffuseColor * light_color;

    vec4 specular = pow(max(0.0, dot(fNN,fNH)), fSpecularExponent) * fNSpecularColor * light_color;
    if(dot(fNL,fNN) < 0.0){
        specular = vec4(0.0,0.0,0.0,1.0);
    }

    color = ambient + diffuse + specular;
}