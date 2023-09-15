package com.stacktobasics.pokemoncatchbackend.domain.pokemon;

import com.stacktobasics.pokemoncatchbackend.domain.exceptions.InvalidInputException;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class Encounter {
    int catchRate;
    Location location;
    String method;
    List<String> conditions;

    public Encounter(int catchRate, @NonNull String location, int gameId,
                     @NonNull String method, @NonNull List<String> conditions) {
        this.method = method;
        this.conditions = conditions;
        if(catchRate <= 0) throw new InvalidInputException("Catch rate cannot be below 0");
        this.catchRate = catchRate;
        this.location = new Location(location, gameId);
    }

    public String getLocationName() {
        return location.getName();
    }

    public String getMethod() {
        return method;
    }

    public List<String> getConditions() {
        return conditions;
    }

    public void increaseCatchRate(int catchRate) {
        this.catchRate += catchRate;
    }
}
