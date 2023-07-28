package com.stacktobasics.pokemoncatchbackend.infra.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;

public class OfficialArtworkDTO {

    @JsonProperty("front_default")
    public String frontDefault;
}
