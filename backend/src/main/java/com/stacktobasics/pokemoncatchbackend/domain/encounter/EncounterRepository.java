package com.stacktobasics.pokemoncatchbackend.domain.encounter;

import org.springframework.data.repository.CrudRepository;

import java.util.List;
import java.util.UUID;

public interface EncounterRepository extends CrudRepository<Encounter, UUID> {
    List<Encounter> findByMethodIsNullOrCatchRate(int catchRate);
}
