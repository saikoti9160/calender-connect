package com.schedulr;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class SchedulrApplication {
    public static void main(String[] args) {
        SpringApplication.run(SchedulrApplication.class, args);
    }
}
