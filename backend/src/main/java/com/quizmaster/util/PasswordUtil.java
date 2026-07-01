package com.quizmaster.util;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
public class PasswordUtil {
    public static void main(String[] args) {
        BCryptPasswordEncoder e = new BCryptPasswordEncoder();
        String hash = e.encode("Admin@123");
        System.out.println("HASH:" + hash);
        System.out.println("MATCH:" + e.matches("Admin@123", hash));
    }
}