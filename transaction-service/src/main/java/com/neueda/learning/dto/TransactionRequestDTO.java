package com.neueda.learning.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class TransactionRequestDTO {

    @NotNull(message = "Account ID is required")
    @Positive(message = "Account ID must be greater than 0")
    private Integer accountId;

    @NotBlank(message = "Transaction type is required")
    private String type;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01",
            message = "Amount must be greater than 0")
    private Double amount;

    public TransactionRequestDTO() {
    }

    public Integer getAccountId() {
        return accountId;
    }

    public void setAccountId(Integer accountId) {
        this.accountId = accountId;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }
}