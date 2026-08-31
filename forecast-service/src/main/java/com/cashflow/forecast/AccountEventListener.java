package com.cashflow.forecast;

import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class AccountEventListener {
    private final AccountProjection projection;

    public AccountEventListener(AccountProjection projection) {
        this.projection = projection;
    }

    @KafkaListener(topics = "${cashflow.events.topic}")
    public void receive(ConsumerRecord<String, String> record) throws Exception {
        projection.apply(record.key(), record.value());
    }
}
