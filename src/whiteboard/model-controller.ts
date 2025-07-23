import type { Command, ForegroundColorCommand, SelectToolCommand } from "./command";
import { CommandPriority, commandStream } from "./command";
import type { CommandSubscription } from "../command-controller";
import { model } from "./model";
import { Model } from "./model";

export namespace ModelController {
    let subscription: CommandSubscription;

    export function startUpdatingModel() {
        if (subscription) {
            console.log("model is already being updated");
        }
        
        subscription = commandStream.subscribe(onCommand, CommandPriority.model);
    }

    function onCommand(c: Command) {
        switch (c.type) {
            case "FOREGROUND_COLOR":
                model.foregroundColor = (<ForegroundColorCommand>c).color;
                break;
            case "SELECT_TOOL":
                model.selectedTool = (<SelectToolCommand>c).name;
                break;
        }
    }

    export function stopUpdatingModel() {
        subscription.unsubscribe();
    }
}