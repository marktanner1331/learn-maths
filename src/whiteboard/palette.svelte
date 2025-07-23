<script lang="ts">
    import { onMount } from "svelte";
    import type { Command, ForegroundColorCommand, OpenDialogCommand } from "./command";
    import { CommandPriority, commandStream} from "./command";

    let dialog: HTMLDialogElement;

    let colors = [
        "#FF0000",
        "#00FF00",
        "#0000FF",
        "#FFFF00",
        "#FF00FF",
        "#00FFFF",
        "#000000",
        "#FFFFFF",
        "#808080",
        "#800000",
        "#008000",
        "#000080",
    ];

    onMount(() => {
        commandStream.subscribe(onCommand, CommandPriority.UI);

        // close dialog when backdrop is clicked
        dialog.addEventListener("click", (event) => {
            if (event.target === dialog) {
                dialog.close();
            }
        });
    });

    function onCommand(c:Command) {
        switch(c.type) {
            case "OPEN_COLOR_PALETTE":
                dialog.showModal();

                let openDialog = <OpenDialogCommand>c;
                dialog.style.marginTop = openDialog.y + "px";
                
                if (window.innerWidth - openDialog.minX > 700) {
                    dialog.style.marginLeft = openDialog.minX + "px";
                    dialog.style.marginRight = '';
                } else if (openDialog.maxX > 700) {
                    dialog.style.marginLeft = 'auto';
                    dialog.style.marginRight = openDialog.maxX + "px";
                } else {
                    dialog.style.marginLeft = "auto";
                    dialog.style.marginRight = "auto";
                }


                break;
        }
    }

    function selectColor(color: string) {
        commandStream.root(<ForegroundColorCommand>{
            type: "FOREGROUND_COLOR",
            color
        });

        dialog.close();
    }
</script>

<dialog bind:this={dialog}>
    <palette>
        {#each colors as color}
            <div
                on:click={() => selectColor(color)}
                class="color"
                style="background-color: {color};"
            ></div>
        {/each}
    </palette>
</dialog>

<style lang="scss">
    dialog {
        margin: 0;
        padding: 0;
        outline: none;
    }

    palette {
        display: flex;
        flex-wrap: wrap;
        background: #333;
        border: 2px solid white;
        width: fit-content;
        padding: 5px;
        gap: 5px;
    }
    .color {
        width: 50px;
        height: 50px;
        cursor: pointer;
        border-radius: 5px;
        border: 1px solid white;
    }
</style>
