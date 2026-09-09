package com.neueda.learning;

import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;


public class TransactionRepo {

    private List<Transaction> transactions = new ArrayList<>();

    // 01. Create Transaction
    public Transaction save(Transaction transaction) {

        transactions.add(transaction);

        return transaction;
    }

    // 02. Get All Transactions
    public List<Transaction> findAll() {

        return transactions;
    }

    // 03. Get Transaction By ID
    public Transaction findById(int id) {

        for (Transaction transaction : transactions) {

            if (transaction.getId() == id) {
                return transaction;
            }
        }

        return null;
    }
}
