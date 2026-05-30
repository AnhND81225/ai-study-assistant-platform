package com.example.eduaiplatform.repository;

import com.example.eduaiplatform.entity.Role;
import com.example.eduaiplatform.entity.RoleName;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(RoleName name);
}
