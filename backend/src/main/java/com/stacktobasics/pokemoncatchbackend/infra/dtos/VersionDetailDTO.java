package com.stacktobasics.pokemoncatchbackend.infra.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.stacktobasics.pokemoncatchbackend.infra.dtos.evolution.NamedResourceDTO;

import java.util.List;

public class VersionDetailDTO {
    @JsonProperty("max_chance")
    public Integer maxChance;
    @JsonProperty("encounter_details")
    public List<EncounterDetailsDTO> encounterDetails;
    public NamedResourceDTO version;
}
