package com.neueda.learning;

import com.neueda.learning.dto.TransactionRequestDTO;
import com.neueda.learning.dto.TransactionResponseDTO;
import jakarta.validation.Valid;
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
    public ResponseEntity<TransactionResponseDTO> createTransaction(
            @Valid @RequestBody TransactionRequestDTO request) {

        Transaction created= new Transaction(
                request.getAccountId(),
                request.getType(),
                request.getAmount()
        );

        Transaction newTransaction=service.createTransaction(created);
        TransactionResponseDTO response= new TransactionResponseDTO(
                newTransaction.getId(),
                newTransaction.getAccountId(),
                newTransaction.getType(),
                newTransaction.getAmount()
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
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
    // 03. Get Transaction By Account ID
    @GetMapping("/account/{accountId}")
    public ResponseEntity<List<Transaction>> getTransactionByAccountId(
            @PathVariable int accountId) {
        List<Transaction>  transactions =
                service.getTransactionsByAccountId(accountId);
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(transactions);
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