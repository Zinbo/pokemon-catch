package com.stacktobasics.pokemoncatchbackend.api;

import com.stacktobasics.pokemoncatchbackend.AdminTools;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;

@RestController
@RequestMapping("admin")
@Slf4j
public class AdminController {

    private final AdminTools adminTools;

    public AdminController(AdminTools adminTools) {
        this.adminTools = adminTools;
    }

    @PostMapping(value = "/save-pokemon-files")
    public void savePokemonFiles() throws IOException {
        log.info("Saving pokemon files...");
        adminTools.savePokemonFiles();
        log.info("Saved pokemon files.");
    }

    @PostMapping(value = "/save-individual-pokemon-files")
    public void saveIndividualPokemonFiles() throws IOException {
        log.info("Saving pokemon files...");
        adminTools.saveIndividualPokemonFiles();
        log.info("Saved pokemon files.");
    }

    @PostMapping(value = "/save-name-to-id")
    public void saveNameToIdMap() throws IOException {
        log.info("Saving name to id map...");
        adminTools.saveNameToIdMap();
        log.info("Saved name to id map.");
    }

    @PostMapping(value = "/save-evolution-chains")
    public void saveEvolutionChains() throws IOException {
        adminTools.saveEvolutionChains();
    }

}
