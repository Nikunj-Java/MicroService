package com.neueda.learning;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Integer> {
    // SELECT * FROM transactions WHERE account_id = ?
    List<Transaction> findByAccountId(int accountId);
}
