package com.cashflow.autopilot.controller;

import com.cashflow.autopilot.dto.AppInfoDTO;
import com.cashflow.autopilot.service.AppInfoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/app")
public class AppController {

    private final AppInfoService appInfoService;

    public AppController(AppInfoService appInfoService) {
        this.appInfoService = appInfoService;
    }

    @GetMapping("/info")
    public ResponseEntity<AppInfoDTO> info() {
        return ResponseEntity.ok(appInfoService.getAppInfo());
    }
}
