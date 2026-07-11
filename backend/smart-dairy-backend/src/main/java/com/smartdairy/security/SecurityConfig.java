package com.smartdairy.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain   securityFilterChain(HttpSecurity http) throws Exception {
        http

                .csrf(csrf->csrf.disable())
                .authorizeHttpRequests(auth->auth
                        .requestMatchers(
                                "/api/v1/health",
                                "/api/v1/companies/**",
                                "/api/v1/farmer-configurations/**",
                                "/api/v1/settlements/**",
                                "/api/v1/loans/**",
                                "/api/v1/payments/**",
                                "/api/v1/products/**",
                                "/api/v1/production-batches/**",
                                "/api/v1/milk-collections/**",
                                "/api/v1/farmers/**",
                                "/api/v1/branches/**",
                                "/api/v1/master/**",
                                "/v3/api-docs/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html"
                        ).permitAll()
                        .anyRequest().authenticated()
                )
                .httpBasic(Customizer.withDefaults())
                .formLogin(form-> form.disable());

        return http.build();
    }
}
