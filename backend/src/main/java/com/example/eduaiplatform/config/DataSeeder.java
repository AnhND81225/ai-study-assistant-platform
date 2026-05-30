package com.example.eduaiplatform.config;

import com.example.eduaiplatform.entity.Role;
import com.example.eduaiplatform.entity.RoleName;
import com.example.eduaiplatform.entity.Subject;
import com.example.eduaiplatform.entity.User;
import com.example.eduaiplatform.repository.RoleRepository;
import com.example.eduaiplatform.repository.SubjectRepository;
import com.example.eduaiplatform.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;

@Configuration
public class DataSeeder {
    @Bean
    CommandLineRunner seedData(RoleRepository roleRepository, SubjectRepository subjectRepository, UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            Role userRole = roleRepository.findByName(RoleName.ROLE_USER)
                    .orElseGet(() -> roleRepository.save(new Role(RoleName.ROLE_USER)));
            Role adminRole = roleRepository.findByName(RoleName.ROLE_ADMIN)
                    .orElseGet(() -> roleRepository.save(new Role(RoleName.ROLE_ADMIN)));

            List.of("Math", "Physics", "Chemistry", "English", "Programming", "Other")
                    .forEach(name -> {
                        if (!subjectRepository.existsByNameIgnoreCase(name)) {
                            subjectRepository.save(new Subject(name, "Default " + name + " subject"));
                        }
                    });

            if (!userRepository.existsByEmail("admin@example.com")) {
                userRepository.save(new User(
                        "Admin User",
                        "admin@example.com",
                        passwordEncoder.encode("Admin123!"),
                        adminRole
                ));
            }
        };
    }
}
