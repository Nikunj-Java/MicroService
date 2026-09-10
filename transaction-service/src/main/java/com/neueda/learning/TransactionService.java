package com.neueda.learning;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Service
public class TransactionService {

    @Autowired
    private TransactionRepository repository;

    @Autowired
    private RestTemplate restTemplate;

    // 01. Create Transaction

    public Transaction createTransaction(Transaction transaction) {
        transaction.setId(null);

        return repository.save(transaction);
    }

    // 02. Get All Transactions

    public List<Transaction> getAllTransactions() {

        return repository.findAll();
    }

    // 03. Get Transaction By ID

    public Transaction getTransactionById(int id) {

        return repository.findById(id).orElse(null);
    }

    // 04. Deposit

    public String deposit(int accountId, double amount) {

        Transaction transaction = new Transaction();

        transaction.setAccountId(accountId);

        transaction.setType("DEPOSIT");

        transaction.setAmount(amount);

        repository.save(transaction);

        return "Amount deposited successfully";
    }

    // 05. Withdraw

    public String withdraw(int accountId, double amount) {

        Transaction transaction = new Transaction();

        transaction.setAccountId(accountId);

        transaction.setType("WITHDRAW");

        transaction.setAmount(amount);

        repository.save(transaction);

        return "Amount withdrawn successfully";
    }

    // Micro Service
    public Account getAccount(int accountId) {

        String url =
                "http://localhost:8081/v1/accounts/" + accountId;

        return restTemplate.getForObject(
                url,
                Account.class
        );
    }
}
