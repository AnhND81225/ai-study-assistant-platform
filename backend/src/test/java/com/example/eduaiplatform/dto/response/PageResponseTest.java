package com.example.eduaiplatform.dto.response;

import org.junit.jupiter.api.Test;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

class PageResponseTest {
    @Test
    void from_preservesStablePaginationFields() {
        PageResponse<String> response = PageResponse.from(new PageImpl<>(
                List.of("one", "two"),
                PageRequest.of(1, 2),
                5
        ));

        assertEquals(List.of("one", "two"), response.content());
        assertEquals(1, response.number());
        assertEquals(2, response.size());
        assertEquals(5, response.totalElements());
        assertEquals(3, response.totalPages());
        assertFalse(response.first());
        assertFalse(response.last());
    }
}
