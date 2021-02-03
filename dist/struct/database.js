"use strict";
//
// Created on Wed Feb 03 2021
//
// Copyright (c) Valentin Walter 2021
//
Object.defineProperty(exports, "__esModule", { value: true });
// NOTICE
// This is code from the old version. I intended to
// reimplement this with SQLite but did not have the time.
class Database {
    /**
     * Add an amount of currency to a user.
     */
    static addToBalance(amount, userID) {
        const user = Database.users.get(userID) ?? new User();
        user.balance += amount;
        if (user.balance < 0)
            user.balance = 0;
        Database.users.set(userID, user);
    }
    /**
     * Get the balance of a user.
     */
    static getBalance(userID) {
        const user = Database.users.get(userID) ?? new User();
        return user.balance;
    }
}
exports.default = Database;
Database.users = new Map();
class User {
    constructor(balance = 100) {
        this.balance = balance;
    }
}
//# sourceMappingURL=database.js.map