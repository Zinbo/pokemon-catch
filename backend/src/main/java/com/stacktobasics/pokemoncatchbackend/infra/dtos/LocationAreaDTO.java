package com.stacktobasics.pokemoncatchbackend.infra.dtos;

import com.stacktobasics.pokemoncatchbackend.infra.dtos.evolution.NamedResourceDTO;

import java.util.List;

public class LocationAreaDTO {
    public String name;
    public List<NameDTO> names;
    public NamedResourceDTO location;
}
