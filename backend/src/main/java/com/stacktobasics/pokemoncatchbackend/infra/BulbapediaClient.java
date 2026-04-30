package com.stacktobasics.pokemoncatchbackend.infra;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.stacktobasics.pokemoncatchbackend.domain.encounter.Encounter;
import com.stacktobasics.pokemoncatchbackend.domain.encounter.EncounterRepository;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.nodes.Node;
import org.jsoup.nodes.TextNode;
import org.jsoup.select.Elements;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Component
@Slf4j
public class BulbapediaClient {

    // Cases to handle:
    // Grand Underground - Grassland Cave, Sunlit Cavern, Swampy Cave, Riverbank Cave, Still-Water Cavern, Bogsunk Cavern (after obtaining the National Pokédex) - Bulbasaur
    //  Gold doesn't have the catch rate and method set for routes.
    // Need to print out all of those records which at the end don't have any method (and later catch rate)
    // Finding walking-morning-31 for Caterpie on Route 2 twice
    // National park and ilex forest are all messed up

    private static final String ALL_POKEMON_PAGE = "List_of_Pokémon_by_National_Pokédex_number";
    private static final String BASE_URL = "https://bulbapedia.bulbagarden.net/w/api.php";

    private static final List<String> GAMES = List.of(
            "Red", "Blue", "Yellow", "Gold", "Silver", "Crystal",
            "Ruby", "Sapphire", "Emerald", "FireRed", "LeafGreen",
            "Diamond", "Pearl", "Platinum", "HeartGold", "SoulSilver",
            "Black", "White", "Black 2", "White 2",
            "X", "Y", "Omega Ruby", "Alpha Sapphire",
            "Sun", "Moon", "Ultra Sun", "Ultra Moon", "Let's Go Pikachu", "Let's Go Eevee",
            "Sword", "Shield", "Expansion Pass", "Brilliant Diamond", "Shining Pearl", "Legends: Arceus",
            "Scarlet", "Violet", "Legends: Z-A", "Mega Dimension");

    private static final Map<Integer, List<String>> GenerationsToGames = Map.of(
            1, List.of("Red", "Blue", "Yellow"),
            2, List.of("Gold", "Silver", "Crystal"),
            3, List.of("Ruby", "Sapphire", "Emerald", "FireRed", "LeafGreen"),
            4, List.of("Diamond", "Pearl", "Platinum", "HeartGold", "SoulSilver"),
            5, List.of("Black", "White", "Black 2", "White 2"),
            6, List.of("X", "Y", "Omega Ruby", "Alpha Sapphire"),
            7, List.of("Sun", "Moon", "Ultra Sun", "Ultra Moon", "Let's Go Pikachu", "Let's Go Eevee"),
            8, List.of("Sword", "Shield", "Expansion Pass", "Brilliant Diamond", "Shining Pearl", "Legends: Arceus"),
            9, List.of("Scarlet", "Violet", "Legends: Z-A", "Mega Dimension")
    );

    private static final List<String> IGNORED_ENCOUNTERS = List.of("Trade", "Time Capsule", "Pokémon HOME", "Wild Area News", "Global Link", "Poké Transfer", "Event", "Global Link Event", "Pokémon HOME Event", "Unobtainable");
    private static final List<String> IGNORED_ENCOUNTERS_STARTS_WITH = List.of("TradeVersion", "Evolve", "Friend Safari");

    // ── Phase 1: text-pattern matching for known encounter types ─────────────

    private static final Map<String, String> DAY_ABBREVIATIONS = Map.of(
            "Mo", "Monday", "Tu", "Tuesday", "We", "Wednesday",
            "Th", "Thursday", "Fr", "Friday", "Sa", "Saturday", "Su", "Sunday"
    );

    private static final Set<String> GROUP_LEVEL_METHODS = Set.of(
            "Max Raid Battle", "Tera Raid Battle", "Dynamax Adventure"
    );

    private static final Pattern GIFT_FIRST_PARTNER = Pattern.compile(
            "^First partner Pokémon from .+? in (.+?)$", Pattern.CASE_INSENSITIVE);

    private static final Pattern GIFT_RECEIVED_IF = Pattern.compile(
            "^Received from .+? in (.+?)\\s+if (.+)$", Pattern.CASE_INSENSITIVE);

    private static final Pattern GIFT_RECEIVED_FROM = Pattern.compile(
            "^Received from .+? in (.+?)(?:\\s+after (.+))?$", Pattern.CASE_INSENSITIVE);

    private static final Pattern ISLAND_SCAN = Pattern.compile(
            "^(.+?)\\s*\\(Island Scan\\)(Mo|Tu|We|Th|Fr|Sa|Su)$", Pattern.CASE_INSENSITIVE);

    private static final Pattern DAYS = Pattern.compile(
            "(Mo|Tu|We|Th|Fr|Sa|Su)"
    );
    private static final Pattern TRADE_PATTERN = Pattern.compile(
            "^Trade (.+?) on (.+?)$", Pattern.CASE_INSENSITIVE);

    private static final Pattern PAREN_METHOD_SUFFIX = Pattern.compile(
            "^(.*?)\\s*\\(([^)]+)\\)\\s*$");

    // ── Phase 2: location-page parsing ──────────────────────────────────────

    // Game name → Bulbapedia table column abbreviation. Clashes (R=Red/Ruby, S=Silver/Sun/Scarlet, etc.)
    // are safe because location pages are region-specific: a Kanto page never has a Hoenn Gen 3 table.
    private static final Map<String, String> GAME_TO_ABBREVIATION = Map.ofEntries(
            Map.entry("Red", "R"),           Map.entry("Blue", "B"),          Map.entry("Yellow", "Y"),
            Map.entry("Gold", "G"),          Map.entry("Silver", "S"),         Map.entry("Crystal", "C"),
            Map.entry("Ruby", "R"),          Map.entry("Sapphire", "S"),       Map.entry("Emerald", "E"),
            Map.entry("FireRed", "FR"),      Map.entry("LeafGreen", "LG"),
            Map.entry("Diamond", "D"),       Map.entry("Pearl", "P"),          Map.entry("Platinum", "Pt"),
            Map.entry("HeartGold", "HG"),    Map.entry("SoulSilver", "SS"),
            Map.entry("Black", "B"),         Map.entry("White", "W"),
            Map.entry("Black 2", "B2"),      Map.entry("White 2", "W2"),
            Map.entry("X", "X"),             Map.entry("Y", "Y"),
            Map.entry("Omega Ruby", "OR"),   Map.entry("Alpha Sapphire", "AS"),
            Map.entry("Sun", "S"),           Map.entry("Moon", "M"),
            Map.entry("Ultra Sun", "US"),    Map.entry("Ultra Moon", "UM"),
            Map.entry("Let's Go Pikachu", "P"), Map.entry("Let's Go Eevee", "E"),
            Map.entry("Sword", "Sw"),        Map.entry("Shield", "Sh"),        Map.entry("Expansion Pass", "SwSh"),
            Map.entry("Brilliant Diamond", "BD"), Map.entry("Shining Pearl", "SP"),
            Map.entry("Legends: Arceus", "LA"),
            Map.entry("Scarlet", "S"),       Map.entry("Violet", "V"),
            Map.entry("Legends: Z-A", "ZA"), Map.entry("Mega Dimension", "MD")
    );

    // Image alt text in the Location cell → human-readable method name
    private static final Map<String, String> METHOD_ALT_TO_NAME = Map.ofEntries(
            Map.entry("Grass", "Walking"),
            Map.entry("Tall grass", "Walking"),
            Map.entry("Surfing", "Surfing"),
            Map.entry("Old Rod", "Old Rod"),
            Map.entry("Good Rod", "Good Rod"),
            Map.entry("Super Rod", "Super Rod"),
            Map.entry("Headbutt", "Headbutt"),
            Map.entry("Dark grass", "Dark Grass"),
            Map.entry("Rustling grass", "Rustling Grass"),
            Map.entry("Rippling water", "Rippling Water"),
            Map.entry("Rock Smash", "Rock Smash"),
            Map.entry("Swarm", "Swarm"),
            Map.entry("Gift", "Received as gift"),
            Map.entry("Berry tree", "Berry Tree"),
            Map.entry("Poké Radar", "Poké Radar"),
            Map.entry("Fishing", "Fishing")
    );

    // td background-color → condition label. Used to identify time-of-day and weather rate cells.
    // Colors are lower-cased for case-insensitive matching against style attribute values.
    private static final Map<String, String> CONDITION_CELL_COLORS = new LinkedHashMap<>();
    static {
        // Time-of-day (Gen 2, 4, 7, 8 BDSP)
        CONDITION_CELL_COLORS.put("#a5dfec", "Morning");
        CONDITION_CELL_COLORS.put("#a9d7fd", "Day");
        CONDITION_CELL_COLORS.put("#cec2ef", "Night");
        // Evening (Gen 9) — placeholder color, verify when testing Paldea locations
        CONDITION_CELL_COLORS.put("#f5deb3", "Evening");
        // Weather (Gen 8 Wild Area) — same colors as column headers
        CONDITION_CELL_COLORS.put("#ffe57a", "Clear");
        CONDITION_CELL_COLORS.put("#82c274", "Cloudy");
        CONDITION_CELL_COLORS.put("#74acf5", "Rain");
        CONDITION_CELL_COLORS.put("#998b8c", "Thunderstorm");
        CONDITION_CELL_COLORS.put("#81dff7", "Snow");
        CONDITION_CELL_COLORS.put("#98d8d8", "Blizzard");
        CONDITION_CELL_COLORS.put("#ef7374", "Harsh sunlight");
        CONDITION_CELL_COLORS.put("#d1c17d", "Sandstorm");
        CONDITION_CELL_COLORS.put("#a292bc", "Fog");
    }

    // Image alt texts used in column headers to detect the table's rate-column format
    private static final Set<String> TIME_CONDITION_ALTS = Set.of("Morning", "Day", "Evening", "Night");
    private static final Set<String> WEATHER_CONDITION_ALTS = Set.of(
            "Clear", "Cloudy", "Rain", "Thunderstorm", "Snow", "Blizzard",
            "Harsh sunlight", "Sandstorm", "Fog"
    );

    private static final Pattern BG_COLOR_PATTERN = Pattern.compile(
            "background(?:-color)?\\s*:\\s*(#[0-9a-fA-F]{3,8})", Pattern.CASE_INSENSITIVE);

    private static final int LIMIT = 20;

    private final EncounterRepository encounterRepository;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public BulbapediaClient(EncounterRepository encounterRepository) {
        this.encounterRepository = encounterRepository;
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    // ── Phase 1: populate encounters from Pokémon pages ──────────────────────

    public void populateEncounters() {
        List<PokemonEntry> pokemonEntries;
        try {
            pokemonEntries = getPokemonList();
        } catch (Exception e) {
            log.error("Failed to get Pokemon list from Bulbapedia", e);
            return;
        }
        log.info("Found {} unique Pokemon pages to process", pokemonEntries.size());

        List<Encounter> allEncounters = new ArrayList<>();
        for (int i = 9; i < 10; i++) {
            /*if (i == LIMIT) {
                log.info("Stopping at LIMIT {}.", LIMIT);
                break;
            }*/
            var entry = pokemonEntries.get(i);
            try {
                log.info("Processing {} (#{})", entry.name(), entry.dexNumber());
                List<Encounter> encounters = getEncountersForPokemon(entry);
                if (!encounters.isEmpty()) {
                    encounterRepository.saveAll(encounters);
                    log.info("Saved {} encounters for {}", encounters.size(), entry.name());
                    allEncounters.addAll(encounters);
                }
                Thread.sleep(1000);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                log.warn("Interrupted while populating encounters, stopping");
                return;
            } catch (Exception e) {
                log.error("Error processing {}: {}", entry.name(), e.getMessage());
            }
        }

        log.info("All encounter text found:");
        allEncounters.forEach(e -> log.info("[{}] {}: {}", e.getGame(), e.getPokemonName(), e.getCleanedUpEncounterText()));

        log.info("Enriching encounter info now...");
        enrichEncountersFromLocationPages();
        log.info("Finished enriching encounters now.");
    }

    // Generic Bulbapedia pages that appear as "type" prefixes in multi-location cells
    // (e.g. "<a href='/wiki/Route'>Routes</a> <a href='/wiki/Kanto_Route_2'>2</a>")
    // and must be skipped when extracting a specific location page title.
    private static final Set<String> GENERIC_LOCATION_PAGES = Set.of(
            "Route", "Cave", "Town", "City", "Forest", "Road", "Path", "Island"
    );

    // ── Phase 2: enrich encounters from location pages ────────────────────────

    public void enrichEncountersFromLocationPages() {
        List<Encounter> toEnrich = encounterRepository.findByMethodIsNull();
        log.info("Enriching {} encounters from location pages", toEnrich.size());

        // Group by page title to fetch each location page only once
        Map<String, List<Encounter>> byPage = new LinkedHashMap<>();
        for (Encounter enc : toEnrich) {
            extractPageTitleFromHtml(enc.getEncounterHtml())
                    .ifPresent(pt -> byPage.computeIfAbsent(pt, k -> new ArrayList<>()).add(enc));
        }
        log.info("Fetching {} unique location pages", byPage.size());

        for (Map.Entry<String, List<Encounter>> entry : byPage.entrySet()) {
            String pageTitle = entry.getKey();
            try {
                String html = fetchLocationPokemonSection(pageTitle);
                if (html == null) {
                    log.warn("No Pokémon section found for location page: {}", pageTitle);
                    continue;
                }

                for (Encounter enc : entry.getValue()) {
                    List<LocationEncounterData> results = parseLocationSection(html, enc.getPokemonName(), enc.getGame(), enc.getLocation());
                    if (results.isEmpty()) {
                        log.debug("No encounter data found for {} at {} ({})", enc.getPokemonName(), pageTitle, enc.getGame());
                        continue;
                    }
                    // Replace the original encounter with one record per time/weather slot
                    for (LocationEncounterData data : results) {
                        Encounter expanded = copyEncounterBaseFields(enc);
                        expanded.setMethod(data.method());
                        expanded.setCatchRate(data.catchRate());
                        expanded.setConditions(mergeConditions(enc.getConditions(), data.conditions()));
                        encounterRepository.save(expanded);
                    }
                    encounterRepository.delete(enc);
                }

                Thread.sleep(1000);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                log.warn("Interrupted during location enrichment, stopping");
                return;
            } catch (Exception e) {
                log.error("Failed to enrich from page {}: {}", pageTitle, e.getMessage());
            }
        }
    }

    // Extracts the /wiki/PageTitle from the encounterHtml anchor links.
    // Skips generic category pages (e.g. /wiki/Route) that appear as type prefixes in
    // multi-location cells like "<a href='/wiki/Route'>Routes</a> <a href='/wiki/Kanto_Route_2'>2</a>".
    private static Optional<String> extractPageTitleFromHtml(String encounterHtml) {
        if (encounterHtml == null || encounterHtml.isBlank()) return Optional.empty();
        for (Element a : Jsoup.parseBodyFragment(encounterHtml).select("a[href^=/wiki/]")) {
            String pageTitle = a.attr("href").substring("/wiki/".length());
            if (!GENERIC_LOCATION_PAGES.contains(pageTitle)) {
                return Optional.of(pageTitle);
            }
        }
        return Optional.empty();
    }

    // Fetches the "Pokémon" section HTML from a location page, or null if not found.
    private String fetchLocationPokemonSection(String pageTitle) throws Exception {
        String sectionsJson = restTemplate.getForObject(
                UriComponentsBuilder.fromHttpUrl(BASE_URL)
                        .queryParam("action", "parse")
                        .queryParam("format", "json")
                        .queryParam("prop", "sections")
                        .queryParam("page", pageTitle)
                        .build().encode().toUri(),
                String.class);

        JsonNode root = objectMapper.readTree(sectionsJson);
        if (root.has("error")) {
            log.warn("Bulbapedia API error for {}: {}", pageTitle, root.path("error").path("info").asText());
            return null;
        }

        String sectionIndex = null;
        for (JsonNode section : root.path("parse").path("sections")) {
            if ("Pokémon".equals(section.path("line").asText())) {
                sectionIndex = section.path("index").asText();
                break;
            }
        }
        if (sectionIndex == null) return null;

        String htmlJson = restTemplate.getForObject(
                UriComponentsBuilder.fromHttpUrl(BASE_URL)
                        .queryParam("action", "parse")
                        .queryParam("format", "json")
                        .queryParam("prop", "text")
                        .queryParam("section", sectionIndex)
                        .queryParam("page", pageTitle)
                        .build().encode().toUri(),
                String.class);

        return objectMapper.readTree(htmlJson).path("parse").path("text").path("*").asText();
    }

    // Parses a location page's Pokémon section HTML, returning encounter data for the given
    // Pokémon and game. Returns one entry per time/weather slot where encounter rate > 0.
    private static List<LocationEncounterData> parseLocationSection(String html, String pokemonName, String game, String location) {
        Document doc = Jsoup.parse(html);
        String abbreviation = GAME_TO_ABBREVIATION.getOrDefault(game, game);
        List<LocationEncounterData> results = new ArrayList<>();

        // Track current h4 header for Gen 8 Wild Area sections ("Hidden encounters", "Visible encounters", "Wanderers")
        String currentSectionMethod = null;

        for (Element element : doc.select("h4, table")) {
            if ("h4".equals(element.tagName())) {
                currentSectionMethod = sectionHeaderToMethod(element.text().trim());
                continue;
            }

            // Table element
            if (!elementHasGameRowSelected(element, abbreviation)) continue;

            ColumnFormat format = detectColumnFormat(element);
            List<Element> rows = findPokemonRows(element, pokemonName, abbreviation, location);
            for (Element row : rows) {
                results.addAll(extractFromRow(row, format, currentSectionMethod));
            }
        }


        results.sort(Comparator.comparing(LocationEncounterData::catchRate).reversed());

        return resultsWithDuplicatesRemoved(results);
    }

    private static List<LocationEncounterData> resultsWithDuplicatesRemoved(List<LocationEncounterData> results) {
        // Remove any duplicates, take the highest catch rate if there are duplicates
        record MethodAndConditions(String method, List<String> conditions){}
        Set<MethodAndConditions> seenEntries = new HashSet<>();
        return results.stream().filter(r -> {
            MethodAndConditions methodAndConditions = new MethodAndConditions(r.method, r.conditions);
            if (seenEntries.contains(methodAndConditions)) return false;
            seenEntries.add(methodAndConditions);
            return true;
        }).toList();
    }

    // Maps Gen 8 Wild Area h4 section headers to method names.
    private static String sectionHeaderToMethod(String headerText) {
        return switch (headerText) {
            case "Hidden encounters"  -> "Walking (Hidden)";
            case "Visible encounters" -> "Walking (Overworld)";
            case "Wanderers"          -> "Wanderer";
            default                   -> null;
        };
    }

    // Returns true if any <th> in the table has text exactly matching the game abbreviation.
    // Game version indicators always appear as the sole text content of a <th> element.
    private static boolean elementHasGameRowSelected(Element table, String abbreviation) {
        for (Element th : table.select("th")) {
            var isForRightGame = th.text().trim().equals(abbreviation);
            if (!isForRightGame) continue;
            var styleComponents = th.attr("style").split(":");
            var hasColouredBackground = styleComponents.length == 2 && !styleComponents[1].startsWith("#FFF");
            if(hasColouredBackground) return true;
        }
        return false;
    }

    // Inspects <th> image alt texts to determine how rate columns are arranged.
    private static ColumnFormat detectColumnFormat(Element table) {
        Set<String> timeAlts = new HashSet<>();
        Set<String> weatherAlts = new HashSet<>();
        for (Element img : table.select("th img")) {
            String alt = img.attr("alt");
            if (TIME_CONDITION_ALTS.contains(alt))    timeAlts.add(alt);
            if (WEATHER_CONDITION_ALTS.contains(alt)) weatherAlts.add(alt);
        }
        if (!weatherAlts.isEmpty())            return ColumnFormat.WEATHER;
        if (timeAlts.contains("Evening"))      return ColumnFormat.MORNING_DAY_EVENING_NIGHT;
        if (timeAlts.contains("Morning"))      return ColumnFormat.MORNING_DAY_NIGHT;
        if (timeAlts.contains("Night"))        return ColumnFormat.DAY_NIGHT;
        return ColumnFormat.SINGLE;
    }

    // Finds all data rows in a table that contain a link for the given Pokémon.
    private static List<Element> findPokemonRows(Element table, String pokemonName, String gameAbbreviation, String location) {
        List<Element> rows = new ArrayList<>();
        String targetTitle = pokemonName + " (Pokémon)";
        for (Element row : table.select("tr")) {
            boolean found = row.select("a").stream()
                    .anyMatch(a -> targetTitle.equals(a.attr("title")));

            // also do check that it contains a th with the game abbreviation and background
            if (found && elementHasGameRowSelected(row, gameAbbreviation)) {
                log.info("Found match for pokemon {} for game {} and location: {}: {}", pokemonName, gameAbbreviation, location, row.html());
                rows.add(row);
            }
        }
        return rows;
    }

    // Extracts encounter data from a single table row, returning one entry per non-zero rate slot.
    private static List<LocationEncounterData> extractFromRow(Element row, ColumnFormat format, String sectionMethod) {
        // Method: prefer the icon alt text in the row; fall back to the section header
        String method = sectionMethod;
        for (Element img : row.select("img")) {
            String alt = img.attr("alt");
            if (METHOD_ALT_TO_NAME.containsKey(alt)) {
                method = METHOD_ALT_TO_NAME.get(alt);
                break;
            }
        }

        return extractEncountersFromRow(row, format, method);
    }

    private static List<LocationEncounterData> extractEncountersFromRow(Element row, ColumnFormat format, String method) {
        if (format == ColumnFormat.SINGLE) return getEncountersForSingleCatchRateRow(row, method);

        List<LocationEncounterData> multicolumnFormatRows = getEncountersForMultiColumnCatchRate(row, method);
        if(!multicolumnFormatRows.isEmpty()) return multicolumnFormatRows;
        return getEncountersForSingleCatchRateRow(row, method);
    }

    private static List<LocationEncounterData> getEncountersForMultiColumnCatchRate(Element row, String method) {
        // For time-of-day and weather: each colored <td> maps to a condition
        return row.select("td").stream()
                .map(td -> {
                    String condition = extractConditionFromStyle(td.attr("style"));
                    if (condition == null) return null;
                    int rate = extractRateFromCell(td);
                    if (rate <= 0 || method == null) return null;
                    return new LocationEncounterData(method, rate, List.of(condition));
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    private static List<LocationEncounterData> getEncountersForSingleCatchRateRow(Element row, String method) {
        int rate = extractSingleRate(row);
        if (rate > 0 && method != null) {
            return List.of(new LocationEncounterData(method, rate, Collections.emptyList()));
        }
        return Collections.emptyList();
    }

    // Returns the first positive percentage found in any <td> of the row.
    private static int extractSingleRate(Element row) {
        for (Element td : row.select("td")) {
            int rate = extractRateFromCell(td);
            if (rate > 0) return rate;
        }
        return 0;
    }

    // Parses "40%" → 40, "0%" / "—" / "Varies" → 0.
    private static int extractRateFromCell(Element td) {
        String text = td.text().trim();
        if (text.endsWith("%")) {
            try {
                return Integer.parseInt(text.substring(0, text.length() - 1).trim());
            } catch (NumberFormatException ignored) {}
        }
        return 0;
    }

    // Looks up the background-color value in a style attribute against CONDITION_CELL_COLORS.
    private static String extractConditionFromStyle(String style) {
        if (style == null || style.isBlank()) return null;
        Matcher m = BG_COLOR_PATTERN.matcher(style);
        if (!m.find()) return null;
        String color = normalizeHexColor(m.group(1));
        return CONDITION_CELL_COLORS.get(color);
    }

    // Expands 3-digit hex shorthand (#abc → #aabbcc) and lower-cases for map lookup.
    private static String normalizeHexColor(String hex) {
        hex = hex.toLowerCase();
        if (hex.length() == 4) { // #abc
            char r = hex.charAt(1), g = hex.charAt(2), b = hex.charAt(3);
            return "#" + r + r + g + g + b + b;
        }
        return hex;
    }

    private static Encounter copyEncounterBaseFields(Encounter source) {
        Encounter copy = new Encounter();
        copy.setId(UUID.randomUUID());
        copy.setPokedexNumber(source.getPokedexNumber());
        copy.setPokemonName(source.getPokemonName());
        copy.setGame(source.getGame());
        copy.setEncounterHtml(source.getEncounterHtml());
        copy.setEncounterText(source.getEncounterText());
        copy.setCleanedUpEncounterText(source.getCleanedUpEncounterText());
        copy.setLocation(source.getLocation());
        return copy;
    }

    private static List<String> mergeConditions(List<String> existing, List<String> incoming) {
        if (existing == null || existing.isEmpty()) return incoming != null ? incoming : Collections.emptyList();
        if (incoming == null || incoming.isEmpty()) return existing;
        List<String> merged = new ArrayList<>(existing);
        merged.addAll(incoming);
        return merged;
    }

    // ── Internal Phase 1 helpers ──────────────────────────────────────────────

    private List<PokemonEntry> getPokemonList() throws Exception {
        String url = BASE_URL + "?action=parse&format=json&prop=text&page=" + ALL_POKEMON_PAGE;
        String json = restTemplate.getForObject(url, String.class);
        JsonNode root = objectMapper.readTree(json);
        String html = root.path("parse").path("text").path("*").asText();

        Document doc = Jsoup.parse(html);
        List<PokemonEntry> entries = new ArrayList<>();
        Set<String> seenPageTitles = new HashSet<>();

        for (Element row : doc.select("tr")) {
            Element dexCell = row.selectFirst("td[style*='monospace']");
            if (dexCell == null) continue;

            String dexText = dexCell.text().trim();
            if (!dexText.startsWith("#") || dexText.contains("?")) continue;
            int dexNumber = Integer.parseInt(dexText.substring(1));

            Element nameLink = row.select("a[href]").stream()
                    .filter(a -> a.attr("title").endsWith("(Pokémon)"))
                    .findFirst().orElse(null);
            if (nameLink == null) continue;

            String pageTitle = nameLink.attr("title");
            String pokemonName = nameLink.text().trim();

            if (seenPageTitles.contains(pageTitle)) continue;
            seenPageTitles.add(pageTitle);

            entries.add(new PokemonEntry(dexNumber, pokemonName, pageTitle));
        }

        return entries;
    }

    private List<Encounter> getEncountersForPokemon(PokemonEntry entry) throws Exception {
        Optional<String> sectionIndex = getGameLocationsSectionIndex(entry.pageTitle());
        if (sectionIndex.isEmpty()) {
            log.warn("No 'Game locations' section found for {}", entry.name());
            return Collections.emptyList();
        }

        String json = restTemplate.getForObject(
                UriComponentsBuilder.fromHttpUrl(BASE_URL)
                        .queryParam("action", "parse")
                        .queryParam("format", "json")
                        .queryParam("prop", "text")
                        .queryParam("section", sectionIndex.get())
                        .queryParam("page", entry.pageTitle())
                        .build().encode().toUri(),
                String.class);

        JsonNode root = objectMapper.readTree(json);
        String html = root.path("parse").path("text").path("*").asText();

        return parseGameLocationsHtml(html, entry);
    }

    private Optional<String> getGameLocationsSectionIndex(String pageTitle) throws Exception {
        String json = restTemplate.getForObject(
                UriComponentsBuilder.fromHttpUrl(BASE_URL)
                        .queryParam("action", "parse")
                        .queryParam("format", "json")
                        .queryParam("prop", "sections")
                        .queryParam("page", pageTitle)
                        .build().encode().toUri(),
                String.class);

        JsonNode root = objectMapper.readTree(json);
        for (JsonNode section : root.path("parse").path("sections")) {
            if ("Game locations".equals(section.path("line").asText())) {
                return Optional.of(section.path("index").asText());
            }
        }
        return Optional.empty();
    }

    private List<Encounter> parseGameLocationsHtml(String html, PokemonEntry entry) {
        List<Encounter> encounters = new ArrayList<>();
        Document doc = Jsoup.parse(html);

        for (Element row : doc.select("tr")) {
            Elements ths = row.select("> th");
            if (ths.isEmpty()) continue;

            List<String> gameNames = new ArrayList<>();
            boolean skip = false;
            for (Element th : ths) {
                String text = th.text().trim();
                if (text.toLowerCase().contains("generation") ||
                        text.toLowerCase().contains("unavailable")) {
                    skip = true;
                    break;
                }
                if (!text.isEmpty()) gameNames.add(text);
            }
            if (skip || gameNames.isEmpty()) continue;

            Element locationTd = row.selectFirst("> td");
            if (locationTd == null) continue;

            Element contentCell = locationTd.selectFirst("td.roundy");
            if (contentCell == null) contentCell = locationTd;

            String cellText = contentCell.text().trim();
            if (cellText.isEmpty() || cellText.equals("—") ||
                    cellText.toLowerCase().contains("unavailable")) continue;

            List<String> matchedGames = findMatchingGames(gameNames);
            if (matchedGames.isEmpty()) continue;

            List<List<String[]>> brGroups = splitByBrThenComma(contentCell);

            for (String game : matchedGames) {
                for (List<String[]> group : brGroups) {
                    String groupDayConditions = extractGroupDayConditions(group);
                    List<String[]> strippedGroupOfDayConditions = stripGroupDayConditions(group, groupDayConditions);
                    String groupMethod = extractGroupMethod(strippedGroupOfDayConditions);
                    List<String[]> strippedGroup = stripGroupMethod(strippedGroupOfDayConditions, groupMethod);
                    String[] cleanedTexts = calculateCleanEncounterTexts(strippedGroup);

                    for (int i = 0; i < strippedGroup.size(); i++) {
                        String encounterHtml = strippedGroup.get(i)[0].trim();
                        String encounterText = strippedGroup.get(i)[1].trim();
                        if (encounterText.isBlank()) continue;
                        if (IGNORED_ENCOUNTERS.contains(encounterText) ||
                                IGNORED_ENCOUNTERS_STARTS_WITH.stream().anyMatch(encounterText::startsWith)) continue;

                        ParsedDetails details = parseEncounterDetails(cleanedTexts[i]);
                        String finalMethod = details.method() != null ? details.method() : groupMethod;

                        Encounter encounter = new Encounter();
                        encounter.setId(UUID.randomUUID());
                        encounter.setPokedexNumber(entry.dexNumber());
                        encounter.setPokemonName(entry.name());
                        encounter.setGame(game);
                        encounter.setEncounterHtml(encounterHtml);
                        encounter.setEncounterText(encounterText);
                        encounter.setCleanedUpEncounterText(cleanedTexts[i]);
                        // Use pattern-matched location if available, else fall back to the cleaned text
                        encounter.setLocation(details.location() != null ? details.location() : cleanedTexts[i]);
                        encounter.setConditions(Stream.concat(Optional.ofNullable(details.conditions()).stream().flatMap(c -> c.stream()), Stream.of(groupDayConditions)).toList());
                        encounter.setMethod(finalMethod);
                        encounter.setCatchRate(details.catchRate());
                        encounters.add(encounter);
                    }
                }
            }
        }

        return encounters;
    }

    private List<String[]> stripGroupDayConditions(List<String[]> group, String groupDayConditions) {
        if (groupDayConditions == null) return group;
        List<String[]> result = new ArrayList<>(group);
        String[] last = result.get(result.size() - 1);
        result.set(result.size() - 1, new String[]{last[0], last[1].replaceFirst("(Mo|Tu|We|Th|Fr|Sa|Su)+$", "")});
        return result;
    }

    private String extractGroupDayConditions(List<String[]> group) {
        if (group.isEmpty()) return null;
        var lastEntry = group.get(group.size() - 1);
        var lastHtml = lastEntry[0];
        if(!lastHtml.contains("/wiki/Days_of_the_week")) return null;

        Matcher m = DAYS.matcher(lastEntry[1]);
        List<String> days = new ArrayList<>();
        while (m.find()) {
            days.add(m.group());
        }
        return days.stream().map(d -> DAY_ABBREVIATIONS.getOrDefault(d, d)).collect(Collectors.joining(" or "));
    }

    private static String[] calculateCleanEncounterTexts(List<String[]> parts) {
        String[] cleanedTexts = new String[parts.size()];
        String previousLocationType = null;
        for (int i = 0; i < parts.size(); i++) {
            cleanedTexts[i] = computeCleanedEncounterText(parts.get(i)[1].trim(), previousLocationType);
            String newType = extractLocationType(cleanedTexts[i]);
            if (newType != null) previousLocationType = newType;
        }
        return cleanedTexts;
    }

    private List<String> findMatchingGames(List<String> gameNames) {
        return gameNames.stream()
                .filter(GAMES::contains)
                .collect(Collectors.toList());
    }

    private List<List<String[]>> splitByBrThenComma(Element element) {
        return splitNodesByBr(element).stream()
                .map(this::commaOrAndSplitNodes)
                .filter(group -> !group.isEmpty())
                .collect(Collectors.toList());
    }

    private List<List<Node>> splitNodesByBr(Element element) {
        List<List<Node>> groups = new ArrayList<>();
        List<Node> current = new ArrayList<>();
        for (Node node : element.childNodes()) {
            if (node instanceof Element el && "br".equals(el.tagName())) {
                groups.add(current);
                current = new ArrayList<>();
            } else {
                current.add(node);
            }
        }
        groups.add(current);
        return groups;
    }

    private List<String[]> commaOrAndSplitNodes(List<Node> nodes) {
        List<String[]> parts = new ArrayList<>();
        StringBuilder currentHtml = new StringBuilder();
        StringBuilder currentText = new StringBuilder();

        for (Node node : nodes) {
            if (node instanceof Element el) {
                currentHtml.append(el.outerHtml());
                currentText.append(el.text());
            } else if (node instanceof TextNode tn) {
                String[] htmlParts = tn.outerHtml().split(",| and ", -1);
                String[] textParts = tn.text().split(",| and ", -1);
                for (int i = 0; i < htmlParts.length; i++) {
                    if (i > 0) {
                        flushSegment(parts, currentHtml, currentText);
                        currentHtml = new StringBuilder();
                        currentText = new StringBuilder();
                    }
                    currentHtml.append(htmlParts[i]);
                    currentText.append(i < textParts.length ? textParts[i] : "");
                }
            }
        }
        flushSegment(parts, currentHtml, currentText);
        return parts;
    }

    private void flushSegment(List<String[]> parts, StringBuilder html, StringBuilder text) {
        String t = text.toString().trim();
        if (!t.isBlank()) {
            parts.add(new String[]{html.toString().trim(), t});
        }
    }

    private static String extractGroupMethod(List<String[]> group) {
        if (group.isEmpty()) return null;
        String lastText = group.get(group.size() - 1)[1];
        Matcher m = PAREN_METHOD_SUFFIX.matcher(lastText.trim());
        if (m.matches() && GROUP_LEVEL_METHODS.contains(m.group(2))) {
            return m.group(2);
        }
        return null;
    }

    private static List<String[]> stripGroupMethod(List<String[]> group, String method) {
        if (method == null) return group;
        List<String[]> result = new ArrayList<>(group);
        String[] last = result.get(result.size() - 1);
        Matcher m = PAREN_METHOD_SUFFIX.matcher(last[1].trim());
        if (m.matches()) {
            String strippedText = m.group(1).trim();
            String strippedHtml = last[0].replace("(" + method + ")", "").trim();
            result.set(result.size() - 1, new String[]{strippedHtml, strippedText});
        }
        return result;
    }

    // Extracts structured encounter details from cleaned encounter text.
    // Returns unknown() for bare location text — Phase 2 enriches those from location pages.
    private static ParsedDetails parseEncounterDetails(String cleanedText) {
        String text = cleanedText.trim();

        // 1. Island Scan: "Route 2 (Island Scan)Fr"
        Matcher islandScan = ISLAND_SCAN.matcher(text);
        if (islandScan.matches()) {
            String day = DAY_ABBREVIATIONS.getOrDefault(islandScan.group(2), islandScan.group(2));
            return new ParsedDetails("Island Scan", islandScan.group(1).trim(), List.of(day), 100);
        }

        // 2. Trade: "Trade Abra on Route 2"
        Matcher trade = TRADE_PATTERN.matcher(text);
        if (trade.matches()) {
            return new ParsedDetails("Trade", trade.group(2).trim(),
                    List.of("Trade " + trade.group(1).trim()), 0);
        }

        // 3. Gift with "if" condition: "Received from ... in Location if condition"
        Matcher giftIf = GIFT_RECEIVED_IF.matcher(text);
        if (giftIf.matches()) {
            return new ParsedDetails("Received as gift", giftIf.group(1).trim(),
                    List.of(giftIf.group(2).trim()), 100);
        }

        // 4. Gift with optional "after" condition: "Received from ... in Location [after condition]"
        Matcher giftAfter = GIFT_RECEIVED_FROM.matcher(text);
        if (giftAfter.matches()) {
            List<String> conditions = giftAfter.group(2) != null
                    ? List.of(giftAfter.group(2).trim())
                    : Collections.emptyList();
            return new ParsedDetails("Received as gift", giftAfter.group(1).trim(), conditions, 100);
        }

        // 5. First partner gift: "First partner Pokémon from ... in Location"
        Matcher firstPartner = GIFT_FIRST_PARTNER.matcher(text);
        if (firstPartner.matches()) {
            return new ParsedDetails("Received as gift", firstPartner.group(1).trim(),
                    Collections.emptyList(), 100);
        }

        // 6. Per-encounter parenthetical condition: "Cerulean City (Only one)"
        //    Strip the parenthetical so Phase 2 can navigate to the correct page.
        Matcher parenCond = PAREN_METHOD_SUFFIX.matcher(text);
        if (parenCond.matches()) {
            String location = parenCond.group(1).trim();
            List<String> conditions = Arrays.stream(parenCond.group(2).split(";"))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .collect(Collectors.toList());
            return new ParsedDetails(null, location, conditions, 0);
        }

        return ParsedDetails.unknown();
    }

    private static String computeCleanedEncounterText(String rawText, String previousLocationType) {
        String cleaned = rawText.trim();

        if (cleaned.toLowerCase().startsWith("and ")) {
            cleaned = cleaned.substring(4).trim();
        }

        cleaned = cleaned.replaceAll("\\bRoutes\\b", "Route");
        cleaned = cleaned.replaceAll("\\bCaves\\b", "Cave");
        cleaned = cleaned.replaceAll("\\bTowns\\b", "Town");
        cleaned = cleaned.replaceAll("\\bCities\\b", "City");

        if (cleaned.matches("\\d+") && previousLocationType != null) {
            cleaned = previousLocationType + " " + cleaned;
        }

        return cleaned;
    }

    private static String extractLocationType(String cleanedText) {
        Matcher matcher = Pattern.compile("^(.+?)\\s+\\d+$").matcher(cleanedText.trim());
        return matcher.find() ? matcher.group(1) : null;
    }

    // ── Records and enums ─────────────────────────────────────────────────────

    private record PokemonEntry(int dexNumber, String name, String pageTitle) {}

    private record ParsedDetails(String method, String location, List<String> conditions, int catchRate) {
        static ParsedDetails unknown() {
            return new ParsedDetails(null, null, null, 0);
        }
    }

    private record LocationEncounterData(String method, int catchRate, List<String> conditions) {}


    private enum ColumnFormat { SINGLE, DAY_NIGHT, MORNING_DAY_NIGHT, MORNING_DAY_EVENING_NIGHT, WEATHER }
}
