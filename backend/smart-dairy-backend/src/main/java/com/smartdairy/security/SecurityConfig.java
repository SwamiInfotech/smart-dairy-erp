package com.smartdairy.security;

import com.smartdairy.security.handler.JwtAccessDeniedHandler;
import com.smartdairy.security.handler.JwtAuthenticationEntryPoint;
import com.smartdairy.security.jwt.JwtAuthenticationFilter;
import com.smartdairy.tenant.context.TenantFilter;
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
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            TenantFilter tenantFilter,
            JwtAuthenticationFilter jwtAuthenticationFilter,
            JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint,
            JwtAccessDeniedHandler jwtAccessDeniedHandler,
            DaoAuthenticationProvider authenticationProvider
    ) throws Exception {

        http

                .csrf(csrf -> csrf.disable())

                .cors(Customizer.withDefaults())

                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint(jwtAuthenticationEntryPoint)
                        .accessDeniedHandler(jwtAccessDeniedHandler))

                .authenticationProvider(authenticationProvider)

                .authorizeHttpRequests(auth -> auth

                        /*
                         * Public APIs
                         */
                        .requestMatchers(
                                "/api/v1/auth/login",
                                "/api/v1/public/onboard",
                                "/v3/api-docs/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/swagger-resources/**",
                                "/webjars/**",
                                "/actuator/health",
                                "/api/v1/health",
                                "/actuator/info"
                        ).permitAll()

                        .requestMatchers(HttpMethod.OPTIONS, "/**")
                        .permitAll()

                        /*
                         * User Management
                         */
                        .requestMatchers("/api/v1/auth/users/**")
                        .hasRole("ADMIN")

                        /*
                         * Tenant
                         */
                        .requestMatchers("/api/v1/tenants/**")
                        .hasRole("ADMIN")

                        /*
                         * Company & Branch
                         */
                        .requestMatchers("/api/v1/companies/**")
                        .hasAnyRole("ADMIN","MANAGER")

                        .requestMatchers("/api/v1/branches/**")
                        .hasAnyRole("ADMIN","MANAGER")

                        /*
                         * Farmer Module
                         */
                        .requestMatchers("/api/v1/farmers/**")
                        .hasAnyRole("ADMIN","MANAGER","OPERATOR")

                        .requestMatchers("/api/v1/farmer-configurations/**")
                        .hasAnyRole("ADMIN","MANAGER")

                        /*
                         * Milk Collection
                         */
                        .requestMatchers("/api/v1/milk-collections/**")
                        .hasAnyRole("ADMIN","MANAGER","OPERATOR")

                        /*
                         * Production
                         */
                        .requestMatchers("/api/v1/production-batches/**")
                        .hasAnyRole("ADMIN","MANAGER","OPERATOR")

                        /*
                         * Inventory
                         */
                        .requestMatchers("/api/v1/inventory/**")
                        .hasAnyRole("ADMIN","MANAGER","OPERATOR")

                        /*
                         * Products
                         */
                        .requestMatchers("/api/v1/products/**")
                        .hasAnyRole("ADMIN","MANAGER")

                        /*
                         * Customer
                         */
                        .requestMatchers("/api/v1/customers/**")
                        .hasAnyRole("ADMIN","MANAGER","OPERATOR")

                        /*
                         * Sales
                         */
                        .requestMatchers("/api/v1/sales/**")
                        .hasAnyRole("ADMIN","MANAGER","OPERATOR")

                        /*
                         * Loans
                         */
                        .requestMatchers("/api/v1/loans/**")
                        .hasAnyRole("ADMIN","MANAGER")

                        /*
                         * Settlement
                         */
                        .requestMatchers("/api/v1/settlements/**")
                        .hasAnyRole("ADMIN","MANAGER")

                        /*
                         * Payment
                         */
                        .requestMatchers("/api/v1/payments/**")
                        .hasAnyRole("ADMIN","MANAGER")

                        /*
                         * Reports
                         */
                        .requestMatchers("/api/v1/reports/**")
                        .hasAnyRole("ADMIN","MANAGER","VIEWER")

                        /*
                         * Masters
                         */
                        .requestMatchers("/api/v1/master/**")
                        .hasAnyRole("ADMIN","MANAGER")

                        /*
                         * Everything else
                         */
                        .anyRequest()
                        .authenticated()

                )

                .addFilterBefore(tenantFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterAfter(jwtAuthenticationFilter, TenantFilter.class)

                .httpBasic(httpBasic -> httpBasic.disable())

                .formLogin(form -> form.disable());

        return http.build();

    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider(
            AppUserDetailsService appUserDetailsService,
            PasswordEncoder passwordEncoder
    ) {

        DaoAuthenticationProvider provider =
                new DaoAuthenticationProvider();

        provider.setUserDetailsService(appUserDetailsService);

        provider.setPasswordEncoder(passwordEncoder);

        return provider;

    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration)
            throws Exception {

        return configuration.getAuthenticationManager();

    }

    @Bean
    public PasswordEncoder passwordEncoder() {

        return new BCryptPasswordEncoder(12);

    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOriginPatterns(
                List.of("*"));

        configuration.setAllowedMethods(
                List.of(
                        "GET",
                        "POST",
                        "PUT",
                        "PATCH",
                        "DELETE",
                        "OPTIONS"));

        configuration.setAllowedHeaders(
                List.of("*"));

        configuration.setAllowCredentials(false);

        configuration.setExposedHeaders(
                List.of("Authorization"));

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
                "/**",
                configuration);

        return source;

    }

}