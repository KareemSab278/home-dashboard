import { invoke } from "@tauri-apps/api/core";
import type { CameraResult } from "../../Types";

export const Camera = {
    save: async (data: Blob): Promise<CameraResult> => {
        const buffer = await data.arrayBuffer();

        const bytes = Array.from(
            new Uint8Array(buffer)
        );

        const path: CameraResult =  await invoke<CameraResult>("save_photo", {
            data: bytes,
        });

        return path;
    },
};
