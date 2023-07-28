package com.stacktobasics.pokemoncatchbackend.infra.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;

public class SpritesDTO {
    @JsonProperty("front_default")
    public String frontDefault;
    public OtherSpritesDTO other;
}
