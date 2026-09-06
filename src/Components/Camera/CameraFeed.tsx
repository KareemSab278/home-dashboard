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
        const image = imageRef.current;

        if (!image) {
            setError("Camera is not ready");
            return;
        }

        if (!image.naturalWidth || !image.naturalHeight) {
            setError("Camera frame is not ready");
            return;
        }

        const canvas = document.createElement("canvas");

        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;

        const context = canvas.getContext("2d");

        if (!context) {
            setError("Could not create canvas");
            return;
        }

        context.drawImage(
            image,
            0,
            0,
            canvas.width,
            canvas.height
        );

        canvas.toBlob(
            async (blob) => {
                if (!blob) {
                    setError("Failed to capture photo");
                    return;
                }

                setPhoto(blob);
                setSaving(true);

                try {
                    const photoPath: CameraResult = await Camera.save(blob);
                    setPhotoPath(photoPath);
                } catch (err) {
                    console.error("Failed to save photo:", err);
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
                    src={CAMERA_STREAM_URL}
                    alt="Camera"
                    // crossOrigin="anonymous"

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