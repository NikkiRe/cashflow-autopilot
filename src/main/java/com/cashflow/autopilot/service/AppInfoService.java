package com.cashflow.autopilot.service;

import com.cashflow.autopilot.config.DemoPresentationState;
import com.cashflow.autopilot.config.DemoProperties;
import com.cashflow.autopilot.dto.AppInfoDTO;
import org.springframework.stereotype.Service;

@Service
public class AppInfoService {

    private final DemoProperties demoProperties;
    private final DemoPresentationState presentationState;

    public AppInfoService(DemoProperties demoProperties, DemoPresentationState presentationState) {
        this.demoProperties = demoProperties;
        this.presentationState = presentationState;
    }

    public AppInfoDTO getAppInfo() {
        boolean demoOn = demoProperties.isEnabled();
        return new AppInfoDTO(
                demoOn,
                demoOn && demoProperties.isPresentationMode(),
                demoOn,
                demoProperties.getDisclaimer(),
                demoProperties.getCurrencyLabel(),
                presentationState.isSampleDatasetSeededThisStartup()
        );
    }
}
