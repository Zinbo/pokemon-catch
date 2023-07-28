package com.stacktobasics.pokemoncatchbackend.infra.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;

public class OtherSpritesDTO {

    @JsonProperty("official-artwork")
    public OfficialArtworkDTO officialArtwork;
}
