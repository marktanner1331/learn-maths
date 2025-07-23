import { type CommandSubscription } from "../../command-controller";
import { type Command, CommandPriority, commandStream, type SelectToolCommand } from "../command";
import { Delete } from "./delete";
import { Freehand } from "./freehand";
import { Line } from "./line";

export namespace ToolController {
    type Tool = {
        name: string,
        onSelect():void;
        onDeselect():void;
    }

    let tools: Tool[] = [Freehand, Line, Delete];
    let currentTool: Tool = undefined;
    let subscription: CommandSubscription;

    export function init() {
        subscription = commandStream.subscribe(onCommand, CommandPriority.UI);

        currentTool = Freehand;
        currentTool.onSelect();
    }

    function onCommand(c:Command) {
        switch(c.type) {
            case "SELECT_TOOL":
                let name = (<SelectToolCommand>c).name;
                if(currentTool && currentTool.name != name) {
                    currentTool.onDeselect();
                }

                currentTool = tools.find(x => x.name == name);
                currentTool.onSelect();
                break;
        }
    }

    export function destroy() {
        currentTool?.onDeselect();
        currentTool = undefined;
        subscription.unsubscribe();
    }
}