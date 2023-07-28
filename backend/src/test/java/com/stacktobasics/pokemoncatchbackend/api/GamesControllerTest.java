package com.stacktobasics.pokemoncatchbackend.api;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
//import org.springframework.boot.web.server.LocalServerPort;
import org.springframework.data.mongodb.core.MongoTemplate;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class GamesControllerTest {
//    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private GamesController gamesController;

    @Autowired
    private MongoTemplate mongoTemplate;

    @Test
    public void getGames_withGamesInDb_returnsGames() {
        // arrange
//        mongoTemplate.insert(new Game());
//
//        // act
//        ResponseEntity<List<Game>> actual = restTemplate.exchange("http://localhost:" + port + "/games",
//                HttpMethod.GET, null, new ParameterizedTypeReference<List<Game>>() {
//                });

        // assemble
    }
}
