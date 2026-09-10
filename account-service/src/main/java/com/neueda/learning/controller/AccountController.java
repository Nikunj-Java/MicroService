package com.neueda.learning.controller;

import com.neueda.learning.entity.Account;
import com.neueda.learning.service.AccountService;
import com.neueda.learning.entity.Transaction;
import com.neueda.learning.entity.TransactionResponse;
import com.neueda.learning.dto.AccountRequestDTO;
import com.neueda.learning.dto.AccountResponseDTO;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import javax.security.auth.login.AccountNotFoundException;
import java.util.List;

@RestController
@RequestMapping("/v1/accounts")
public class AccountController {
    @Autowired
    private AccountService service; //DI of Service to Controller
    @Autowired
    private RestTemplate restTemplate;

    @PostMapping("/")
    @PreAuthorize("hasRole('MISSION_OPERATOR')")
    public ResponseEntity<AccountResponseDTO> createAccount(
            @Valid @RequestBody AccountRequestDTO requestDTO) {
        AccountResponseDTO created = service.createAccount(requestDTO);

        AccountResponseDTO response =
                new AccountResponseDTO(
                        created.getId(),
                        created.getName(),
                        created.getBalance()

                );


        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping("/")
    public ResponseEntity<List<Account>> getAllAccounts() {

        List<Account> response = service.getAllAccounts();

        return ResponseEntity.ok(response);
    }

    // 03. Update
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('MISSION_OPERATOR') or hasRole('MISSION_VIEW')")
    public ResponseEntity<String> updateAccount(
            @PathVariable int id,
            @Valid @RequestBody AccountRequestDTO account) throws AccountNotFoundException {

        return ResponseEntity.ok(service.updateAccountMethod(id, account)
        );
    }
    // 04. Delete
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('MISSION_ADMIN')")
    public ResponseEntity<String> deleteAccount(@PathVariable int id) throws AccountNotFoundException {
        return ResponseEntity.status(HttpStatus.OK).body(service.deleteAccount(id));
    }
    //05. Get User By Id
    @GetMapping("/{account_id}")
    @PreAuthorize("hasRole('MISSION_OPERATOR') or hasRole('MISSION_VIEW')")
    public ResponseEntity<TransactionResponse> getAccountById(@PathVariable int account_id) throws AccountNotFoundException {

        Account account=service.getAccountById(account_id);
        String url= "http://10.8.78.152:8082/v1/transactions/"+account_id;
        Transaction[] transactions =
                restTemplate.getForObject(
                        url,
                        Transaction[].class
                );

        TransactionResponse transactionResponse= new TransactionResponse(account,transactions);
        return ResponseEntity.status(HttpStatus.OK).body(transactionResponse);
    }

    @GetMapping("/health")
    public String Health(){
        return "Account Service is up and running!";
    }
}
