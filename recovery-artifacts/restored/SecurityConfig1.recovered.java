package com.smartdairy.security;

import com.smartdairy.security.handler.JwtAccessDeniedHandler;
import com.smartdairy.security.handler.JwtAuthenticationEntryPoint;
import com.smartdairy.security.jwt.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig1 {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

    private final JwtAccessDeniedHandler jwtAccessDeniedHandler;

    private final AppUserDetailsService appUserDetailsService;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                .csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults())
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint(jwtAuthenticationEntryPoint)
                        .accessDeniedHandler(jwtAccessDeniedHandler))
                .authenticationProvider(authenticationProvider())
                .authorizeHttpRequests(auth -> auth

                        /*
                         * Public APIs
                         */
                        .requestMatchers(
                                "/api/v1/health/**",
                                "/api/v1/auth/login",
                                "/v3/api-docs/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/swagger-resources/**",
                                "/webjars/**",
                                "/actuator/health",
                                "/actuator/info"
                        ).permitAll()

                        .requestMatchers(HttpMethod.OPTIONS, "/**")
                        .permitAll()

                        /*
                         * User Management
                         */
                        .requestMatchers("/api/v1/auth/users/**")
                        .hasAuthority("ROLE_ADMIN")

                        /*
                         * Company & Branch
                         */
                        .requestMatchers("/api/v1/companies/**")
                        .hasAnyAuthority("ROLE_ADMIN", "ROLE_MANAGER")

                        .requestMatchers("/api/v1/branches/**")
                        .hasAnyAuthority("ROLE_ADMIN", "ROLE_MANAGER")

                        /*
                         * Farmer Module
                         */
                        .requestMatchers("/api/v1/farmers/**")
                        .hasAnyAuthority("ROLE_ADMIN", "ROLE_MANAGER", "ROLE_COLLECTION_OPERATOR")

                        .requestMatchers("/api/v1/farmer-configurations/**")
                        .hasAnyAuthority("ROLE_ADMIN", "ROLE_MANAGER")

                        /*
                         * Milk Collection
                         */
                        .requestMatchers("/api/v1/milk-collections/**")
                        .hasAnyAuthority("ROLE_ADMIN", "ROLE_MANAGER", "ROLE_COLLECTION_OPERATOR")

                        /*
                         * Production
                         */
                        .requestMatchers("/api/v1/production-batches/**")
                        .hasAnyAuthority("ROLE_ADMIN", "ROLE_MANAGER", "ROLE_PRODUCTION_OPERATOR")

                        /*
                         * Inventory
                         */
                        .requestMatchers("/api/v1/inventory/**")
                        .hasAnyAuthority("ROLE_ADMIN", "ROLE_MANAGER", "ROLE_PRODUCTION_OPERATOR")

                        /*
                         * Products
                         */
                        .requestMatchers("/api/v1/products/**")
                        .hasAnyAuthority("ROLE_ADMIN", "ROLE_MANAGER")

                        /*
                         * Customer
                         */
                        .requestMatchers("/api/v1/customers/**")
                        .hasAnyAuthority("ROLE_ADMIN", "ROLE_MANAGER", "ROLE_SALES_OPERATOR")

                        /*
                         * Sales
                         */
                        .requestMatchers("/api/v1/sales/**")
                        .hasAnyAuthority("ROLE_ADMIN", "ROLE_MANAGER", "ROLE_SALES_OPERATOR")

                        /*
                         * Loans
                         */
                        .requestMatchers("/api/v1/loans/**")
                        .hasAnyAuthority("ROLE_ADMIN", "ROLE_MANAGER", "ROLE_ACCOUNTANT")

                        /*
                         * Settlement
                         */
                        .requestMatchers("/api/v1/settlements/**")
                        .hasAnyAuthority("ROLE_ADMIN", "ROLE_MANAGER", "ROLE_ACCOUNTANT")

                        /*
                         * Payment
                         */
                        .requestMatchers("/api/v1/payments/**")
                        .hasAnyAuthority("ROLE_ADMIN", "ROLE_MANAGER", "ROLE_ACCOUNTANT")

                        /*
                         * Reports
                         */
                        .requestMatchers("/api/v1/reports/**")
                        .hasAnyAuthority("ROLE_ADMIN", "ROLE_MANAGER", "ROLE_ACCOUNTANT", "ROLE_VIEWER")

                        /*
                         * Masters
                         */
                        .requestMatchers("/api/v1/master/**")
                        .hasAnyAuthority("ROLE_ADMIN", "ROLE_MANAGER")

                        /*
                         * Everything else
                         */
                        .anyRequest()
                        .authenticated()

                )

                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class)

                .httpBasic(httpBasic -> httpBasic.disable())

                .formLogin(form -> form.disable());

        return http.build();

    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {

        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();

        provider.setUserDetailsService(appUserDetailsService);

        provider.setPasswordEncoder(passwordEncoder());

        return provider;

    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration)  throws Exception {

        return configuration.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {

        return new BCryptPasswordEncoder(12);

    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOriginPatterns(List.of("*"));

        configuration.setAllowedMethods(
                List.of(
                        "GET",
                        "POST",
                        "PUT",
                        "PATCH",
                        "DELETE",
                        "OPTIONS"));

        configuration.setAllowedHeaders(List.of("*"));

        configuration.setAllowCredentials(false);

        configuration.setExposedHeaders(List.of("Authorization"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", configuration);

        return source;

    }

}
