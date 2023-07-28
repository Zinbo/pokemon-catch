package com.stacktobasics.pokemoncatchbackend.infra.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.stacktobasics.pokemoncatchbackend.infra.dtos.evolution.NamedResourceDTO;

import java.util.List;

public class EncounterDetailsDTO {
    @JsonProperty("condition_values")
    public List<NamedResourceDTO> conditionalValues;
    public Integer chance;
    public NamedResourceDTO method;
}
