package com.stacktobasics.pokemoncatchbackend.api;

import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;

@RestController
@RequestMapping("images")
public class ImagesController {

    @RequestMapping(value = "{imagePath}", produces = MediaType.IMAGE_PNG_VALUE)
    public ResponseEntity<InputStreamResource> getImages(@PathVariable String imagePath) throws IOException {
        var imgFile = new ClassPathResource("images/" + imagePath);
        if(!imgFile.exists()) return ResponseEntity.notFound().build();

        return ResponseEntity
                .ok()
                .contentType(MediaType.IMAGE_JPEG)
                .body(new InputStreamResource(imgFile.getInputStream()));
    }
}
