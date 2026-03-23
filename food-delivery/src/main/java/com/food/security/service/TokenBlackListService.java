package com.food.security.service;

import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class TokenBlackListService {
    private final Map<String, Long> blacklist = new ConcurrentHashMap<>();

    public void blackListToken(String token, long expiry) {
        blacklist.put(token, expiry);
    }
    public boolean isTokenBlacklisted(String token) {
        Long expiry = blacklist.get(token);
        if (expiry == null) return false;
        if (expiry < System.currentTimeMillis()) {
            blacklist.remove(token);
            return false;
        }
        return true;
    }


}
