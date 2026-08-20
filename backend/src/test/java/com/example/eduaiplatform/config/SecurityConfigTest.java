package com.example.eduaiplatform.config;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class SecurityConfigTest {

    @Test
    void parseCorsOrigins_trimsRemovesBlankValuesAndKeepsOrder() {
        List<String> origins = SecurityConfig.parseCorsOrigins(
                " http://localhost:5173, https://ducanh.space, , https://ducanh.space, https://api.ducanh.space "
        );

        assertEquals(List.of(
                "http://localhost:5173",
                "https://ducanh.space",
                "https://api.ducanh.space"
        ), origins);
    }
}
