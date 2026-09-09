package com.neueda.learning;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@RestController
@RequestMapping("/v1/transactions")
public class TransactionController {

    @Autowired
    private TransactionService service;

    @Autowired
    private RestTemplate restTemplate;

    // 01. Create Transaction
    @PostMapping("/")
    public ResponseEntity<Transaction> createTransaction(
            @RequestBody Transaction transaction) {

        Transaction created=service.createTransaction(transaction);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(created);
    }

    // 02. Get All Transactions
    @GetMapping("/")
    public ResponseEntity<List<Transaction>> getAllTransactions() {

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(service.getAllTransactions());
    }


    // 03. Get Transaction By ID
    @GetMapping("/{id}")
    public ResponseEntity<Transaction> getTransactionById(
            @PathVariable int id) {
        Transaction  transaction =
                service.getTransactionById(id);
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(transaction);
    }

    // 04. Deposit
    @PostMapping("/deposit")
    public ResponseEntity<String> deposit(
            @RequestParam int accountId,
            @RequestParam double amount) {

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(service.deposit(accountId, amount));
    }


    // 05. Withdraw
    @PostMapping("/withdraw")
    public ResponseEntity<String> withdraw(
            @RequestParam int accountId,
            @RequestParam double amount) {

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(service.withdraw(accountId, amount));
    }

}