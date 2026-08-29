import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { styles } from "./styles";

export const SettingsPage = () => {
    const [systemInfo, setSystemInfo] = useState<Record<string, string> | null>(null);

    useEffect(() => {
        invoke<Record<string, string>>("get_system_info")
            .then(setSystemInfo)
            .catch(() => {});
    }, []);

    return (
        <div style={styles.page}>
            <div style={styles.title}>Settings</div>

            <div style={styles.section}>
                <div style={styles.sectionTitle}>System</div>
                {systemInfo && (
                    <>
                        <div style={styles.row}>
                            <span style={styles.label}>OS</span>
                            <span style={styles.value}>{systemInfo.os}</span>
                        </div>
                        <div style={styles.row}>
                            <span style={styles.label}>Architecture</span>
                            <span style={styles.value}>{systemInfo.arch}</span>
                        </div>
                    </>
                )}
            </div>

            <div style={styles.section}>
                <div style={styles.sectionTitle}>Data</div>
                <div style={styles.note}>
                    Weather, calendar, and reminder integrations are configured on the Rust side.
                </div>
            </div>

            <div style={styles.section}>
                <div style={styles.sectionTitle}>Display</div>
                <div style={styles.note}>
                    Ambient clock activates after 60 seconds of inactivity.
                </div>
            </div>
        </div>
    );
};
