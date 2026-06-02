package com.example.eduaiplatform.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "app.ai")
public class OpenAiProperties {
    private String openaiApiKey;
    private String openaiModel = "gpt-4o-mini";
    private long timeoutSeconds = 45;
    private int maxOutputTokens = 700;
    private long explainLimitPerUser = 10;

    public String getOpenaiApiKey() {
        return openaiApiKey;
    }

    public void setOpenaiApiKey(String openaiApiKey) {
        this.openaiApiKey = openaiApiKey;
    }

    public String getOpenaiModel() {
        return openaiModel;
    }

    public void setOpenaiModel(String openaiModel) {
        this.openaiModel = openaiModel;
    }

    public long getTimeoutSeconds() {
        return timeoutSeconds;
    }

    public void setTimeoutSeconds(long timeoutSeconds) {
        this.timeoutSeconds = timeoutSeconds;
    }

    public int getMaxOutputTokens() {
        return maxOutputTokens;
    }

    public void setMaxOutputTokens(int maxOutputTokens) {
        this.maxOutputTokens = maxOutputTokens;
    }

    public long getExplainLimitPerUser() {
        return explainLimitPerUser;
    }

    public void setExplainLimitPerUser(long explainLimitPerUser) {
        this.explainLimitPerUser = explainLimitPerUser;
    }
}
