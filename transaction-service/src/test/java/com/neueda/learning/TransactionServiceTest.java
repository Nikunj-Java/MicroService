package com.neueda.learning;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TransactionServiceTest {

    @Mock
    private TransactionRepository repository;

    @Mock
    private RestTemplate restTemplate;

    @InjectMocks
    private TransactionService service;

    @Test
    void createTransaction_ShouldSaveAndReturnTransaction() {
        Transaction input = new Transaction(1, 1001, "DEPOSIT", 500.0);
        when(repository.save(input)).thenReturn(input);

        Transaction result = service.createTransaction(input);

        assertSame(input, result);
        assertNull(input.getId());
        verify(repository).save(input);
    }

    @Test
    void getAllTransactions_ShouldReturnAllTransactions() {
        List<Transaction> expected = List.of(
                new Transaction(1, 1001, "DEPOSIT", 100.0),
                new Transaction(2, 1002, "WITHDRAW", 50.0)
        );
        when(repository.findAll()).thenReturn(expected);

        List<Transaction> result = service.getAllTransactions();

        assertEquals(expected, result);
        verify(repository).findAll();
    }

    @Test
    void getTransactionById_WhenPresent_ShouldReturnTransaction() {
        Transaction transaction = new Transaction(10, 2001, "DEPOSIT", 250.0);
        when(repository.findById(10)).thenReturn(Optional.of(transaction));

        Transaction result = service.getTransactionById(10);

        assertSame(transaction, result);
        verify(repository).findById(10);
    }

    @Test
    void getTransactionById_WhenMissing_ShouldReturnNull() {
        when(repository.findById(99)).thenReturn(Optional.empty());

        Transaction result = service.getTransactionById(99);

        assertNull(result);
        verify(repository).findById(99);
    }

    @Test
    void deposit_ShouldCreateDepositTransactionAndReturnMessage() {
        String result = service.deposit(3001, 700.0);

        assertEquals("Amount deposited successfully", result);

        ArgumentCaptor<Transaction> captor = ArgumentCaptor.forClass(Transaction.class);
        verify(repository).save(captor.capture());

        Transaction saved = captor.getValue();
        assertNull(saved.getId());
        assertEquals(3001, saved.getAccountId());
        assertEquals("DEPOSIT", saved.getType());
        assertEquals(700.0, saved.getAmount());
    }

    @Test
    void withdraw_ShouldCreateWithdrawTransactionAndReturnMessage() {
        String result = service.withdraw(4001, 300.0);

        assertEquals("Amount withdrawn successfully", result);

        ArgumentCaptor<Transaction> captor = ArgumentCaptor.forClass(Transaction.class);
        verify(repository).save(captor.capture());

        Transaction saved = captor.getValue();
        assertNull(saved.getId());
        assertEquals(4001, saved.getAccountId());
        assertEquals("WITHDRAW", saved.getType());
        assertEquals(300.0, saved.getAmount());
    }

    @Test
    void getAccount_ShouldCallAccountServiceAndReturnResponse() {
        Account expected = new Account();
        expected.setId(5001);
        expected.setName("Alice");
        expected.setBalance(1200.0);

        String expectedUrl = "http://localhost:8081/v1/accounts/5001";
        when(restTemplate.getForObject(expectedUrl, Account.class)).thenReturn(expected);

        Account result = service.getAccount(5001);

        assertSame(expected, result);
        verify(restTemplate).getForObject(eq(expectedUrl), eq(Account.class));
    }
}
