"use strict";
//
// Created on Wed Jan 27 2021
//
// Copyright (c) Valentin Walter 2021
//
Object.defineProperty(exports, "__esModule", { value: true });
class Queue {
    constructor(connection, videos, loop = false) {
        this.connection = connection;
        this.videos = videos;
        this.loop = loop;
    }
}
exports.default = Queue;
//# sourceMappingURL=queue.js.map