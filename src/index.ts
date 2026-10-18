const C = {
	reset: "\x1b[0m",
	gray: "\x1b[90m",
	cyan: "\x1b[36m",
	green: "\x1b[32m",
	yellow: "\x1b[33m",
	red: "\x1b[31m",
	blue: "\x1b[34m",
	magenta: "\x1b[35m",
};

const terminalWidth = 150;

type LogType = "error" | "warn" | "info" | "debug" | "trace" | "sub";

interface LogEntry {
	type: LogType;
	key: string;
	value: Object;
	time: Date;
}

type LogContext = {
	id: string;
	time: Date;

	logEntries: Array<LogEntry>;
	children: Array<Logger>;

	nestLevel: number;
};

function colorForKey(key: LogType) {
	if (key == "error") return C.red;
	if (key == "warn") return C.yellow;
	if (key == "info") return C.green;
	if (key == "debug") return C.magenta;
	if (key == "trace") return C.gray;
	if (key == "sub") return C.cyan;
	return C.reset;
}

export class Logger {
	private readonly ctx: LogContext;

	constructor() {
		this.ctx = {
			id: globalThis.crypto.randomUUID(),
			time: new Date(),

			logEntries: [],
			children: [],
			nestLevel: 0,
		};
	}

	private push(type: LogType, key: string, value: Object) {
		this.ctx.logEntries.push({ type, key, value, time: new Date() });
	}

	public error(key: string, value: Object) {
		this.push("error", key, value);
	}
	public warn(key: string, value: Object) {
		this.push("warn", key, value);
	}
	public info(key: string, value: Object) {
		this.push("info", key, value);
	}
	public debug(key: string, value: Object) {
		this.push("debug", key, value);
	}
	public trace(key: string, value: Object) {
		this.push("trace", key, value);
	}
	private sub(key: string, value: string) {
		this.push("sub", key, value);
	}

	public nest(title?: string) {
		const child = new Logger();
		child.ctx.nestLevel += 1;

		this.ctx.children.push(child);
		this.sub(
			"Sub Logger",
			`[${title ? title : child.ctx.id}] [NEST=${child.ctx.nestLevel}] @ [${child.ctx.time.toDateString()}]`,
		);
		return child;
	}

	public get id(): string {
		return this.ctx.id;
	}

	public print() {
		let childIndex = 0;
		const padding = this.ctx.nestLevel * 4;
		const actualWidth = terminalWidth - padding;
		let lastTime = this.ctx.time.getTime();
		const line = `${C.blue}┌─${this.ctx.id} [${this.ctx.time.toDateString()}] [NEST=${this.ctx.nestLevel}]`;
		console.log(
			`${" ".repeat(padding)}${line}${"─".repeat(actualWidth - line.length - 2)}─┐${C.reset}`,
		);

		for (const logEntry of this.ctx.logEntries) {
			const delta = logEntry.time.getTime() - lastTime;
			const color = colorForKey(logEntry.type);
			const line = `${color}⏱ ${delta}ms ${logEntry.key}${C.reset}`;
			console.log(`${" ".repeat(padding)}${line}${C.reset}`);

			if (typeof logEntry.value == "object") {
				console.log(logEntry.value);
			}
			lastTime = logEntry.time.getTime();

			if (logEntry.type === "sub") {
				this.ctx.children[childIndex].print();
				childIndex += 1;
			}
		}

		console.log(
			`${C.blue}${" ".repeat(padding)}└─${"─".repeat(actualWidth - 9)}─┘${C.reset}`,
		);
	}
}

const log = new Logger();
log.info("route", "POST - /auth/signup");
log.debug("body", {
	name: "Gay Cat",
	email: "email@cat.gay",
	password: "hidden",
});
const serviceLogger = log.nest("Service Call");
serviceLogger.info("layer", "Service - Create User");
serviceLogger.debug(
	"user duplication db check",
	"Checks if the user with same email already exists",
);
const duplicationLogger = serviceLogger.nest();
duplicationLogger.debug(
	"query",
	"SELECT FROM USERS WHERE EMAIL==email@cat.gay",
);
duplicationLogger.trace("response", []);
serviceLogger.debug(
	"Password strength check",
	"Password strength check using zxcvbn",
);
serviceLogger.trace("password strength", 0.8);
log.trace("service call return", "yep, new user, strong password");
log.info("response", 200);
log.print();
