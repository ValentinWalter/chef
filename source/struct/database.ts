//
// Created on Wed Feb 03 2021
//
// Copyright (c) Valentin Walter 2021
//

// NOTICE
// This is code from the old version. I intended to
// reimplement this with SQLite but did not have the time.

export default class Database {
	static users = new Map<string, User>()

	/**
	 * Add an amount of currency to a user.
	 */
	static addToBalance(amount: number, userID: string): void {
		const user = Database.users.get(userID) ?? new User()
		user.balance += amount
		if (user.balance < 0) user.balance = 0
		Database.users.set(userID, user)
	}

	/**
	 * Get the balance of a user.
	 */
	static getBalance(userID: string): number {
		const user = Database.users.get(userID) ?? new User()
		return user.balance
	}
}

class User {
	balance: number
	constructor(balance = 100) {
		this.balance = balance
	}
}
