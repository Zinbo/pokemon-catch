package com.stacktobasics.pokemoncatchbackend.domain.pokemon;

import com.stacktobasics.pokemoncatchbackend.domain.exceptions.InvalidInputException;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.Setter;
import org.springframework.util.StringUtils;

@Getter
@Setter
@NoArgsConstructor
public class Location {
    String name;
    int gameId;

    public Location(@NonNull String name, int gameId) {
        if(StringUtils.isEmpty(name)) {
            throw new InvalidInputException("location cannot be blank");
        }
        this.name = name;
        this.gameId = gameId;
    }
}
