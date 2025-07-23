import { CommandController } from "../command-controller";

export const commandStream = new CommandController<Command>();

export function startLogging() {
    // commandStream.subscribe((c) => {
    //     console.log({
    //         title: "command start",
    //         ...c
    //     });
    // }, Number.MAX_SAFE_INTEGER);
    // commandStream.subscribe((c) => {
    //     console.log({
    //         title: "command end",
    //         ...c
    //     });
    // }, Number.MIN_SAFE_INTEGER);
    commandStream.subscribe((c) => {
        console.log(c);
    }, Number.MIN_SAFE_INTEGER);
}

export namespace CommandPriority {
    export const beforeModel = 5;
    export const model = 4;
    export const afterModelBeforeUI = 3;
    export const UI = 2;
    export const afterUI = 1;
}

export type Command = {
    type: "FOREGROUND_COLOR" 
        | "OPEN_COLOR_PALETTE"
        | "SELECT_TOOL"
}

export type ForegroundColorCommand = Command & {
    color: string;
}

export type OpenDialogCommand = Command & {
    minX: number;
    maxX: number;
    y: number;
}

export type SelectToolCommand = Command & {
    name: string;
}