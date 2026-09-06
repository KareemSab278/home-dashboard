import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { invoke } from "@tauri-apps/api/core";
import { Camera } from "../../Helpers/Camera/Camera";
import { CameraResult } from "@/Types";
import { Buttons } from "../Button/Button";

// A local proxy in Rust forwards the ffmpeg MJPEG stream here and adds a CORS
// header so this frame can be drawn onto a canvas (see src-tauri/src/camera.rs).
const CAMERA_STREAM_URL = "http://127.0.0.1:8008";

export const CameraFeed = () => {
    const imageRef = useRef<HTMLImageElement>(null);

    const location = useLocation();

    const [error, setError] = useState<string | null>(null);
    const [photo, setPhoto] = useState<Blob | null>(null);
    const [photoPath, setPhotoPath] = useState<CameraResult | null>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (photoPath) {
            const timer = setTimeout(() => {
                setPhotoPath(null);
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [photoPath]);

    useEffect(() => {
        let active = true;

        const startCamera = async () => {
            try {
                setError(null);

                await invoke("start_camera_stream");

                if (!active) {
                    return;
                }
            } catch (err) {
                if (!active) return;

                console.error("Failed to start camera stream:", err);
                setError("Could not start camera");
            }
        };

        startCamera();

    }, [location.pathname]);

    const takePhoto = async () => {
        console.log("1. TAKE PHOTO CLICKED");

        const image = imageRef.current;

        if (!image) {
            console.error("2. NO IMAGE");
            setError("Camera is not ready");
            return;
        }

        console.log("2. IMAGE FOUND");
        console.log("naturalWidth:", image.naturalWidth);
        console.log("naturalHeight:", image.naturalHeight);
        console.log("complete:", image.complete);

        if (!image.naturalWidth || !image.naturalHeight) {
            console.error("3. IMAGE HAS NO DIMENSIONS");
            setError("Camera frame is not ready");
            return;
        }

        const canvas = document.createElement("canvas");

        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;

        console.log("3. CANVAS CREATED");

        const context = canvas.getContext("2d");

        if (!context) {
            console.error("4. NO CANVAS CONTEXT");
            setError("Could not create canvas");
            return;
        }

        console.log("4. CANVAS CONTEXT CREATED");

        try {
            context.drawImage(
                image,
                0,
                0,
                canvas.width,
                canvas.height
            );

            console.log("5. IMAGE DRAWN TO CANVAS");
        } catch (err) {
            console.error("5. DRAW IMAGE FAILED:", err);
            setError("Could not capture camera frame");
            return;
        }

        canvas.toBlob(
            async (blob) => {
                console.log("6. TOBLOB CALLBACK");

                if (!blob) {
                    console.error("7. BLOB IS NULL");
                    setError("Failed to capture photo");
                    return;
                }

                console.log("7. BLOB CREATED:", blob.size, "bytes");

                setPhoto(blob);
                setSaving(true);

                try {
                    console.log("8. CALLING Camera.save()");

                    const photoPath: CameraResult = await Camera.save(blob);

                    console.log("9. Camera.save() RETURNED:", photoPath);

                    setPhotoPath(photoPath);
                } catch (err) {
                    console.error("10. Camera.save() FAILED:", err);
                    setError("Failed to save photo");
                } finally {
                    setSaving(false);
                }
            },
            "image/jpeg",
            0.95
        );
    };

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div style={styles.container}>
            <div style={styles.cameraContainer}>
                <img
                    ref={imageRef}
                    crossOrigin="anonymous"
                    src={CAMERA_STREAM_URL}
                    alt="Camera"
                    
                    onLoad={() => {
                        console.log("CAMERA LOADED");
                        console.log("width:", imageRef.current?.naturalWidth);
                        console.log("height:", imageRef.current?.naturalHeight);
                    }}

                    onError={(e) => {
                        console.error("CAMERA ERROR", e);
                        setError("Camera stream failed");
                    }}

                    style={styles.video}
                />

                <div style={styles.status}>
                    {saving && <div>Saving photo...</div>}

                    {photoPath && (<div> Photo saved </div>)}
                </div>
                <Buttons.cam
                    title=""
                    onClick={takePhoto}
                    style={styles.shutterButton}
                />

            </div>


        </div>
    );
};

const styles = {
    container: {
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column" as const,
        alignItems: "center",
    },

    cameraContainer: {
        position: "relative" as const,
        flex: 1,
        width: "95%",
        height: "90%",
    },

    video: {
        width: "100%",
        height: "100%",
        objectFit: "cover" as const,
        background: "black",
        display: "block",
    },

    shutterButton: {
        position: "absolute" as const,
        left: "50%",
        bottom: 25,
        transform: "translateX(-50%)",

        width: 200,
        height: 200,
        borderRadius: "50%",

        background: "rgba(255, 255, 255, 0.1)",
        border: "2px solid rgba(255, 255, 255, 0.5)",
        backgroundClip: "padding-box" as const,

        boxShadow: "0 4px 14px rgba(0, 0, 0, 0.35)",

        cursor: "pointer",

        display: "flex",
        alignItems: "center",
        justifyContent: "center",

        zIndex: 10,
    },

    shutterInner: {
        width: 150,
        height: 150,
        borderRadius: "50%",
        background: "#fff",
        border: "3px solid #222",
        display: "block",
    },

    status: {
        position: "absolute" as const,
        top: 10,
        left: "50%",
        transform: "translateX(-50%)",
        textAlign: "center" as const,
    },
};