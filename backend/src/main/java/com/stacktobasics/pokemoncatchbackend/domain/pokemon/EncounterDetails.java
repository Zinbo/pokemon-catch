package com.stacktobasics.pokemoncatchbackend.domain.pokemon;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Getter
@Setter
@NoArgsConstructor
public class EncounterDetails {
    private int bestCatchRate = -1;
    private List<Encounter> encounters = new ArrayList<>();

    protected void addEncounter(int catchRate, @NonNull String location, @NonNull int gameId,
                                @NonNull String method, @NonNull String condition) {
        Optional<Encounter> existingEncounter =
                encounters.stream().filter(e -> e.getLocationName().equals(location) && e.getLocation().getGameId() == gameId
                        && e.getMethod().equals(method) && e.getCondition().equals(condition)).findFirst();
        existingEncounter.ifPresentOrElse(
                e -> {
                    e.increaseCatchRate(catchRate);
                    updateBestCatchRate(e);
                },
                () -> {
                    Encounter e = new Encounter(catchRate, location, gameId, method, condition);
                    encounters.add(e);
                    updateBestCatchRate(e);
                });
    }

    private void updateBestCatchRate(Encounter e) {
        bestCatchRate = Math.max(bestCatchRate, e.getCatchRate());
    }
}
