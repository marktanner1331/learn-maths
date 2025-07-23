import { CommandPriority, commandStream } from "./command";
import type { CommandSubscription, IdleSubscription } from "../command-controller";

export type Model = {
    foregroundColor: string;
    selectedTool: string;
};

export namespace Model {
    let commandSub: IdleSubscription | undefined;
    let commandSub2: CommandSubscription | undefined;

    export function startStoring() {
        if (commandSub) {
            return;
        }

        commandSub = commandStream.addIdle(() => {
            
        });
    }

    export function loadModelFromStorage(): Model {
        let game = localStorage.getItem("get_to_the_end");

        if (game) {
            let parsedGame = JSON.parse(game);
            return <Model>parsedGame;
        } else {
            throw new Error("No model found in local storage.");
        }
    }

    export function hasModelInStorage(): boolean {
        return localStorage.getItem("get_to_the_end") != null;
    }

    export function removeModelFromStorage() {
        localStorage.removeItem("get_to_the_end");
    }

    export function stopStoring() {
        commandSub?.unsubscribe();
        commandSub = undefined;
    }

    export function resetModel(_model: Model) {
        Object.assign(_model, createEmptyModel());
    }

    export function updateModel(target: Model, source: Model) {
        Object.assign(target, source);
    }

    export function createEmptyModel(): Model {
        return {
            foregroundColor: "#ffffff",
            selectedTool: 'FreeHand'
        };
    }
}

export const model: Model = Model.createEmptyModel();
(window as any).model = model; // for debugging purposes