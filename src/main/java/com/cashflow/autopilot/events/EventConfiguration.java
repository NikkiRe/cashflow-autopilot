package com.cashflow.autopilot.events;

import org.apache.kafka.clients.admin.NewTopic;
import org.apache.kafka.common.config.TopicConfig;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;
import org.springframework.scheduling.annotation.EnableScheduling;

@Configuration
@EnableScheduling
public class EventConfiguration {
    @Bean
    @ConditionalOnProperty(name = "cashflow.events.publish-enabled", havingValue = "true", matchIfMissing = true)
    NewTopic accountSnapshots(@Value("${cashflow.events.topic}") String topic) {
        return TopicBuilder.name(topic).partitions(3).replicas(1)
                .config(TopicConfig.CLEANUP_POLICY_CONFIG, TopicConfig.CLEANUP_POLICY_COMPACT).build();
    }
}
