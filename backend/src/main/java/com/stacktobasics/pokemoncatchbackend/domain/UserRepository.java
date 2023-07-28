package com.stacktobasics.pokemoncatchbackend.domain;

import org.springframework.data.repository.CrudRepository;

import java.util.List;

public interface UserRepository extends CrudRepository<User, String> {

    @Override
    List<User> findAll();
}
