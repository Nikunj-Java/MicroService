package com.neueda.learning.dto;

public class TransactionResponseDTO {

    private int id;
    private int accountId;
    private String type;
    private double amount;

    public TransactionResponseDTO() {
    }

    public TransactionResponseDTO(
            int id,
            int accountId,
            String type,
            double amount) {

        this.id = id;
        this.accountId = accountId;
        this.type = type;
        this.amount = amount;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public int getAccountId() {
        return accountId;
    }

    public void setAccountId(int accountId) {
        this.accountId = accountId;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public double getAmount() {
        return amount;
    }

    public void setAmount(double amount) {
        this.amount = amount;
    }
}