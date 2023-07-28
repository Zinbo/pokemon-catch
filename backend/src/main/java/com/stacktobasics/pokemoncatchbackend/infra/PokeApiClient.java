package com.stacktobasics.pokemoncatchbackend.infra;

import com.stacktobasics.pokemoncatchbackend.InternalException;
import com.stacktobasics.pokemoncatchbackend.infra.dtos.*;
import com.stacktobasics.pokemoncatchbackend.infra.dtos.evolution.PokemonEvolutionDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.time.LocalTime;
import java.util.*;

@Component
@Slf4j
public class PokeApiClient {

    public static final String POKEAPI_BASE_URL = "https://pokeapi.co/api/v2/";
    private final RestTemplate restTemplate;
    private final boolean shouldGetAllPokemon;
    public static final int LAST_GENERATION = 8;
    public static final Map<String, Object> cache = new HashMap<>();

    public PokeApiClient(@Value("${feature-toggle.should-get-all-pokemon}") boolean shouldGetAllPokemon) {
        this.restTemplate = new RestTemplate();
        this.shouldGetAllPokemon = shouldGetAllPokemon;
    }

    public List<GameDTO> getGames() {
        boolean done = false;
        List<GameDTO> games = new ArrayList<>();
        int i = 1;
        while(!done) {
            try {
                String url = String.format("%s/version/%s", POKEAPI_BASE_URL, i++);
                games.add(getDTO(url, GameDTO.class));
            } catch(HttpClientErrorException e) {
                if(e.getRawStatusCode() == 404) done = true;
                else throw e;
            }
        }
        return games;
    }

    public String getEnglishName(String url) {
        return Optional.ofNullable(getNames(url))
                .map(dto ->
                dto.names.stream()
                    .filter(n -> n.language.name.equals("en")).findFirst()
                    .map(n -> n.name).orElse(StringUtils.capitalize(dto.name)))
                .orElseThrow(() -> new InternalException("Could not get name for URL: " + url));
    }

    public NamesDTO getNames(String url) {
        return getDTO(url, NamesDTO.class);
    }

    public String getLocationName(String url) {
        return Optional.ofNullable(getDTO(url, LocationAreaDTO.class))
        .map(dto ->
                dto.names.stream()
                        .filter(n -> n.language.name.equals("en")).findFirst()
                        .flatMap(n -> StringUtils.isEmpty(n.name) ? Optional.empty() : Optional.of(n.name))
                        .orElseGet(() -> getEnglishName(dto.location.url)))
                .orElseThrow(() -> new InternalException("Could not get location name for URL: " + url));
    }

    public <T> T getDTO(String url, Class<T> clazz){
        if(cache.containsKey(url)) {
            log.info("Returning object from cache for url: [{}]", url);
            return (T) cache.get(url);
        }
        LocalTime before = LocalTime.now();
        T dto = restTemplate.getForObject(url, clazz);
        cache.put(url, dto);
        LocalTime after = LocalTime.now();
        log.info("Call to [{}] took [{}] milliseconds", url, Duration.between(before, after).toMillis());
        return dto;
    }

    public List<PokemonDTO> getPokemon() {
        if (shouldGetAllPokemon) return getAllPokemon();
        return getFirst50Pokemon();
    }

    public List<GenerationDTO> getGenerations() {
        List<GenerationDTO> generations = new ArrayList<>();
        for (int i = 1; i <= LAST_GENERATION; i++) {
            String url = String.format("%s/generation/%s", POKEAPI_BASE_URL, i);
            generations.add(getDTO(
                    url,
                    GenerationDTO.class));
        }
        return generations;
    }

    private List<PokemonDTO> getFirst50Pokemon() {
        List<PokemonDTO> pokemons = new ArrayList<>();
        for (int i = 1; i <= 50; i++) {
            if(i % 10 == 0) log.info("got {} pokemon...", i);
            String url = String.format("%s/pokemon/%s", POKEAPI_BASE_URL, i);
            PokemonDTO pokemon = getDTO(
                    url,
                    PokemonDTO.class);
            pokemons.add(pokemon);
        }
        return pokemons;
    }

    public List<PokemonEvolutionDTO> getEvolutionChains() {
        if(shouldGetAllPokemon) return getAllEvolutionChains();
        return getFirstXEvolutionChains();
    }

    private List<PokemonEvolutionDTO> getFirstXEvolutionChains() {
        List<PokemonEvolutionDTO> allEvolutionChains = new ArrayList<>();
        for (int i = 1; i <= 20; i++) {
            String url = String.format("%s/evolution-chain/%s", POKEAPI_BASE_URL, i);
            PokemonEvolutionDTO pokemon = getDTO(
                    url,
                    PokemonEvolutionDTO.class);
            allEvolutionChains.add(pokemon);
        }
        return allEvolutionChains;
    }

    private List<PokemonEvolutionDTO> getAllEvolutionChains() {
        boolean done = false;
        List<PokemonEvolutionDTO> allEvolutionChains = new ArrayList<>();
        int i = 1;
        while(!done) {
            try {
                String url = String.format("%s/evolution-chain/%s", POKEAPI_BASE_URL, i++);
                allEvolutionChains.add(getDTO(url, PokemonEvolutionDTO.class));
            } catch(HttpClientErrorException e) {
                if(e.getRawStatusCode() == 404) done = true;
                else throw e;
            }
        }
        return allEvolutionChains;
    }

    private List<PokemonDTO> getAllPokemon() {
        boolean done = false;
        List<PokemonDTO> allPokemon = new ArrayList<>();
        int i = 1;
        while(!done) {
            try {
                String url = String.format("%s/pokemon/%s", POKEAPI_BASE_URL, i++);
                allPokemon.add(getDTO(url, PokemonDTO.class));
            } catch(HttpClientErrorException e) {
                if(e.getRawStatusCode() == 404) done = true;
                else throw e;
            }
        }
        return allPokemon;
    }

    public List<EncounterDTO> getEncountersForPokemon(Integer id) {
        String url = String.format("%s/pokemon/%s/encounters", POKEAPI_BASE_URL, id);
        EncounterDTO[] dtos = getDTO(url, EncounterDTO[].class);
        if(dtos == null) return new ArrayList<>();
        return Arrays.asList(dtos);
    }
}
