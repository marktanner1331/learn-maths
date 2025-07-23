export type CommandSubscription = {
    unsubscribe(): void;
    pause(): void;
    resume(): void;
    isPaused(): boolean;
}

class _CommandSubscription<T> implements CommandSubscription {
    public buffer: T[] | null = null;
    public isRunning: boolean = false;
    public hasUnsubscribed: boolean  = false;

    constructor(
        private controller: _CommandController<T>,
        public index: number,
        public callback: (command: T) => void,
        public priority: number) {

    }

    unsubscribe() {
        if (this.hasUnsubscribed) {
            return;
        }

        this.hasUnsubscribed = true;
        this.controller.remove(this.index);
    }

    pause() {
        this.buffer = [];
    }

    resume() {
        // unpause the sub first
        // before running the buffered commands
        let buffer = this.buffer!;
        this.buffer = null;

        this.isRunning = true;
        for (let command of buffer) {
            this.controller.runFromIndex(this.index + 1, command);
        }
        this.isRunning = false;
        this.controller.afterResume();
    }

    isPaused() {
        return this.buffer !== null;
    }
}

export type IdleSubscription = {
    unsubscribe(): void;
}

class _IdleSubscription<T> implements IdleSubscription {
    constructor(public callback: () => void, public index:number, private controller: _CommandController<T>) {
    }

    unsubscribe() {
        this.controller.removeIdle(this.index);
    }
}

class _CommandController<T> {
    private subs: _CommandSubscription<T>[] = [];
    private idleSubs: _IdleSubscription<T>[] = [];

    addIdle(callback:() => void): IdleSubscription {
        this.idleSubs.push(new _IdleSubscription(callback, this.idleSubs.length, this));
        return this.idleSubs[this.idleSubs.length - 1];
    }

    removeAllSubs() {
        this.subs.forEach(x => x.hasUnsubscribed = true);

        this.subs = [];
        this.idleSubs = [];
    }

    remove(index: number) {
        this.subs.splice(index, 1);

        for (let i = 0; i < this.subs.length; i++) {
            this.subs[i].index = i;
        }
    }

    removeIdle(index: number) {
        this.idleSubs.splice(index, 1);
        for (let i = 0; i < this.idleSubs.length; i++) {
            this.idleSubs[i].index = i;
        }
    }

    runFromIndex(index: number, command: T) {
        // we push the command through the chain of callbacks
        // until we hit a paused one
        // then we buffer it at that point

        // we use tempSubs, so that someone can subscribe
        // while we are iterating, and it won't mess up the iteration
        let tempSubs = [...this.subs];
        for (let sub of tempSubs.slice(index)) {
            if (sub.hasUnsubscribed) {
                continue;
            }

            sub.callback(command);

            if (sub.buffer) {
                sub.buffer.push(command);
                break;
            }
        }
    }

    afterResume() {
        if(this.subs.every(x => x.isPaused() == false && x.isRunning == false)) {
            // if all subs are not paused and not running
            // then we can call the idle callbacks
            for (let idle of this.idleSubs) {
                idle.callback();
            }
        }
    }

    subscribe(callback: (command: T) => void, priority: number = 0): CommandSubscription {
        let sub = new _CommandSubscription(this, 0, callback, priority);
        this.subs.push(sub);
        this.subs.sort((a, b) => b.priority - a.priority);

        for (let i = 0; i < this.subs.length; i++) {
            this.subs[i].index = i;
        }

        return sub;
    }
}

export class CommandController<T> {
    private inner: _CommandController<T> = new _CommandController<T>();

    // we use a pending subscription
    // which is right at the start of the chain
    // so any new commands will be paused until the current commands
    // have finished processing
    // e.g. if root() is called while a command is being processed
    // then it should wait until the current command is finished
    private pending: CommandSubscription;
    private _isPaused: boolean = false;

    constructor() {
        this.pending = this.subscribe(() => { }, Number.MAX_SAFE_INTEGER);
    }

    removeAllSubs() {
        this.inner.removeAllSubs();
        this.pending = this.subscribe(() => { }, Number.MAX_SAFE_INTEGER);
    }

    addIdle(callback: () => void): IdleSubscription {
        return this.inner.addIdle(callback);
    }

    subscribe(callback: (command: T) => void, priority: number = 0): CommandSubscription {
        return this.inner.subscribe(callback, priority);
    }

    pause() {
        this._isPaused = true;
        this.pending.pause();
    }

    resume() {
        this._isPaused = false;
        this.pending.resume();
    }

    isPaused() {
        return this._isPaused;
    }

    root(command: T) {
        if (!this.pending.isPaused()) {
            this.pending.pause();

            setTimeout(() => {
                this.pending.resume();
            }, 0);
        }

        this.inner.runFromIndex(0, command);
    }
}

