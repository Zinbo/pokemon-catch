package com.stacktobasics.pokemoncatchbackend.infra.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.stacktobasics.pokemoncatchbackend.infra.dtos.evolution.NamedResourceDTO;

import java.util.List;

public class EncounterDTO {
    @JsonProperty("location_area")
    public NamedResourceDTO locationArea;

    @JsonProperty("version_details")
    public List<VersionDetailDTO> versionDetails;
}
