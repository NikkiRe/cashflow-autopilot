package com.cashflow.autopilot.bootstrap;

import com.cashflow.autopilot.service.DemoDataSeedService;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@Order(50)
public class DemoDataSeeder implements ApplicationRunner {

    private final DemoDataSeedService demoDataSeedService;

    public DemoDataSeeder(DemoDataSeedService demoDataSeedService) {
        this.demoDataSeedService = demoDataSeedService;
    }

    @Override
    public void run(ApplicationArguments args) {
        demoDataSeedService.seedIfConfiguredAndEmpty();
    }
}
