package com.neueda.learning;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "transactions")
public class Transaction {

    @Id
    //@GeneratedValue(strategy = GenerationType.IDENTITY)

    private int id;

    @Column(name = "account_id", nullable = false)
    private int accountId;

    @Column(nullable = false)
    private String type;

    @Column(nullable = false)
    private double amount;

    //private Account account;




    public Transaction() {
    }

    public Transaction(int id, int accountId, String type, double amount) {
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